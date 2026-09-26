from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base
from app.models.skill import job_skills


class Job(Base):
    """
    Job model representing a job posting
    """
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    description = Column(Text)
    requirements = Column(Text)
    location = Column(String)
    salary_range = Column(String)
    source = Column(String)
    url = Column(String)
    match_score = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    skills = relationship("Skill", secondary=job_skills, backref="jobs")

    def __repr__(self):
        return f"<Job(id={self.id}, title={self.title}, company={self.company})>"