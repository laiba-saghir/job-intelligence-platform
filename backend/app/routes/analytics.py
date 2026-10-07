from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.services.analytics import (
    get_overview_stats,
    get_application_analytics,
    get_skill_demand,
    get_job_trends,
)


router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview")
def get_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get overall platform statistics.
    """
    return get_overview_stats(db, current_user)


@router.get("/applications")
def get_applications_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get application statistics for current user.
    """
    return get_application_analytics(db, current_user)


@router.get("/skills")
def get_skills_analytics(
    limit: int = Query(10, description="Number of top skills to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get most in-demand skills.
    """
    return get_skill_demand(db, limit)


@router.get("/trends")
def get_trends(
    days: int = Query(7, description="Number of days to look back"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get job posting trends over last N days.
    """
    return get_job_trends(db, days)


@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get complete dashboard data (all analytics in one call).
    """
    return {
        "overview": get_overview_stats(db, current_user),
        "applications": get_application_analytics(db, current_user),
        "top_skills": get_skill_demand(db, 10),
        "recent_trends": get_job_trends(db, 7),
    }