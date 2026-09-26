from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.models.skill import Skill
from app.models.user import User
from app.schemas.skill import SkillCreate, SkillResponse, UserSkillsUpdate
from app.routes.auth import get_current_user


router = APIRouter(prefix="/skills", tags=["Skills"])


@router.post("/", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def create_skill(
    skill: SkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new skill in master list
    """
    # Check if skill already exists
    existing = db.query(Skill).filter(Skill.name == skill.name).first()
    if existing:
        return existing
    
    new_skill = Skill(name=skill.name, category=skill.category)
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill


@router.get("/", response_model=List[SkillResponse])
def get_all_skills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all skills in master list
    """
    skills = db.query(Skill).all()
    return skills


@router.post("/me", response_model=List[SkillResponse])
def set_my_skills(
    skills_data: UserSkillsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Set current user's skills (replaces existing)
    """
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
    
    # Set user skills
    current_user.skills = skills
    db.commit()
    db.refresh(current_user)
    
    return current_user.skills


@router.get("/me", response_model=List[SkillResponse])
def get_my_skills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get current user's skills
    """
    return current_user.skills