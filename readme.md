**THEEK HAI LAIBA! 🎯** Yeh lo **EIK hi complete code** — bas `Ctrl+A`, `Delete`, aur paste.

---

**VS Code mein `readme.md` kholo. Sab kuch select karo, delete karo, aur yeh poora paste kar do:**

```markdown
# 🌿 JobCocoon

> **Transform Your Career** — An AI-powered job intelligence platform with smart matching, email verification, and a beautiful pastel-green dashboard.

[![Python](https://img.shields.io/badge/Python-3.13+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4+-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)](https://www.chartjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

---

## 📖 Overview

**JobCocoon** is a full-stack job intelligence platform that revolutionizes the job hunting experience. From **email-verified registration** to a **beautiful pastel-green dashboard**, everything is built with production-grade practices.

### 🎯 What It Does

- 📧 **Email Verification** — Gmail SMTP with secure token flow
- 🔐 **JWT Authentication** — Production-grade security
- 💼 **Jobs Management** — Full CRUD with deduplication
- 🧠 **Smart Matching** — Custom DSA algorithm
- 🛡️ **Fake Detection** — AI-powered scam filtering
- 📊 **Analytics** — Real-time insights with Chart.js
- 📝 **Application Tracker** — Track your journey
- 🌿 **Pastel Green UI** — Cozy, professional design

> **"Your cozy corner for career transformation."** 🦋

---

## ✨ Features

### ✅ Backend (100% Complete)

| Authentication | Jobs Management |
|---|---|
| JWT-based auth (OAuth2) | Full CRUD operations |
| bcrypt password hashing | Advanced search & pagination |
| **Email verification** (Gmail SMTP) | **Smart deduplication** (MD5) |
| Password strength validation | **Fake job detection** |
| Protected routes | Community reporting |
| Resend verification | 24-hour token expiry |

| Skills System | Matching Algorithm ⭐ |
|---|---|
| Master skills database | Custom DSA-based engine |
| User ↔ Skills (many-to-many) | Match score (0-100%) |
| Job ↔ Skills (many-to-many) | Matched/missing skills |
| Skill demand analysis | Jobs ranked by score |

| Applications | Analytics |
|---|---|
| Apply to jobs | Overview stats |
| Status: applied/interview/offer | Skill demand trends |
| Personal notes | Application analytics |
| Statistics | Job posting trends |

### ✅ Frontend (90% Complete)

- 🌿 **Pastel Green Theme** — Cozy, modern SaaS design
- 🎨 **Login/Register** — Split layout, Font Awesome icons
- 📧 **Email Verification Page** — Auto-verify on click
- 📊 **Dashboard** — Full stats, Chart.js trends, best matches
- 📱 **Fully Responsive** — Mobile + Tablet + Desktop
- 🔔 **Notification bell** + User menu
- 🔍 **Global search bar**

### 🔄 In Progress

- [ ] Jobs page (browse, filter, search)
- [ ] Applications page (track all)
- [ ] Skills page (manage profile)
- [ ] Analytics page (full charts)

### ⏳ Planned

- [ ] **Job Scraping** — n8n automation from RemoteOK, Remotive
- [ ] **AI Resume Analysis** — Skill extraction from PDFs
- [ ] **Notifications** — Email/Telegram alerts
- [ ] **Deployment** — Railway + Vercel

---

## 🛠️ Tech Stack

### Backend
| Tech | Purpose |
|------|---------|
| **Python 3.13** | Core language |
| **FastAPI** | REST API framework |
| **SQLAlchemy** | ORM |
| **SQLite** | Development DB |
| **PostgreSQL** | Production DB *(planned)* |
| **Pydantic** | Data validation |
| **JWT + bcrypt** | Auth & security |
| **Gmail SMTP** | Email verification |
| **aiosmtplib** | Async email sending |

### Frontend
| Tech | Purpose |
|------|---------|
| **HTML5** | Semantic structure |
| **CSS3** | Custom pastel green theme |
| **Vanilla JS** | Interactivity |
| **Chart.js** | Beautiful charts |
| **Font Awesome** | Icons |
| **Google Fonts** | Inter + Playfair Display |

### DevOps & Tools
| Tool | Purpose |
|------|---------|
| **Git / GitHub** | Version control |
| **VS Code** | Development |
| **Swagger UI** | API documentation |
| **n8n** | Workflow automation *(planned)* |

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────┐
│                  FRONTEND                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │  Login   │ │ Dashboard│ │   Jobs   │         │
│  │ HTML/CSS │ │ Chart.js │ │ (planned)│         │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘         │
└───────┼────────────┼────────────┼───────────────┘
        │            │            │
        ▼            ▼            ▼
┌─────────────────────────────────────────────────┐
│              FastAPI Backend                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ Auth │ │ Jobs │ │Skills│ │Apps  │ │Analy │  │
│  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘  │
└─────┼────────┼────────┼────────┼────────┼───────┘
      │        │        │        │        │
      ▼        ▼        ▼        ▼        ▼
   ┌─────┐ ┌─────┐ ┌─────┐ ┌──────┐ ┌─────┐
   │JWT  │ │Match│ │Fake │ │Dedup │ │Gmail│
   │Auth │ │DSA  │ │Detec│ │Merge │ │SMTP │
   └─────┘ └─────┘ └─────┘ └──────┘ └─────┘
                                          
              ┌──────────────┐
              │   SQLite DB  │
              │ (PostgreSQL  │
              │  in prod)    │
              └──────────────┘
```

