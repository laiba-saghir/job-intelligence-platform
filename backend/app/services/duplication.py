import hashlib
from difflib import SequenceMatcher
from typing import Optional, Tuple
from sqlalchemy.orm import Session

from app.models.job import Job
from app.services.fake_detection import analyze_job


def normalize_text(text: str) -> str:
    """
    Normalize text for comparison.
    - Lowercase & Strip
    - Remove special characters
    - Remove common filler words (senior, jr, etc.)
    """
    if not text:
        return ""
    
    text = text.lower().strip()
    
    # Words that don't help identify unique jobs
    remove_words = {"senior", "junior", "sr", "jr", "lead", "intern", "internship"}
    words = [w for w in text.split() if w not in remove_words]
    
    # Keep only alphanumeric and spaces
    cleaned = "".join(c if c.isalnum() or c.isspace() else " " for c in " ".join(words))
    return " ".join(cleaned.split())


def generate_fingerprint(title: str, company: str, location: str = "") -> str:
    """
    Generate MD5 fingerprint for O(1) duplicate detection.
    """
    combined = f"{normalize_text(title)}|{normalize_text(company)}|{normalize_text(location)}"
    return hashlib.md5(combined.encode()).hexdigest()


def calculate_similarity(text1: str, text2: str) -> float:
    """Calculate fuzzy similarity between two strings (0-1)."""
    if not text1 or not text2:
        return 0.0
    return SequenceMatcher(None, normalize_text(text1), normalize_text(text2)).ratio()


def find_duplicate(job_data: dict, db: Session, threshold: float = 0.85) -> Optional[Job]:
    """
    Find duplicate job using Hybrid Strategy:
    1. Exact Match via Fingerprint Index (Fastest)
    2. Fuzzy Match on recent 500 jobs (Accurate)
    """
    title = job_data.get("title", "")
    company = job_data.get("company", "")
    location = job_data.get("location", "")
    
    # Step 1: Exact match using fingerprint index
    fingerprint = generate_fingerprint(title, company, location)
    exact_match = db.query(Job).filter(Job.fingerprint == fingerprint).first()
    if exact_match:
        return exact_match
    
    # Step 2: Fuzzy match (limit to last 500 for performance)
    recent_jobs = db.query(Job).order_by(Job.created_at.desc()).limit(500).all()
    for job in recent_jobs:
        title_sim = calculate_similarity(title, job.title)
        company_sim = calculate_similarity(company, job.company)
        
        # Both must be similar to be considered duplicate
        if title_sim >= threshold and company_sim >= threshold:
            return job
            
    return None


def merge_jobs(existing_job: Job, new_data: dict, db: Session) -> Job:
    """
    Smart Merge Strategy:
    - Sources: Combine unique sources (LinkedIn, Indeed, etc.)
    - Description: Always keep the longer/more detailed one
    - Requirements: Union of all skills mentioned
    - Duplicate Count: Increment automatically
    """
    # 1. Merge Sources
    existing_sources = set()
    if existing_job.sources:
        existing_sources.update(s.strip() for s in existing_job.sources.split(",") if s.strip())
    if existing_job.source:
        existing_sources.add(existing_job.source.strip())
    
    new_source = new_data.get("source")
    if new_source:
        existing_sources.add(new_source.strip())
    
    existing_job.sources = ",".join(sorted(filter(None, existing_sources)))
    
    # 2. Keep Longer Description
    new_desc = new_data.get("description") or ""
    if len(new_desc) > len(existing_job.description or ""):
        existing_job.description = new_desc
    
    # 3. Merge Requirements (Union)
    existing_reqs = set()
    if existing_job.requirements:
        existing_reqs.update(r.strip().lower() for r in existing_job.requirements.split(",") if r.strip())
    
    new_reqs = set()
    if new_data.get("requirements"):
        new_reqs.update(r.strip().lower() for r in new_data["requirements"].split(",") if r.strip())
    
    combined_reqs = existing_reqs | new_reqs
    if combined_reqs:
        existing_job.requirements = ",".join(sorted(combined_reqs))
    
    # 4. Fill Missing Data
    if new_data.get("salary_range") and not existing_job.salary_range:
        existing_job.salary_range = new_data["salary_range"]
    if new_data.get("url") and not existing_job.url:
        existing_job.url = new_data["url"]
    
    # 5. Increment Counter
    existing_job.duplicate_count = (existing_job.duplicate_count or 1) + 1
    
    db.commit()
    db.refresh(existing_job)
    return existing_job


def create_or_merge_job(job_data: dict, db: Session) -> Tuple[Job, bool]:
    """
    Main Entry Point: Analyze Fake Score -> Check Duplicate -> Create/Merge
    Returns: (Job Object, is_new_boolean)
    """
    # 1. FIRST: Run Fake Detection Analysis
    analyzed_data = analyze_job(job_data)
    
    # 2. Generate Fingerprint
    fingerprint = generate_fingerprint(
        analyzed_data.get("title", ""),
        analyzed_data.get("company", ""),
        analyzed_data.get("location", "")
    )
    
    # 3. Check for Duplicate
    duplicate = find_duplicate(analyzed_data, db)
    
    if duplicate:
        # MERGE with existing job
        merged_job = merge_jobs(duplicate, analyzed_data, db)
        return merged_job, False
    else:
        # CREATE New Job
        # Prepare clean data for DB insertion (remove non-column fields)
        db_data = {
            "title": analyzed_data.get("title"),
            "company": analyzed_data.get("company"),
            "location": analyzed_data.get("location"),
            "description": analyzed_data.get("description"),
            "requirements": analyzed_data.get("requirements"),
            "salary_range": analyzed_data.get("salary_range"),
            "source": analyzed_data.get("source"),
            "url": analyzed_data.get("url"),
            "fingerprint": fingerprint,
            "sources": analyzed_data.get("source"),
            "duplicate_count": 1,
            # Fake Detection Fields
            "fake_score": analyzed_data.get("fake_score", 0),
            "is_verified": analyzed_data.get("is_verified", False),
            "is_suspicious": analyzed_data.get("is_suspicious", False),
        }
        
        new_job = Job(**db_data)
        db.add(new_job)
        db.commit()
        db.refresh(new_job)
        return new_job, True