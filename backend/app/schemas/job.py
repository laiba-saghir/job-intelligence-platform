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
    id: int
    title: str
    company: str
    description: Optional[str] = None
    requirements: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    source: Optional[str] = None
    url: Optional[str] = None
    match_score: float
    
    # ✅ Naye Fields Add Karo
    sources: Optional[str] = None
    duplicate_count: int = 1
    fake_score: int = 0
    is_verified: bool = False
    is_suspicious: bool = False
    is_active: bool = True
    
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
