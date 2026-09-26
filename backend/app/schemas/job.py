from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class JobCreate(BaseModel):
    """
    Schema for creating a new job
    """
    title: str
    company: str
    description: Optional[str] = None
    requirements: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    source: Optional[str] = None
    url: Optional[str] = None


class JobUpdate(BaseModel):
    """
    Schema for updating a job
    """
    title: Optional[str] = None
    company: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    source: Optional[str] = None
    url: Optional[str] = None
    match_score: Optional[float] = None


class JobResponse(BaseModel):
    """
    Schema for returning job data
    """
    id: int
    title: str
    company: str
    description: Optional[str]
    requirements: Optional[str]
    location: Optional[str]
    salary_range: Optional[str]
    source: Optional[str]
    url: Optional[str]
    match_score: float
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True