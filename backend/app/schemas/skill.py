from pydantic import BaseModel
from typing import List, Optional


class SkillCreate(BaseModel):
    """
    Schema for creating a skill
    """
    name: str
    category: Optional[str] = None


class SkillResponse(BaseModel):
    """
    Schema for returning skill data
    """
    id: int
    name: str
    category: Optional[str]

    class Config:
        from_attributes = True


class UserSkillsUpdate(BaseModel):
    """
    Schema for updating user skills
    """
    skill_names: List[str]  # e.g., ["Python", "SQL", "Git"]


class MatchAnalysis(BaseModel):
    """
    Schema for job match analysis
    """
    job_id: int
    job_title: str
    company: str
    match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    total_required: int
    total_matched: int