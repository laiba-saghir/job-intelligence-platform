import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# SMTP Configuration
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))


def send_verification_email(to_email: str, user_name: str, verification_token: str) -> bool:
    """
    Send verification email to user.
    
    Args:
        to_email: Recipient email address
        user_name: User's name
        verification_token: Unique verification token
    
    Returns:
        bool: True if email sent successfully
    """
    try:
        # Frontend URL for verification link
        frontend_url = os.getenv("FRONTEND_URL", "http://127.0.0.1:5500")
        
        # Verification link (with /frontend/ path)
        verification_link = (
            f"{frontend_url}/frontend/pages/verify-email.html"
            f"?token={verification_token}"
        )
        
        # Create email
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "🦋 Verify Your JobCocoon Account"
        msg['From'] = f"JobCocoon <{SMTP_EMAIL}>"
        msg['To'] = to_email
        
        # HTML Email Template
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{
                    font-family: 'Inter', Arial, sans-serif;
                    background-color: #fef3c7;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 600px;
                    margin: 40px auto;
                    background: #ffffff;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 10px 40px rgba(69, 26, 3, 0.15);
                }}
                .header {{
                    background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%);
                    padding: 40px 30px;
                    text-align: center;
                }}
                .header h1 {{
                    color: #451a03;
                    font-size: 28px;
                    margin: 0 0 8px 0;
                }}
                .header p {{
                    color: #92400e;
                    font-size: 12px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    margin: 0;
                }}
                .content {{
                    padding: 40px 30px;
                }}
                .content h2 {{
                    color: #451a03;
                    font-size: 22px;
                    margin-top: 0;
                }}
                .content p {{
                    color: #64748b;
                    line-height: 1.6;
                    font-size: 15px;
                }}
                .btn {{
                    display: inline-block;
                    padding: 14px 32px;
                    background: linear-gradient(135deg, #d97706, #92400e);
                    color: #ffffff !important;
                    text-decoration: none;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 15px;
                    margin: 20px 0;
                }}
                .link-box {{
                    background: #fef3c7;
                    padding: 15px;
                    border-radius: 10px;
                    word-break: break-all;
                    font-size: 12px;
                    color: #92400e;
                    margin: 20px 0;
                }}
                .footer {{
                    padding: 20px 30px;
                    background: #fffbeb;
                    text-align: center;
                    font-size: 12px;
                    color: #92400e;
                    border-top: 1px solid #fde68a;
                }}
                .footer a {{
                    color: #d97706;
                    text-decoration: none;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🦋 JobCocoon</h1>
                    <p>Transform Your Career</p>
                </div>
                
                <div class="content">
                    <h2>Welcome, {user_name}! 🎉</h2>
                    
                    <p>
                        Thank you for joining <strong>JobCocoon</strong> — your cozy corner for 
                        career transformation. We're excited to help you find your dream job!
                    </p>
                    
                    <p>
                        To activate your account, please verify your email by clicking 
                        the button below:
                    </p>
                    
                    <div style="text-align: center;">
                        <a href="{verification_link}" class="btn">
                            ✨ Verify My Email
                        </a>
                    </div>
                    
                    <p style="font-size: 13px;">
                        Or copy and paste this link in your browser:
                    </p>
                    <div class="link-box">
                        {verification_link}
                    </div>
                    
                    <p style="font-size: 13px; color: #92400e;">
                        ⏰ This link will expire in <strong>24 hours</strong>.
                    </p>
                    
                    <p style="font-size: 13px;">
                        If you didn't create a JobCocoon account, please ignore this email.
                    </p>
                </div>
                
                <div class="footer">
                    <p>Made with 💛 by JobCocoon Team</p>
                    <p style="margin-top: 8px;">
                        <a href="{frontend_url}">Visit JobCocoon</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text fallback
        text_content = f"""
        Welcome to JobCocoon, {user_name}!
        
        Thank you for joining JobCocoon — your cozy corner for career transformation.
        
        Please verify your email by clicking this link:
        {verification_link}
        
        This link will expire in 24 hours.
        
        If you didn't create a JobCocoon account, please ignore this email.
        
        Made with love,
        JobCocoon Team
        """
        
        # Attach both versions
        msg.attach(MIMEText(text_content, 'plain'))
        msg.attach(MIMEText(html_content, 'html'))
        
        # Connect to SMTP and send
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
        
        print(f"✅ Verification email sent to {to_email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send email: {str(e)}")
        return Falsee