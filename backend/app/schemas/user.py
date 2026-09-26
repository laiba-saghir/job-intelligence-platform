from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    """
    Schema for creating a new user
    """
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    """
    Schema for user login
    """
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """
    Schema for returning user data (without password)
    """
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """
    Schema for authentication token response
    """
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """
    Schema for token data
    """
    email: Optional[str] = None