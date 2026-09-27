# 🎯 Job Intelligence Platform

> AI-powered job tracking and matching platform that helps job seekers find, match, and track their job applications intelligently.

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-red.svg)](https://www.sqlalchemy.org/)
[![JWT](https://img.shields.io/badge/JWT-Auth-orange.svg)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 **Overview**

**Job Intelligence Platform** is a full-stack software system that revolutionizes the job hunting experience by:

- 🔍 **Collecting** job listings from multiple sources
- 🧠 **Analyzing** job requirements and user skills
- 🎯 **Matching** candidates to jobs using a custom algorithm
- 📊 **Tracking** applications and their status
- 📈 **Providing** actionable analytics and insights
- 🤖 **Integrating** AI for resume analysis
- ⚡ **Automating** job ingestion via n8n workflows

> **"Not just a job tracker — a smart career companion."**

---

## ✨ **Features**

### ✅ **Currently Implemented**

- [x] **User Authentication**
  - JWT-based authentication
  - Secure password hashing (bcrypt)
  - Register/Login endpoints
  - Protected routes

- [x] **Jobs Management**
  - Create, Read, Update, Delete jobs
  - Advanced search (title, company)
  - Pagination support
  - Job metadata (title, company, salary, location, source, URL)

- [x] **Skills System**
  - Master skills database
  - User skills (many-to-many)
  - Job requirements (many-to-many)
  - Skill categorization

- [x] **Matching Algorithm** ⭐
  - Custom DSA-based matching engine
  - Match score calculation (0-100%)
  - Matched skills identification
  - Missing skills recommendation
  - Jobs ranked by match score

### 🔄 **In Progress**

- [ ] Application Tracker (applied/interview/rejected/offer)
- [ ] Analytics Dashboard
- [ ] AI Resume Analysis
- [ ] n8n Automation
- [ ] React Frontend
- [ ] Production Deployment

---

## 🛠️ **Tech Stack**

### **Backend**
| Technology | Purpose |
|-----------|---------|
| **Python 3.11+** | Core language |
| **FastAPI** | REST API framework |
| **SQLAlchemy** | ORM for database |
| **SQLite** | Development database |
| **PostgreSQL** | Production database (planned) |
| **Pydantic** | Data validation |
| **JWT** | Authentication |
| **bcrypt** | Password hashing |

### **Frontend** (Planned)
- HTML/CSS/JavaScript OR React
- Modern responsive design

### **DevOps & Tools**
- **Git/GitHub** - Version control
- **n8n** - Workflow automation
- **Swagger UI** - API documentation

---

## 🏗️ **Architecture**
