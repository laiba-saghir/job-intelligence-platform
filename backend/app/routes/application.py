from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import func

from app.database.connection import get_db
from app.models.application import Application
from app.models.job import Job
from app.models.user import User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationResponse,
    ApplicationWithJob,
    ApplicationStats
)
from app.routes.auth import get_current_user


router = APIRouter(prefix="/applications", tags=["Applications"])

# Valid statuses
VALID_STATUSES = ["applied", "interview", "rejected", "offer", "accepted"]


# ============================================
# APPLY TO JOB
# ============================================
@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_to_job(
    application: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Apply to a job.
    User can only apply once per job.
    """
    # Check if job exists
    job = db.query(Job).filter(Job.id == application.job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check if already applied
    existing = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.job_id == application.job_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this job"
        )
    
    # Create application
    new_application = Application(
        user_id=current_user.id,
        job_id=application.job_id,
        notes=application.notes,
        status="applied"
    )
    
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    
    return new_application


# ============================================
# GET ALL MY APPLICATIONS
# ============================================
@router.get("/", response_model=List[ApplicationWithJob])
def get_my_applications(
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all applications of current user.
    Optional filter by status.
    """
    query = db.query(Application).filter(Application.user_id == current_user.id)
    
    if status_filter:
        query = query.filter(Application.status == status_filter)
    
    applications = query.order_by(Application.applied_at.desc()).all()
    
    # Enrich with job details
    result = []
    for app in applications:
        result.append({
            "id": app.id,
            "job_id": app.job_id,
            "job_title": app.job.title if app.job else "Unknown",
            "company": app.job.company if app.job else "Unknown",
            "location": app.job.location if app.job else None,
            "status": app.status,
            "notes": app.notes,
            "applied_at": app.applied_at,
            "updated_at": app.updated_at,
        })
    
    return result


# ============================================
# GET SINGLE APPLICATION
# ============================================
@router.get("/{application_id}", response_model=ApplicationWithJob)
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific application
    """
    app = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    return {
        "id": app.id,
        "job_id": app.job_id,
        "job_title": app.job.title if app.job else "Unknown",
        "company": app.job.company if app.job else "Unknown",
        "location": app.job.location if app.job else None,
        "status": app.status,
        "notes": app.notes,
        "applied_at": app.applied_at,
        "updated_at": app.updated_at,
    }


# ============================================
# UPDATE APPLICATION STATUS
# ============================================
@router.put("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: int,
    application_update: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update application status and/or notes
    """
    app = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Validate status
    if application_update.status:
        if application_update.status not in VALID_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {VALID_STATUSES}"
            )
        app.status = application_update.status
    
    if application_update.notes is not None:
        app.notes = application_update.notes
    
    db.commit()
    db.refresh(app)
    
    return app


# ============================================
# DELETE APPLICATION
# ============================================
@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete an application
    """
    app = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    db.delete(app)
    db.commit()
    return None


# ============================================
# GET APPLICATION STATISTICS
# ============================================
@router.get("/stats/me", response_model=ApplicationStats)
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get application statistics for current user
    """
    # Get counts by status
    status_counts = db.query(
        Application.status,
        func.count(Application.id)
    ).filter(
        Application.user_id == current_user.id
    ).group_by(Application.status).all()
    
    # Build stats dict
    stats = {status: 0 for status in VALID_STATUSES}
    total = 0
    
    for status_name, count in status_counts:
        stats[status_name] = count
        total += count
    
    return {
        "total_applications": total,
        "applied": stats.get("applied", 0),
        "interview": stats.get("interview", 0),
        "rejected": stats.get("rejected", 0),
        "offer": stats.get("offer", 0),
        "accepted": stats.get("accepted", 0),
    }