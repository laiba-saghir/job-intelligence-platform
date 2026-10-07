from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ApplicationCreate(BaseModel):
    """
    Schema for creating a new application
    """
    job_id: int
    notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    """
    Schema for updating an application
    """
    status: Optional[str] = None  # applied, interview, rejected, offer, accepted
    notes: Optional[str] = None


class ApplicationResponse(BaseModel):
    """
    Schema for returning application data
    """
    id: int
    user_id: int
    job_id: int
    status: str
    notes: Optional[str]
    applied_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class ApplicationWithJob(BaseModel):
    """
    Schema for returning application with job details
    """
    id: int
    job_id: int
    job_title: str
    company: str
    location: Optional[str]
    status: str
    notes: Optional[str]
    applied_at: datetime
    updated_at: Optional[datetime]


class ApplicationStats(BaseModel):
    """
    Schema for application statistics
    """
    total_applications: int
    applied: int
    interview: int
    rejected: int
    offer: int
    accepted: int