from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from sqlalchemy.sql import func
from app.database.connection import Base

class Job(Base):
    """
    Job model representing a job posting
    """
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    description = Column(Text)  # Text for longer descriptions
    requirements = Column(Text)  # Job requirements
    location = Column(String)
    salary_range = Column(String)
    source = Column(String)  # Where job came from (LinkedIn, Indeed, etc.)
    url = Column(String)
    match_score = Column(Float, default=0.0)  # Calculated match score
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Job(id={self.id}, title={self.title}, company={self.company})>"