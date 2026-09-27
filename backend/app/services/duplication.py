import hashlib
from difflib import SequenceMatcher
from typing import Optional
from sqlalchemy.orm import Session
from app.models.job import Job


def normalize_text(text: str) -> str:
    """
    Normalize text for comparison.
    - Lowercase
    - Remove extra spaces
    - Remove special characters
    """
    if not text:
        return ""
    
    # Lowercase and strip
    text = text.lower().strip()
    
    # Remove common words that don't help identify jobs
    remove_words = ["senior", "junior", "sr", "jr", "lead", "intern", "internship"]
    words = text.split()
    words = [w for w in words if w not in remove_words]
    
    # Remove special characters
    cleaned = "".join(c if c.isalnum() or c.isspace() else " " for c in " ".join(words))
    
    # Remove extra spaces
    return " ".join(cleaned.split())


def generate_fingerprint(title: str, company: str, location: str = "") -> str:
    """
    Generate MD5 fingerprint for a job.
    Used for O(1) duplicate detection.
    
    Args:
        title: Job title
        company: Company name
        location: Job location
    
    Returns:
        MD5 hash string
    """
    normalized_title = normalize_text(title)
    normalized_company = normalize_text(company)
    normalized_location = normalize_text(location) if location else ""
    
    combined = f"{normalized_title}|{normalized_company}|{normalized_location}"
    return hashlib.md5(combined.encode()).hexdigest()


def calculate_similarity(text1: str, text2: str) -> float:
    """
    Calculate similarity between two strings (0-1).
    Uses SequenceMatcher for fuzzy matching.
    """
    if not text1 or not text2:
        return 0.0
    return SequenceMatcher(None, normalize_text(text1), normalize_text(text2)).ratio()


def find_duplicate(job_data: dict, db: Session, threshold: float = 0.85) -> Optional[Job]:
    """
    Find duplicate job in database.
    
    Strategy:
    1. Exact match by fingerprint (fastest - O(1) with index)
    2. Fuzzy match by title + company (slower but catches variations)
    
    Args:
        job_data: Dict with job info (title, company, location)
        db: Database session
        threshold: Similarity threshold (0.85 = 85% similar)
    
    Returns:
        Job object if duplicate found, None otherwise
    """
    title = job_data.get("title", "")
    company = job_data.get("company", "")
    location = job_data.get("location", "")
    
    # Step 1: Exact match using fingerprint (O(1))
    fingerprint = generate_fingerprint(title, company, location)
    exact_match = db.query(Job).filter(Job.fingerprint == fingerprint).first()
    
    if exact_match:
        return exact_match
    
    # Step 2: Fuzzy match (only check recent jobs for performance)
    # Get last 500 jobs to compare
    recent_jobs = db.query(Job).order_by(Job.created_at.desc()).limit(500).all()
    
    for job in recent_jobs:
        title_sim = calculate_similarity(title, job.title)
        company_sim = calculate_similarity(company, job.company)
        
        # Both title AND company should be similar
        if title_sim >= threshold and company_sim >= threshold:
            return job
    
    return None


def merge_jobs(existing_job: Job, new_data: dict, db: Session) -> Job:
    """
    Merge new job data into existing job.
    
    Merge Strategy:
    - Sources: Combine unique sources
    - Description: Keep longer/better description
    - Requirements: Union of both requirements
    - Salary: Keep higher/lower range if available
    - duplicate_count: Increment
    """
    # 1. Merge sources
    existing_sources = set()
    if existing_job.sources:
        existing_sources = set(s.strip() for s in existing_job.sources.split(","))
    if existing_job.source:
        existing_sources.add(existing_job.source.strip())
    
    new_source = new_data.get("source")
    if new_source:
        existing_sources.add(new_source.strip())
    
    existing_job.sources = ",".join(sorted(filter(None, existing_sources)))
    
    # 2. Keep longer description
    existing_desc = existing_job.description or ""
    new_desc = new_data.get("description") or ""
    if len(new_desc) > len(existing_desc):
        existing_job.description = new_desc
    
    # 3. Merge requirements (union of skills)
    existing_reqs = set()
    if existing_job.requirements:
        existing_reqs = set(r.strip().lower() for r in existing_job.requirements.split(","))
    
    new_reqs = set()
    if new_data.get("requirements"):
        new_reqs = set(r.strip().lower() for r in new_data["requirements"].split(","))
    
    combined_reqs = existing_reqs | new_reqs
    if combined_reqs:
        existing_job.requirements = ",".join(sorted(combined_reqs))
    
    # 4. Update salary if we have new info
    if new_data.get("salary_range") and not existing_job.salary_range:
        existing_job.salary_range = new_data["salary_range"]
    
    # 5. Increment duplicate count
    existing_job.duplicate_count = (existing_job.duplicate_count or 1) + 1
    
    # 6. Save URL if not exists
    if new_data.get("url") and not existing_job.url:
        existing_job.url = new_data["url"]
    
    db.commit()
    db.refresh(existing_job)
    
    return existing_job


def create_or_merge_job(job_data: dict, db: Session) -> tuple:
    """
    Main function: Create new job or merge with existing.
    
    Returns:
        Tuple of (job, is_new)
        - is_new=True: New job was created
        - is_new=False: Job was merged with existing
    """
    # Generate fingerprint for new job
    fingerprint = generate_fingerprint(
        job_data.get("title", ""),
        job_data.get("company", ""),
        job_data.get("location", "")
    )
    
    # Check for duplicate
    duplicate = find_duplicate(job_data, db)
    
    if duplicate:
        # Merge with existing
        merged_job = merge_jobs(duplicate, job_data, db)
        return merged_job, False
    else:
        # Create new job
        job_data["fingerprint"] = fingerprint
        if job_data.get("source"):
            job_data["sources"] = job_data["source"]
        
        new_job = Job(**job_data)
        db.add(new_job)
        db.commit()
        db.refresh(new_job)
        return new_job, True