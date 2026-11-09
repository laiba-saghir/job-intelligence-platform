# ============================================
# KAGGLE JOBS IMPORTER (Updated)
# ============================================

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
from app.database.connection import SessionLocal
from app.services.duplication import create_or_merge_job


def safe_str(value, default=""):
    """Safely convert value to string."""
    if pd.isna(value) or value is None:
        return default
    s = str(value).strip()
    return s if s and s.lower() != "not available" else default


def import_kaggle_jobs(csv_path: str, limit: int = 500):
    """
    Import jobs from Kaggle CSV into JobCocoon database.
    """
    print(f"📂 Loading CSV: {csv_path}\n")
    
    if not os.path.exists(csv_path):
        print(f"❌ File not found: {csv_path}")
        return
    
    df = pd.read_csv(csv_path, nrows=limit)
    print(f"✅ Loaded {len(df)} rows\n")
    
    db = SessionLocal()
    imported = 0
    merged = 0
    failed = 0
    
    for idx, row in df.iterrows():
        try:
            # Map CSV columns to Job model (EXACT column names)
            job_data = {
                "title": safe_str(row.get("Job Title")),
                "company": safe_str(row.get("Company Name"), "Unknown Company"),
                "location": safe_str(row.get("Location")) or None,
                "description": safe_str(row.get("Job Description"))[:5000] or None,
                "requirements": safe_str(row.get("Skills")) or None,
                "salary_range": safe_str(row.get("Salary")) or None,
                "source": "Kaggle/2026",
                "url": None,
            }
            
            # Skip if title missing
            if not job_data["title"]:
                failed += 1
                continue
            
            # Use deduplication logic
            job, is_new = create_or_merge_job(job_data, db)
            
            # Add skills to job (from Skills column)
            if is_new and job_data["requirements"]:
                skills_str = job_data["requirements"]
                skill_names = [s.strip() for s in skills_str.split(",") if s.strip()]
                
                from app.models.skill import Skill
                skills = []
                for skill_name in skill_names[:10]:  # Max 10 skills
                    if len(skill_name) > 50:  # Skip too-long names
                        continue
                    skill = db.query(Skill).filter(Skill.name == skill_name).first()
                    if not skill:
                        skill = Skill(name=skill_name)
                        db.add(skill)
                        db.commit()
                        db.refresh(skill)
                    skills.append(skill)
                
                if skills:
                    job.skills = skills
                    db.commit()
            
            if is_new:
                imported += 1
            else:
                merged += 1
            
            if (imported + merged) % 50 == 0 and (imported + merged) > 0:
                print(f"   Progress: {imported + merged} processed ({imported} new, {merged} merged)")
                
        except Exception as e:
            failed += 1
            if failed <= 5:
                print(f"⚠️ Row {idx} failed: {e}")
    
    db.close()
    
    print("\n" + "=" * 50)
    print(f"✅ Import complete!")
    print(f"   New jobs: {imported}")
    print(f"   Merged (duplicates): {merged}")
    print(f"   Failed: {failed}")
    print("=" * 50)


if __name__ == "__main__":
    CSV_PATH = "data/Global_AI_and_Tech_Jobs_Dataset_2026.csv"
    LIMIT = 500  # Start with 500, can increase later
    
    print(f"🚀 Starting import from {CSV_PATH}")
    print(f"   Limit: {LIMIT} rows\n")
    
    import_kaggle_jobs(CSV_PATH, LIMIT)