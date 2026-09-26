from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routes
from app.routes import auth

# Create the FastAPI application instance
app = FastAPI(
    title="Job Intelligence Platform",
    description="AI-powered job tracking and matching system",
    version="1.0.0"
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


@app.get("/")
def read_root():
    return {
        "message": "Welcome to Job Intelligence Platform!",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "auth": "/auth"
        }
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "job-intelligence-api"
    }