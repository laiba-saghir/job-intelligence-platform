from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Dict
from app.models.job import Job
from app.models.user import User
from app.models.skill import Skill
from app.models.application import Application


def get_overview_stats(db: Session, user: User) -> dict:
    """
    Get overall platform statistics.
    """
    total_jobs = db.query(Job).count()
    verified_jobs = db.query(Job).filter(Job.is_verified == True).count()
    suspicious_jobs = db.query(Job).filter(Job.is_suspicious == True).count()
    total_skills = db.query(Skill).count()
    total_applications = db.query(Application).filter(
        Application.user_id == user.id
    ).count()
    user_skills = len(user.skills) if user.skills else 0
    
    return {
        "total_jobs": total_jobs,
        "verified_jobs": verified_jobs,
        "suspicious_jobs": suspicious_jobs,
        "total_skills": total_skills,
        "total_applications": total_applications,
        "user_skills": user_skills,
    }


def get_application_analytics(db: Session, user: User) -> dict:
    """
    Get application statistics for current user.
    """
    applications = db.query(Application).filter(
        Application.user_id == user.id
    ).all()
    
    total = len(applications)
    
    # Count by status
    status_counts = {
        "applied": 0,
        "interview": 0,
        "rejected": 0,
        "offer": 0,
        "accepted": 0,
    }
    
    for app in applications:
        if app.status in status_counts:
            status_counts[app.status] += 1
    
    # Calculate rates
    if total == 0:
        success_rate = 0.0
        interview_rate = 0.0
        offer_rate = 0.0
    else:
        positive = (
            status_counts["interview"] +
            status_counts["offer"] +
            status_counts["accepted"]
        )
        success_rate = round((positive / total) * 100, 2)
        interview_rate = round(
            ((status_counts["interview"] + status_counts["offer"] + 
              status_counts["accepted"]) / total) * 100, 2
        )
        offer_rate = round(
            ((status_counts["offer"] + status_counts["accepted"]) / total) * 100, 2
        )
    
    return {
        "total": total,
        "by_status": status_counts,
        "success_rate": success_rate,
        "interview_rate": interview_rate,
        "offer_rate": offer_rate,
    }


def get_skill_demand(db: Session, limit: int = 10) -> List[dict]:
    """
    Get most in-demand skills across all jobs.
    
    DSA: Hash map for counting, sorting for ranking.
    """
    total_jobs = db.query(Job).count()
    
    if total_jobs == 0:
        return []
    
    # Count how many jobs require each skill
    skills = db.query(Skill).all()
    skill_demand = []
    
    for skill in skills:
        job_count = len(skill.jobs) if skill.jobs else 0
        if job_count > 0:
            demand_percentage = round((job_count / total_jobs) * 100, 2)
            skill_demand.append({
                "skill_name": skill.name,
                "job_count": job_count,
                "demand_percentage": demand_percentage,
            })
    
    # Sort by job_count descending
    skill_demand.sort(key=lambda x: x["job_count"], reverse=True)
    
    return skill_demand[:limit]


def get_job_trends(db: Session, days: int = 7) -> List[dict]:
    """
    Get job posting trends over last N days.
    """
    trends = []
    today = datetime.now().date()
    
    for i in range(days - 1, -1, -1):
        date = today - timedelta(days=i)
        next_date = date + timedelta(days=1)
        
        # Count jobs created on this date
        count = db.query(Job).filter(
            Job.created_at >= datetime.combine(date, datetime.min.time()),
            Job.created_at < datetime.combine(next_date, datetime.min.time())
        ).count()
        
        trends.append({
            "date": date.strftime("%Y-%m-%d"),
            "count": count,
        })
    
    return trends