---

## 📁 Project Structure

```text
jobcocoon/
│
├── backend/
│   └── app/
│       ├── main.py                    # App entry point
│       ├── database/
│       │   └── connection.py          # DB config
│       ├── models/                    # SQLAlchemy models
│       │   ├── user.py                # + is_verified field
│       │   ├── job.py                 # + fingerprint, fake_score
│       │   ├── application.py
│       │   ├── skill.py
│       │   └── verification_token.py  # NEW: email tokens
│       ├── schemas/                   # Pydantic schemas
│       │   ├── user.py
│       │   ├── job.py
│       │   ├── skill.py
│       │   ├── application.py
│       │   └── analytics.py
│       ├── routes/                    # API endpoints
│       │   ├── auth.py                # + verify, resend
│       │   ├── job.py
│       │   ├── skill.py
│       │   ├── application.py
│       │   └── analytics.py
│       ├── services/                  # Business logic
│       │   ├── matching.py            # DSA algorithm
│       │   ├── duplication.py         # MD5 + fuzzy
│       │   ├── fake_detection.py      # Heuristics
│       │   ├── analytics.py
│       │   ├── email.py               # Gmail SMTP
│       │   └── verification.py        # Token flow
│       └── utils/
│           └── auth.py                # JWT helpers
│
├── frontend/
│   ├── index.html                     # Login/Register
│   ├── css/
│   │   ├── style.css                  # Login (pastel green)
│   │   ├── dashboard.css              # Dashboard
│   │   └── jobs.css                   # Jobs page
│   ├── js/
│   │   ├── api.js                     # API helper
│   │   ├── auth.js                    # Auth logic
│   │   ├── dashboard.js               # Dashboard + charts
│   │   └── jobs.js                    # Jobs logic
│   ├── pages/
│   │   ├── dashboard.html
│   │   ├── verify-email.html
│   │   ├── jobs.html
│   │   ├── applications.html
│   │   ├── skills.html
│   │   └── analytics.html
│   └── assets/
│       └── JobCocoon logo.png
│
├── screenshots/                       # README images
│   ├── login.png
│   ├── dashboard.png
│   ├── verify-email.png
│   └── charts.png
│
├── .env                               # Secrets (gitignored)
├── .gitignore
├── requirements.txt
└── README.md
```

