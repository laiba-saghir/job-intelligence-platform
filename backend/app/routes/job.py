from app.services.duplication import create_or_merge_job
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import or_

from app.database.connection import get_db
from app.models.job import Job
from app.models.skill import Skill
from app.schemas.job import JobCreate, JobUpdate, JobResponse
from app.schemas.skill import UserSkillsUpdate
from app.routes.auth import get_current_user
from app.models.user import User
from app.services.matching import rank_jobs_for_user


router = APIRouter(prefix="/jobs", tags=["Jobs"])


# ============================================
# CREATE JOB
# ============================================
@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new job posting.
    Automatically detects and merges duplicates.
    """
    job_data = job.dict()
    
    # Create or merge with existing
    result_job, is_new = create_or_merge_job(job_data, db)
    
    return result_job


# ============================================
# GET ALL JOBS (with search + pagination)
# ============================================
@router.get("/", response_model=List[JobResponse])
def get_jobs(
    skip: int = Query(0, description="Number of jobs to skip"),
    limit: int = Query(100, description="Number of jobs to return"),
    search: Optional[str] = Query(None, description="Search by title or company"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all jobs with optional search and pagination
    """
    query = db.query(Job)
    
    # Search functionality
    if search:
        query = query.filter(
            or_(
                Job.title.contains(search),
                Job.company.contains(search)
            )
        )
    
    jobs = query.offset(skip).limit(limit).all()
    return jobs


# ============================================
# GET MATCHED JOBS (with match score) ⭐
# ============================================
@router.get("/matched/for-me")
def get_matched_jobs(
    limit: int = Query(20, description="Number of jobs to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get jobs ranked by match score for current user
    """
    jobs = db.query(Job).all()
    
    if not jobs:
        return {"jobs": [], "user_skills": []}
    
    ranked = rank_jobs_for_user(current_user, jobs)[:limit]
    
    response = []
    for item in ranked:
        job = item["job"]
        response.append({
            "job_id": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "match_score": item["match_score"],
            "matched_skills": item["matched_skills"],
            "missing_skills": item["missing_skills"]
        })
    
    return {
        "user_skills": [s.name for s in current_user.skills],
        "total_jobs": len(jobs),
        "jobs": response
    }


# ============================================
# GET SINGLE JOB
# ============================================
@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific job by ID
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    return job


# ============================================
# UPDATE JOB
# ============================================
@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_update: JobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a job
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Update only provided fields
    for key, value in job_update.dict(exclude_unset=True).items():
        setattr(job, key, value)
    
    db.commit()
    db.refresh(job)
    return job


# ============================================
# DELETE JOB
# ============================================
@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a job
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    db.delete(job)
    db.commit()
    return None


# ============================================
# ADD SKILLS TO JOB ⭐ (Step 7 merged)
# ============================================
@router.post("/{job_id}/skills")
def add_skills_to_job(
    job_id: int,
    skills_data: UserSkillsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add skills to a job (replaces existing skills)
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    skills = []
    for skill_name in skills_data.skill_names:
        # Find or create skill
        skill = db.query(Skill).filter(Skill.name == skill_name).first()
        if not skill:
            skill = Skill(name=skill_name)
            db.add(skill)
            db.commit()
            db.refresh(skill)
        skills.append(skill)
    
    # Set job skills
    job.skills = skills
    db.commit()
    db.refresh(job)
    
    return {
        "job_id": job.id,
        "title": job.title,
        "company": job.company,
        "skills": [s.name for s in job.skills]
    }
# ============================================
# REPORT FAKE JOB
# ============================================
from pydantic import BaseModel


class ReportRequest(BaseModel):
    reason: str


@router.post("/{job_id}/report")
def report_fake_job(
    job_id: int,
    report: ReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Report a job as fake/suspicious.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job.fake_score = min(100, (job.fake_score or 0) + 25)
    
    if job.fake_score >= 50:
        job.is_suspicious = True
    
    db.commit()
    db.refresh(job)
    
    return {
        "message": "Report submitted. Thank you!",
        "job_id": job.id,
        "new_fake_score": job.fake_score,
        "is_suspicious": job.is_suspicious,
        "reported_by": current_user.email,
        "reason": report.reason
    }


# ============================================
# GET SUSPICIOUS JOBS
# ============================================
@router.get("/suspicious/list")
def get_suspicious_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get list of suspicious jobs.
    """
    jobs = db.query(Job).filter(Job.is_suspicious == True).all()
    
    return {
        "total": len(jobs),
        "jobs": [
            {
                "id": j.id,
                "title": j.title,
                "company": j.company,
                "fake_score": j.fake_score,
                "source": j.sources or j.source,
            }
            for j in jobs
        ]
    }