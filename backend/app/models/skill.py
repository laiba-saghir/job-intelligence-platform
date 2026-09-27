from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.database.connection import Base


# Association table: User ↔ Skills (many-to-many)
user_skills = Table(
    'user_skills',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('skill_id', Integer, ForeignKey('skills.id'), primary_key=True)
)


# Association table: Job ↔ Skills (many-to-many)
job_skills = Table(
    'job_skills',
    Base.metadata,
    Column('job_id', Integer, ForeignKey('jobs.id'), primary_key=True),
    Column('skill_id', Integer, ForeignKey('skills.id'), primary_key=True)
)


class Skill(Base):
    """
    Skill model - master list of skills
    """
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String)  # e.g., "Backend", "Frontend", "Database"

    def __repr__(self):
        return f"<Skill(id={self.id}, name={self.name})>"