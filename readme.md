# 🎯 Job Intelligence Platform

> AI-powered job tracking and matching platform that turns your CV into a smart job searching module.

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge\&logo=python\&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge\&logo=fastapi\&logoColor=white)](https://fastapi.tiangolo.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-D71F00?style=for-the-badge\&logo=sqlalchemy\&logoColor=white)](https://www.sqlalchemy.org/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge\&logo=jsonwebtokens\&logoColor=white)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

---

## 📖 Overview

**Job Intelligence Platform** is a full-stack software system that revolutionizes the job hunting experience by:

* 🔍 **Collecting** job listings from multiple sources
* 🧠 **Analyzing** job requirements and user skills
* 🎯 **Matching** candidates to jobs using a custom DSA-based algorithm
* 📊 **Tracking** applications and their status
* 📈 **Providing** actionable analytics and insights
* 🤖 **Integrating** AI for resume analysis *(planned)*
* ⚡ **Automating** job ingestion via n8n workflows *(planned)*

> **"Not just a job tracker — a smart career companion."**

---

## ✨ Features

### ✅ Currently Implemented

#### 🔐 Authentication

* JWT-based authentication
* Secure password hashing (bcrypt)
* Register / Login / Me endpoints
* Protected routes

#### 💼 Jobs Management

* Full CRUD operations
* Advanced search (title, company)
* Pagination support
* Rich job metadata

#### 🎓 Skills System

* Master skills database
* User ↔ Skills (many-to-many)
* Job ↔ Skills (many-to-many)
* Skill categorization

#### 🧠 Matching Algorithm ⭐

* Custom DSA-based engine
* Match score (0-100%)
* Matched skills identification
* Missing skills recommendation
* Jobs ranked by match score

### 🔄 In Progress

* [ ] Application Tracker (applied / interview / rejected / offer)
* [ ] Analytics Dashboard
* [ ] AI Resume Analysis
* [ ] n8n Automation
* [ ] React Frontend
* [ ] Production Deployment

---

## 🛠️ Tech Stack

### Backend

| Technology       | Purpose                         |
| ---------------- | ------------------------------- |
| **Python 3.11+** | Core language                   |
| **FastAPI**      | REST API framework              |
| **SQLAlchemy**   | ORM for database                |
| **SQLite**       | Development database            |
| **PostgreSQL**   | Production database *(planned)* |
| **Pydantic**     | Data validation                 |
| **JWT**          | Authentication                  |
| **bcrypt**       | Password hashing                |

### Frontend *(Planned)*

* HTML / CSS / JavaScript
* OR React
* Modern responsive design

### DevOps & Tools

* **Git / GitHub** — Version control
* **n8n** — Workflow automation
* **Swagger UI** — API documentation

---

## 🏗️ Architecture

```text
┌──────────────┐
│   Frontend   │
│ HTML/JS/React│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   FastAPI    │
│   Backend    │
└──────┬───────┘
       │
       ├────────────────┬────────────────┐
       ▼                ▼                ▼
┌────────────┐   ┌────────────┐   ┌────────────┐
│ PostgreSQL │   │  Matching  │   │ AI Service │
│  Database  │   │   Engine   │   │            │
└────────────┘   └────────────┘   └────────────┘
                       │
                       ▼
                ┌──────────────┐
                │     n8n      │
                │  Automation  │
                └──────┬───────┘
                       │
                 ┌─────┴─────┐
                 ▼           ▼
              Telegram     Email
```

---

## 📁 Project Structure

```text
job-intelligence-platform/
│
├── backend/
│   └── app/
│       ├── __init__.py
│       ├── main.py                  # Application entry point
│       │
│       ├── database/
│       │   ├── __init__.py
│       │   └── connection.py        # Database configuration
│       │
│       ├── models/                  # SQLAlchemy models
│       │   ├── user.py              # User table
│       │   ├── job.py               # Job table
│       │   ├── application.py       # Application table
│       │   └── skill.py             # Skill + junction tables
│       │
│       ├── schemas/                 # Pydantic schemas
│       │   ├── user.py
│       │   ├── job.py
│       │   └── skill.py
│       │
│       ├── routes/                  # API endpoints
│       │   ├── auth.py              # Authentication
│       │   ├── job.py               # Jobs CRUD
│       │   └── skill.py             # Skills management
│       │
│       ├── services/                # Business logic
│       │   └── matching.py          # Matching algorithm
│       │
│       └── utils/
│           └── auth.py              # JWT & password helpers
│
├── .gitignore
├── README.md
└── requirements.txt
```

---

## 🚀 Quick Start

### Prerequisites

* Python 3.11+
* Git
* VS Code *(recommended)*

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/LAIBA5463/job-intelligence-platform.git
cd job-intelligence-platform
```

#### 2. Create virtual environment

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Mac / Linux

```bash
source venv/bin/activate
```

#### 3. Install dependencies

```bash
pip install -r requirements.txt
```

#### 4. Initialize database

```bash
cd backend
python
```

```python
from app.database.connection import engine, Base
from app.models.user import User
from app.models.job import Job
from app.models.application import Application
from app.models.skill import Skill

Base.metadata.create_all(bind=engine)
exit()
```

#### 5. Run the server

```bash
uvicorn app.main:app --reload --port 5000
```

#### 6. Access the API

| URL                            | Purpose      |
| ------------------------------ | ------------ |
| `http://localhost:5000/docs`   | Swagger UI   |
| `http://localhost:5000/redoc`  | ReDoc        |
| `http://localhost:5000/health` | Health check |

---

## 📚 API Endpoints

### Authentication

| Method | Endpoint         | Description             | Auth |
| ------ | ---------------- | ----------------------- | ---- |
| `POST` | `/auth/register` | Register new user       | ❌    |
| `POST` | `/auth/login`    | Login and get JWT token | ❌    |
| `GET`  | `/auth/me`       | Get current user info   | ✅    |

### Jobs

| Method   | Endpoint               | Description                     | Auth |
| -------- | ---------------------- | ------------------------------- | ---- |
| `POST`   | `/jobs/`               | Create new job                  | ✅    |
| `GET`    | `/jobs/`               | List jobs (search + pagination) | ✅    |
| `GET`    | `/jobs/{id}`           | Get single job                  | ✅    |
| `PUT`    | `/jobs/{id}`           | Update job                      | ✅    |
| `DELETE` | `/jobs/{id}`           | Delete job                      | ✅    |
| `POST`   | `/jobs/{id}/skills`    | Add skills to job               | ✅    |
| `GET`    | `/jobs/matched/for-me` | **Get matched jobs by score** ⭐ | ✅    |

### Skills

| Method | Endpoint     | Description        | Auth |
| ------ | ------------ | ------------------ | ---- |
| `POST` | `/skills/`   | Create a new skill | ✅    |
| `GET`  | `/skills/`   | List all skills    | ✅    |
| `POST` | `/skills/me` | Set my skills      | ✅    |
| `GET`  | `/skills/me` | Get my skills      | ✅    |

---

## 🧠 Matching Algorithm

The core of this platform is a **custom matching algorithm** built using fundamental DSA concepts.

### How It Works

1. **User Skills → Set** (`O(1)` lookup)
2. **Job Requirements → Set**
3. **Intersection** = Matched skills
4. **Difference** = Missing skills
5. **Score** = `(matched / required) × 100`

### Example

```text
User Skills:    {Python, SQL, Git, FastAPI}
Job Requires:   {Python, SQL, Docker, Git}

Match Score:    75.0%

Matched:        [git, python, sql]
Missing:        [docker]
```

### DSA Concepts Used

* ✅ **Sets** — `O(1)` skill lookup
* ✅ **Set Operations** — Intersection, difference
* ✅ **Sorting** — Rank jobs by match score
* ✅ **Hash Maps** — Skill demand analysis
* ✅ **Time Complexity** — `O(n × m)` where `n` = jobs, `m` = skills

---

## 📊 Database Schema

```text
users                       skills
─────                       ──────
id                          id
name                        name
email                       category
password_hash
created_at                  user_skills (junction)
updated_at                  ───────────────────
                            user_id → users.id
jobs                        skill_id → skills.id
────
id                          job_skills (junction)
title                       ──────────────────
company                     job_id → jobs.id
description                 skill_id → skills.id
requirements
location                    applications
salary_range                ────────────
source                      id
url                         user_id → users.id
match_score                 job_id → jobs.id
created_at                  status
updated_at                  notes
                            applied_at
```

---

## 🎯 Roadmap

### ✅ Phase 1: Foundation *(Completed)*

* ☑ Project setup
* ☑ Database models
* ☑ User authentication (JWT)
* ☑ Jobs CRUD

### ✅ Phase 2: Intelligence *(Completed)*

* ☑ Skills system
* ☑ Matching algorithm
* ☑ Match score calculation

### 🔄 Phase 3: Tracking *(In Progress)*

* □ Application tracker
* □ Status updates
* □ Notes

### 🔄 Phase 4: Analytics

* □ Dashboard
* □ Skill demand
* □ Application stats

### 🔄 Phase 5: AI

* □ Resume parsing
* □ Skill extraction
* □ Recommendations

### 🔄 Phase 6: Automation

* □ n8n workflows
* □ Job scraping
* □ Notifications

### 🔄 Phase 7: Frontend

* □ React / HTML frontend
* □ Dashboard UI

### 🔄 Phase 8: Deployment

* □ Backend → Railway / Render
* □ Frontend → Vercel
* □ Database → PostgreSQL

---

## 🧪 Testing

### Using Swagger UI

1. Open `http://localhost:5000/docs`
2. **Register:** `POST /auth/register`
3. **Login:** `POST /auth/login` → Copy token
4. **Authorize:** Click 🔒 → `Bearer YOUR_TOKEN`
5. **Test endpoints** using Swagger UI

### Example Workflow

#### 1. Register

```text
POST /auth/register
```

```json
{
  "name": "Laiba",
  "email": "laiba@test.com",
  "password": "test123456"
}
```

#### 2. Login

```text
POST /auth/login
```

```text
username: laiba@test.com
password: test123456
```

#### 3. Add skills

```text
POST /skills/me
```

```json
{
  "skill_names": ["Python", "SQL", "Git", "FastAPI"]
}
```

#### 4. Add job

```text
POST /jobs/
```

```json
{
  "title": "Backend Developer",
  "company": "TechCorp"
}
```

#### 5. Add skills to job

```text
POST /jobs/1/skills
```

```json
{
  "skill_names": ["Python", "SQL", "Docker", "Git"]
}
```

#### 6. Get matched jobs

```text
GET /jobs/matched/for-me
```

---

## 📈 Progress

| Day   | Feature                     | Status |
| ----- | --------------------------- | ------ |
| Day 1 | Setup + Auth + Jobs CRUD    | ✅      |
| Day 2 | Skills + Matching Algorithm | ✅      |
| Day 3 | Application Tracker         | 🔄     |
| Day 4 | Analytics Dashboard         | ⏳      |
| Day 5 | AI Integration              | ⏳      |
| Day 6 | n8n Automation              | ⏳      |
| Day 7 | Frontend                    | ⏳      |
| Day 8 | Deployment                  | ⏳      |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch:

```bash
git checkout -b feature/AmazingFeature
```

3. Commit your changes:

```bash
git commit -m "Add some AmazingFeature"
```

4. Push to the branch:

```bash
git push origin feature/AmazingFeature
```

5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👩‍💻 Author

**Laiba Saghir**

* 🐙 **GitHub:** [@LAIBA5463](https://github.com/laiba-saghir)
* 💼 **LinkedIn:** [Your LinkedIn](https://www.linkedin.com/in/laiba-saghir-7a7411397/)
* 🌐 **Portfolio:** [Your Portfolio](https://laiba-46lxkm9r4-laibasaghir566-3600.vercel.app/)

---

## 🙏 Acknowledgments

* [FastAPI](https://fastapi.tiangolo.com/) — Modern web framework
* [SQLAlchemy](https://www.sqlalchemy.org/) — Python SQL toolkit
* [Pydantic](https://docs.pydantic.dev/) — Data validation
* [JWT](https://jwt.io/) — Token-based authentication

---

## 📊 Project Stats

[![Repo Size](https://img.shields.io/github/repo-size/LAIBA5463/job-intelligence-platform?style=flat-square)](https://github.com/LAIBA5463/job-intelligence-platform)
[![Last Commit](https://img.shields.io/github/last-commit/LAIBA5463/job-intelligence-platform?style=flat-square)](https://github.com/LAIBA5463/job-intelligence-platform)
[![Commit Activity](https://img.shields.io/github/commit-activity/m/LAIBA5463/job-intelligence-platform?style=flat-square)](https://github.com/LAIBA5463/job-intelligence-platform)

---

<div align="center">

### ⭐ If you find this project useful, please give it a star! ⭐

**Made with ❤️ by [Laiba Saghir](https://github.com/laiba-saghir)**

</div>