---

## 📸 Screenshots

### 🔐 Login Page
![Login Page](screenshots/login.png)

*Split layout — auth form on left, branding on right. Pastel green theme with Font Awesome icons.*

### 📧 Email Verification
![Email Verification](screenshots/verify-email.png)

*Beautiful auto-verification page with loading, success, and error states.*

### 📊 Dashboard
![Dashboard](screenshots/dashboard.png)

*Complete dashboard with 4 metric cards, sidebar navigation, and user menu.*

### 📈 Charts & Analytics
![Charts](screenshots/charts.png)

*Hiring demand trend (Chart.js line chart) + Top skills in demand (progress bars).*

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Git
- Gmail account (for email verification)
- VS Code with Live Server extension

### 1. Clone Repository

```bash
git clone https://github.com/LAIBA5463/job-intelligence-platform.git
cd job-intelligence-platform
```

### 2. Virtual Environment

```bash
python -m venv venv
```

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install fastapi uvicorn sqlalchemy pydantic python-jose[cryptography] passlib bcrypt python-dotenv aiosmtplib email-validator python-multipart
```

### 4. Gmail Setup (for email verification)

**Step 1:** Go to [myaccount.google.com](https://myaccount.google.com)

**Step 2:** Enable **2-Step Verification** (Security tab)

**Step 3:** Generate **App Password**:
- Search: "App passwords"
- App: **Mail**
- Device: **Windows Computer**
- Copy the **16-character password**

### 5. Environment Variables

Create `.env` in `backend/` folder:

```env
# App
APP_NAME=JobCocoon
APP_ENV=development
APP_URL=http://localhost:5000

# JWT
SECRET_KEY=jobcocoon-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Email (Gmail SMTP)
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587

# Frontend
FRONTEND_URL=http://127.0.0.1:5500
```

### 6. Initialize Database

```bash
cd backend
python
```

```python
from app.database.connection import engine, Base
from app.models.user import User
from app.models.job import Job
from app.models.application import Application
from app.models.skill import Skill, user_skills, job_skills
from app.models.verification_token import VerificationToken

Base.metadata.create_all(bind=engine)
print("✅ Database initialized!")
exit()
```

### 7. Run Backend

```bash
uvicorn app.main:app --reload --port 5000
```

**Access:**
- Swagger: `http://localhost:5000/docs`
- Health: `http://localhost:5000/health`

### 8. Run Frontend

Open `frontend/index.html` with **Live Server**.

**URL:** `http://127.0.0.1:5500/frontend/index.html`

### 9. Register & Verify

1. **Register** with your Gmail address
2. **Check inbox** — verification email aayegi
3. **Click link** — auto-verify hoga
4. **Login** — dashboard pe redirect

---

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register + send verification email |
| `GET` | `/auth/verify?token=` | Verify email with token |
| `POST` | `/auth/resend-verification` | Resend verification email |
| `POST` | `/auth/login` | Login (requires verified email) |
| `GET` | `/auth/me` | Get current user |

### Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/jobs/` | Create job (with dedup + fake detection) |
| `GET` | `/jobs/` | List jobs (search + pagination) |
| `GET` | `/jobs/{id}` | Get single job |
| `PUT` | `/jobs/{id}` | Update job |
| `DELETE` | `/jobs/{id}` | Delete job |
| `POST` | `/jobs/{id}/skills` | Add skills to job |
| `POST` | `/jobs/{id}/report` | Report fake job |
| `GET` | `/jobs/suspicious/list` | List suspicious jobs |
| `GET` | `/jobs/matched/for-me` | Jobs ranked by match score ⭐ |

