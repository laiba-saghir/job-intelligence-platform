from pydantic import BaseModel
from typing import List, Dict


class OverviewStats(BaseModel):
    """
    Overall platform statistics
    """
    total_jobs: int
    verified_jobs: int
    suspicious_jobs: int
    total_skills: int
    total_applications: int
    user_skills: int


class ApplicationAnalytics(BaseModel):
    """
    Application statistics breakdown
    """
    total: int
    by_status: Dict[str, int]
    success_rate: float  # (interview + offer + accepted) / total * 100
    interview_rate: float
    offer_rate: float


class SkillDemand(BaseModel):
    """
    Skill demand analysis
    """
    skill_name: str
    job_count: int
    demand_percentage: float


class JobTrend(BaseModel):
    """
    Job posting trend
    """
    date: str
    count: int


class DashboardResponse(BaseModel):
    """
    Complete dashboard data
    """
    overview: OverviewStats
    applications: ApplicationAnalytics
    top_skills: List[SkillDemand]
    recent_trends: List[JobTrend]