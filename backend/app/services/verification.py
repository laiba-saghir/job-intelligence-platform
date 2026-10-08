import secrets
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.verification_token import VerificationToken
from app.services.email import send_verification_email


# Token expiry: 24 hours
TOKEN_EXPIRY_HOURS = 24


def generate_token() -> str:
    """
    Generate a secure random token.
    """
    return secrets.token_urlsafe(32)


def create_verification_token(user: User, db: Session) -> str:
    """
    Create a new verification token for user.
    Deletes any existing unused tokens.
    """
    # Delete existing unused tokens
    db.query(VerificationToken).filter(
        VerificationToken.user_id == user.id,
        VerificationToken.is_used == False
    ).delete()
    
    # Generate new token
    token = generate_token()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRY_HOURS)
    
    # Save to database
    verification_token = VerificationToken(
        user_id=user.id,
        token=token,
        expires_at=expires_at,
        is_used=False
    )
    
    db.add(verification_token)
    db.commit()
    db.refresh(verification_token)
    
    return token


def send_verification(user: User, db: Session) -> bool:
    """
    Create token and send verification email.
    """
    token = create_verification_token(user, db)
    return send_verification_email(user.email, user.name, token)


def verify_user_email(token: str, db: Session) -> tuple:
    """
    Verify user email using token.
    
    Returns:
        (success: bool, message: str, user: User or None)
    """
    # Find token
    verification_token = db.query(VerificationToken).filter(
        VerificationToken.token == token
    ).first()
    
    if not verification_token:
        return False, "Invalid verification link", None
    
    # Check if already used
    if verification_token.is_used:
        return False, "This verification link has already been used", None
    
    # Check expiry
    now = datetime.now(timezone.utc)
    expires_at = verification_token.expires_at
    
    # Make timezone-aware if naive
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if now > expires_at:
        return False, "Verification link has expired. Please request a new one.", None
    
    # Get user
    user = db.query(User).filter(User.id == verification_token.user_id).first()
    if not user:
        return False, "User not found", None
    
    # Mark as verified
    user.is_verified = True
    user.verified_at = datetime.now(timezone.utc)
    verification_token.is_used = True
    
    db.commit()
    db.refresh(user)
    
    return True, "Email verified successfully! You can now login.", user