### Skills

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/skills/` | List all skills |
| `POST` | `/skills/` | Create skill |
| `GET` | `/skills/me` | Get user's skills |
| `POST` | `/skills/me` | Set user's skills |

### Applications

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/applications/` | Apply to job |
| `GET` | `/applications/` | List applications |
| `GET` | `/applications/{id}` | Get application |
| `PUT` | `/applications/{id}` | Update status/notes |
| `DELETE` | `/applications/{id}` | Delete application |
| `GET` | `/applications/stats/me` | Application stats |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/analytics/overview` | Platform stats |
| `GET` | `/analytics/applications` | Application analytics |
| `GET` | `/analytics/skills` | Skill demand |
| `GET` | `/analytics/trends` | Job trends |
| `GET` | `/analytics/dashboard` | All-in-one dashboard |

---

## 🧠 Matching Algorithm

The core of JobCocoon is a **custom DSA-based matching engine**.

### Algorithm

```python
# 1. User skills → Set (O(1) lookup)
user_set = {"python", "sql", "git"}

# 2. Job requirements → Set
job_set = {"python", "sql", "docker", "git"}

# 3. Set intersection → matched skills
matched = user_set & job_set  # {"python", "sql", "git"}

# 4. Set difference → missing skills
missing = job_set - user_set  # {"docker"}

# 5. Match score (0-100%)
score = (len(matched) / len(job_set)) * 100  # 75.0%
```

### DSA Concepts Used

| Concept | Where Used | Benefit |
|---------|-----------|---------|
| **Sets** | Skill comparison | O(1) lookup |
| **Set operations** | Match/miss | Fast intersection |
| **Sorting** | Job ranking | Best matches first |
| **Hash maps** | Skill demand | O(n) counting |
| **Sliding window** | Dedup check | Recent 500 jobs |

### Time Complexity
```
O(n × m) where:
  n = number of jobs
  m = number of skills per job
```

---

## 🗄️ Database Schema

```
users                          skills
─────                          ──────
id                             id
name                           name
email                          category
password_hash
is_verified ← NEW              user_skills ─┬─ user_id
verified_at ← NEW                          └─ skill_id
created_at
updated_at                     job_skills ─┬─ job_id
                                           └─ skill_id
jobs
────                           applications
id                             ────────────
title                          id
company                        user_id
description                    job_id
requirements                   status
location                       notes
salary_range                   applied_at
source                         updated_at
url
match_score                    verification_tokens ← NEW
fingerprint ← NEW              ───────────────────
sources ← NEW                  id
duplicate_count ← NEW          user_id
fake_score ← NEW               token
is_verified ← NEW              expires_at
is_suspicious ← NEW            is_used
is_active ← NEW                created_at
created_at
updated_at
```

---

## 🎯 Roadmap

### ✅ Phase 1: Foundation
- [x] Project setup
- [x] Database models
- [x] JWT authentication
- [x] Jobs CRUD

### ✅ Phase 2: Intelligence
- [x] Skills system
- [x] Matching algorithm
- [x] Deduplication (MD5 + fuzzy)
- [x] Fake detection

### ✅ Phase 3: Tracking
- [x] Application tracker
- [x] Status updates
- [x] Analytics

### ✅ Phase 4: Email Verification
- [x] Gmail SMTP setup
- [x] Token-based verification
- [x] HTML email template
- [x] Resend functionality

### ✅ Phase 5: Frontend (90%)
- [x] Login/Register (pastel green)
- [x] Email verification page
- [x] Dashboard with charts
- [ ] Jobs page
- [ ] Applications page
- [ ] Skills page
- [ ] Analytics page

### ⏳ Phase 6: Automation
- [ ] n8n workflows
- [ ] Job scraping (RemoteOK, Remotive)
- [ ] Notifications

### ⏳ Phase 7: AI
- [ ] Resume parsing
- [ ] Skill extraction
- [ ] Smart recommendations

### ⏳ Phase 8: Deployment
- [ ] Backend → Railway
- [ ] Frontend → Vercel
- [ ] Database → PostgreSQL

---

## 🧪 Testing

### Manual Testing (Swagger UI)

1. Go to `http://localhost:5000/docs`
2. **Register** → check email
3. **Click verification link** in inbox
4. **Login** with credentials
5. **Copy token** → Authorize (🔒)
6. **Test all endpoints**

