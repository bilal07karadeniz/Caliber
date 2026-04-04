# Caliber — Precision Career Matching

An intelligent job matching platform that uses AI and NLP to connect candidates with the most compatible job opportunities. Built as a graduation project for SENG 400.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   React      │────▶│  Node.js     │────▶│  Python      │
│   Frontend   │     │  API Gateway │     │  AI Engine   │
│   (Vite+TS)  │◀────│  (Express)   │◀────│  (FastAPI)   │
└─────────────┘     └──────┬───────┘     └──────┬───────┘
                           │                     │
                    ┌──────▼─────────────────────▼──┐
                    │        PostgreSQL 16           │
                    └───────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Query |
| Backend API | Node.js, Express, TypeScript, Prisma ORM |
| AI Engine | Python, FastAPI, spaCy, scikit-learn, sentence-transformers |
| Database | PostgreSQL 16 |
| Auth | JWT (access + refresh tokens), bcrypt |
| File Uploads | Multer (local filesystem) |
| Deployment | Railway (backend), Netlify (frontend) |

## Features

### For Job Seekers
- **AI-Powered Job Matching** - Get ranked job recommendations with compatibility scores
- **Smart Resume Parsing** - Upload your resume and let AI extract your skills automatically
- **Skill Gap Analysis** - Identify missing skills and get personalized learning recommendations
- **Career Insights** - AI-generated career path suggestions based on your skill profile
- **Application Tracking** - Track all your job applications in one place

### For Employers
- **Job Posting Management** - Create and manage job listings with required skills
- **AI Candidate Ranking** - View candidates ranked by match score for each job
- **Application Review** - Review, shortlist, and manage applicants with status tracking

### For Admins
- **Dashboard Analytics** - System-wide statistics and user metrics
- **User Management** - Activate/deactivate user accounts
- **Job Oversight** - Manage all job listings across the platform
- **System Health Monitoring** - Monitor service status

## Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 16
- npm or yarn

## Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd caliber
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Install Dependencies
```bash
# Server
cd server && npm install && npx prisma generate && cd ..

# Client
cd client && npm install && cd ..

# AI Engine
cd ai-engine && python -m venv .venv
# On Windows: .venv\Scripts\activate
# On Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
cd ..
```

### 4. Setup Database
```bash
# Make sure PostgreSQL is running
cd server
npx prisma migrate dev --name init
npx prisma db seed
cd ..
```

### 5. Start Development Servers
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev

# Terminal 3 - AI Engine
cd ai-engine && uvicorn app.main:app --reload --port 8000
```

### 6. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **AI Engine**: http://localhost:8000
- **API Docs (AI)**: http://localhost:8000/docs

### Test Accounts (after seeding)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@caliber.com | Admin123! |
| Employer | john@techcorp.com | Test1234 |
| Job Seeker | seeker1@test.com | Test1234 |

## Deployment

### Backend (Railway)
1. Create a new Railway project
2. Add a PostgreSQL database service
3. Connect your GitHub repository
4. Set the root directory to `server`
5. Add environment variables from `.env.production.example`
6. Deploy

### Frontend (Netlify)
1. Connect your GitHub repository on Netlify
2. Set base directory to `client`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-railway-url/api`
6. Update `client/netlify.toml` with your Railway backend URL

### AI Engine (Railway)
1. Add another service in your Railway project
2. Set root directory to `ai-engine`
3. Set environment variables (DATABASE_URL, ASYNC_DATABASE_URL)
4. Deploy

## API Documentation

### Auth Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Job Endpoints
- `GET /api/jobs` - List jobs (public, with search/filter)
- `GET /api/jobs/:id` - Get job detail
- `POST /api/jobs` - Create job (employer)
- `PATCH /api/jobs/:id` - Update job (employer)
- `DELETE /api/jobs/:id` - Deactivate job

### Application Endpoints
- `POST /api/applications` - Apply to job
- `GET /api/applications/my` - My applications
- `GET /api/applications/job/:jobId` - Job applicants (employer)
- `PATCH /api/applications/:id/status` - Update status (employer)

### AI Endpoints
- `GET /api/recommendations` - Get AI job matches
- `POST /api/recommendations/refresh` - Regenerate matches
- `GET /api/skill-gap/job/:jobId` - Skill gap for a job
- `GET /api/skill-gap/career-insights` - Career insights
- `GET /api/skill-gap/learning-path` - Learning recommendations

### AI Engine Endpoints (FastAPI)
- `POST /api/parse-resume` - Parse resume file
- `POST /api/match/user-to-jobs` - Match user to jobs
- `POST /api/match/job-to-candidates` - Match job to candidates
- `POST /api/match/score` - Get match score

## Testing

```bash
# Backend tests
cd server && npm test

# AI Engine tests
cd ai-engine && pytest -v
```

## Team

| Name | Role |
|------|------|
| Bilal Karadeniz | Developer |
| Afaf Albadawy | Team Member |
| Mohammed Alaa | Team Member |
| Abdirizak Khadar Ali | Team Member |
| Yousuf Ahmed | Team Member |

**Course**: SENG 400 - Graduation Project
**Supervisor**: Asst. Prof. Ilker Yoncanci

## License

This project is developed for academic purposes as part of the SENG 400 graduation project.
