from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database URL - using SQLite for now (no setup needed!)
SQLALCHEMY_DATABASE_URL = "sqlite:///./job_intelligence.db"

# Create the database engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # Only needed for SQLite
)

# Create a session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    """
    Dependency that provides a database session
    Used in route handlers
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()