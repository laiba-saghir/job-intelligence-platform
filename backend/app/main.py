from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routes (aapki file names ke hisaab se)
from app.routes import auth, job, skill, application

# Create the FastAPI application instance
app = FastAPI(
    title="Job Intelligence Platform",
    description="AI-powered job tracking and matching system with deduplication, fake job detection, and application tracking",
    version="1.0.0",
    # Yeh setting token ko browser mein save rakhti hai taake refresh par login na karna pade
    swagger_ui_parameters={"persistAuthorization": True}
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(job.router)
app.include_router(skill.router)
app.include_router(application.router)


@app.get("/")
def read_root():
    """
    Root endpoint - returns API information
    """
    return {
        "message": "Welcome to Job Intelligence Platform!",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "auth": "/auth",
            "jobs": "/jobs",
            "skills": "/skills",
            "applications": "/applications"
        }
    }


@app.get("/health")
def health_check():
    """
    Health check endpoint - verifies the API is running
    """
    return {
        "status": "healthy",
        "service": "job-intelligence-api"
    }