### Complete Flow Test

```bash
# 1. Register (sends email)
POST /auth/register
{
  "name": "Laiba",
  "email": "laibasaghir566@gmail.com",
  "password": "laiba123456"
}

# 2. Check email → click verification link
GET /auth/verify?token=xxx

# 3. Login (only works after verification)
POST /auth/login
username: laibasaghir566@gmail.com
password: laiba123456

# 4. Add skills
POST /skills/me
{
  "skill_names": ["Python", "SQL", "Git", "FastAPI"]
}

# 5. Add job
POST /jobs/
{
  "title": "Python Developer",
  "company": "Systems Limited",
  "salary_range": "100,000 - 200,000"
}

# 6. Get matched jobs
GET /jobs/matched/for-me

# 7. View dashboard
GET /analytics/dashboard
```

---

## 📈 Progress

| Day | Feature | Status |
|-----|---------|--------|
| Day 1 | Backend Setup + Auth + Jobs CRUD | ✅ |
| Day 2 | Skills + Matching Algorithm | ✅ |
| Day 3 | Deduplication + Fake Detection | ✅ |
| Day 4 | Application Tracker | ✅ |
| Day 5 | Analytics Dashboard | ✅ |
| Day 6 | Email Verification + Frontend Login | ✅ |
| Day 7 | Dashboard UI + Charts | ✅ |
| Day 8 | Remaining Frontend Pages | 🔄 |
| Day 9 | Job Scraping (n8n) | ⏳ |
| Day 10 | AI Integration | ⏳ |
| Day 11 | Deployment | ⏳ |

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the project
2. Create feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit changes:
   ```bash
   git commit -m "Add some AmazingFeature"
   ```
4. Push:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) file.

---

## 👩‍💻 Author

**Laiba Saghir** — AI Automation Engineer & Full-Stack Developer

- 🐙 **GitHub:** [@LAIBA5463](https://github.com/LAIBA5463)
- 💼 **LinkedIn:** [Laiba Saghir](https://www.linkedin.com/in/laiba-saghir-7a7411397/)
- 🌐 **Portfolio:** [View Portfolio](https://laiba-46lxkm9r4-laibasaghir566-3600.vercel.app/)

---

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) — Modern web framework
- [SQLAlchemy](https://www.sqlalchemy.org/) — Python SQL toolkit
- [Chart.js](https://www.chartjs.org/) — Beautiful charts
- [Font Awesome](https://fontawesome.com/) — Icons
- [Google Fonts](https://fonts.google.com/) — Inter + Playfair Display
- [Gmail SMTP](https://support.google.com/mail/answer/7126229) — Email service

---

## 📊 Project Stats

[![Repo Size](https://img.shields.io/github/repo-size/LAIBA5463/job-intelligence-platform?style=flat-square)](https://github.com/LAIBA5463/job-intelligence-platform)
[![Last Commit](https://img.shields.io/github/last-commit/LAIBA5463/job-intelligence-platform?style=flat-square)](https://github.com/LAIBA5463/job-intelligence-platform)
[![Commit Activity](https://img.shields.io/github/commit-activity/m/LAIBA5463/job-intelligence-platform?style=flat-square)](https://github.com/LAIBA5463/job-intelligence-platform)
[![GitHub Stars](https://img.shields.io/github/stars/LAIBA5463/job-intelligence-platform?style=flat-square)](https://github.com/LAIBA5463/job-intelligence-platform)

---

<div align="center">

### ⭐ If you find this project useful, please give it a star! ⭐

**Made with 💚 by [Laiba Saghir](https://github.com/LAIBA5463)**

*Transform Your Career* 🦋

</div>
```