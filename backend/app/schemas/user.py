from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional
import re


class UserCreate(BaseModel):
    """
    Schema for creating a new user
    """
    name: str
    email: EmailStr
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        """Password validation"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        """Name validation"""
        if len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters')
        return v.strip()


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
    is_verified: bool
    verified_at: Optional[datetime] = None
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


class ResendVerificationRequest(BaseModel):
    """
    Schema for resending verification email
    """
    email: EmailStr