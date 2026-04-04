# AI-Powered Job Matching Platform - Complete Development Plan

## Implementation Status

| Phase | Status |
|-------|--------|
| Phase 1: Project Initialization & Infrastructure (Steps 1.1-1.6) | DONE |
| Phase 2: Database Schema & ORM Setup (Steps 2.1-2.5) | DONE |
| Phase 3: Authentication & Authorization (Steps 3.1-3.5) | DONE |
| Phase 4: User Profile Management (Steps 4.1-4.4) | DONE |
| Phase 5: Job Posting Management (Steps 5.1-5.2) | DONE |
| Phase 6: Resume Upload & Parsing (Steps 6.1-6.3) | DONE |
| Phase 7: Calibering Engine (Steps 7.1-7.4) | DONE |
| Phase 8: Application Management (Steps 8.1-8.2) | DONE |
| Phase 9: Skill Gap Analysis (Steps 9.1-9.2) | DONE |
| Phase 10: Notification System (Steps 10.1-10.2) | DONE |
| Phase 11: Admin Dashboard Backend (Steps 11.1-11.2) | DONE |
| Phase 12: Frontend Core Layout & Routing (Steps 12.1-12.5) | DONE |
| Phase 13: Frontend Authentication Pages (Steps 13.1-13.2) | DONE |
| Phase 14: Frontend Landing Page (Step 14.1) | DONE |
| Phase 15: Frontend Job Seeker Features (Steps 15.1-15.8) | DONE |
| Phase 16: Frontend Employer Features (Steps 16.1-16.6) | DONE |
| Phase 17: Frontend Admin Features (Steps 17.1-17.3) | DONE |
| Phase 18: Frontend Notifications UI (Step 18.1) | DONE |
| Phase 19: Responsive Design & Polish (Steps 19.1-19.2) | DONE |
| Phase 20: Security Hardening (Steps 20.1-20.2) | DONE |
| Phase 21: Testing | NOTE - Test framework configured, tests can be added per need |
| Phase 22: Deployment Configuration (Steps 22.1-22.2) | DONE |
| Phase 23: Documentation & Final Assembly (Steps 23.1-23.2) | DONE |

### Remaining Notes
- **Database migration**: Run `npx prisma migrate dev --name init` with a running PostgreSQL instance
- **Database seeding**: Run `npx prisma db seed` to populate test data
- **AI Engine**: Requires Python 3.11+ with spaCy model download (`python -m spacy download en_core_web_sm`)
- **sentence-transformers**: The AI matching engine uses `all-MiniLM-L6-v2` model (auto-downloaded on first use)
- **Deployment**: Backend configured for Railway, Frontend configured for Netlify
- **Test accounts after seeding**: admin@caliber.com / Admin123!, john@techcorp.com / Test1234, seeker1@test.com / Test1234

---

## Document Confirmation - Core System Architecture Summary

- **Three-tier architecture**: React frontend (Web App) communicates with a Node.js/Python API Gateway backend, which delegates AI workloads to a dedicated Python AI Engine (Resume Parsing via NLP, Skill Analysis, Job Matching Algorithm, Candidate Ranking), all backed by PostgreSQL/MongoDB and external services (Email/Notifications, Course API, Payment API).
- **Three user roles**: Job Seeker (register, create profile, upload resume, view AI recommendations, apply to jobs, track applications, get career advice), Employer (register, post jobs, search/rank candidates, schedule interviews), Admin (manage users, monitor AI system, manage jobs).
- **Six core entities from ER Diagram**: USER, JOB, APPLICATION, RESUME, SKILL (with USER_SKILLS and JOB_SKILL junction tables), AI_RECOMMENDATION - all with defined relationships and foreign keys.
- **AI-driven matching pipeline (Sequence Diagram)**: User registers -> uploads resume -> backend parses resume file -> AI engine analyzes resume data & extracts skills -> user requests matching jobs -> AI queries job postings -> computes match scores -> returns ranked recommendations with skill gap analysis.

---

## Technology Stack Decisions (Derived from Architecture Diagram & SRS)

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS | Architecture diagram shows "Web App"; React is specified in SRS assumptions |
| Backend API | Node.js + Express + TypeScript | Architecture diagram shows "Node.js / Python" for API Gateway |
| AI Engine | Python + FastAPI | Architecture diagram shows separate AI Engine; Python required for NLP/ML libraries |
| Database | PostgreSQL 16 | ER diagram shows relational schema with FKs; SRS mentions PostgreSQL |
| ORM | Prisma (Node.js) + SQLAlchemy (Python) | Type-safe DB access for both services |
| Auth | JWT (access + refresh tokens) + bcrypt | SRS requires secure authentication |
| File Storage | Local filesystem (dev) / S3-compatible (prod) | Resume uploads (PDF, DOC, DOCX) |
| Resume Parsing | pdfminer.six, python-docx, spaCy | SRS NLP requirements for CV extraction |
| ML Matching | scikit-learn, sentence-transformers | Semantic similarity for match scoring |
| Email | Nodemailer + SMTP | SRS notification requirements |
| Containerization | Docker + docker-compose | Multi-service orchestration |

---

## Phase 1: Project Initialization & Infrastructure

**Phase Objective:** Set up the complete project structure, development environment, containerization, and CI tooling so that all subsequent phases have a consistent, reproducible foundation.

---

### Step 1.1: Create Monorepo Root Structure

**Implementation Details:** Create the root project directory with a monorepo structure. Initialize a `package.json` at root level with workspaces configuration pointing to `client/` and `server/`. Create a root `.gitignore` covering node_modules, dist, .env, __pycache__, .venv, *.pyc, uploads/, and IDE files. Create a root `.env.example` with all required environment variable templates (DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, AI_SERVICE_URL, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, S3_BUCKET, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY, REDIS_URL). Create a root `docker-compose.yml` defining services: `postgres` (image: postgres:16, port 5432, volume for data persistence), `redis` (image: redis:7, port 6379), `server` (build from ./server, port 3001, depends_on postgres and redis), `ai-engine` (build from ./ai-engine, port 8000, depends_on postgres), `client` (build from ./client, port 5173). Initialize git repository.

**Files Affected:**
- `package.json` (root)
- `.gitignore`
- `.env.example`
- `docker-compose.yml`
- `README.md`

**Verification & Testing:** Run `docker-compose config` to validate the compose file syntax. Verify `.env.example` contains all listed variables. Run `git status` to confirm git is initialized and `.gitignore` is working.

---

### Step 1.2: Initialize Node.js Backend (Express + TypeScript)

**Implementation Details:** Inside `server/`, run `npm init -y`. Install dependencies: `express`, `cors`, `helmet`, `morgan`, `dotenv`, `jsonwebtoken`, `bcryptjs`, `multer`, `nodemailer`, `express-validator`, `prisma`, `@prisma/client`, `cookie-parser`. Install dev dependencies: `typescript`, `ts-node`, `nodemon`, `@types/express`, `@types/cors`, `@types/jsonwebtoken`, `@types/bcryptjs`, `@types/multer`, `@types/nodemailer`, `@types/cookie-parser`, `@types/morgan`, `@types/node`. Create `tsconfig.json` with: target ES2022, module commonjs, outDir ./dist, rootDir ./src, strict true, esModuleInterop true, resolveJsonModule true, declaration true. Create `nodemon.json` watching `src/` with ts-node exec. Add scripts to `package.json`: `"dev": "nodemon"`, `"build": "tsc"`, `"start": "node dist/index.js"`, `"prisma:generate": "prisma generate"`, `"prisma:migrate": "prisma migrate dev"`, `"prisma:seed": "ts-node prisma/seed.ts"`. Create the directory structure: `src/config/`, `src/controllers/`, `src/middleware/`, `src/routes/`, `src/services/`, `src/utils/`, `src/types/`, `prisma/`. Create `server/Dockerfile` with Node 20 Alpine image, copy package files, install dependencies, copy source, build TypeScript, expose port 3001, CMD node dist/index.js.

**Files Affected:**
- `server/package.json`
- `server/tsconfig.json`
- `server/nodemon.json`
- `server/Dockerfile`
- `server/src/` (directory structure)
- `server/prisma/` (directory)

**Verification & Testing:** Run `cd server && npm install` and verify it completes without errors. Run `npx tsc --noEmit` to verify TypeScript configuration is valid (will show no-input error which is expected since no .ts files yet).

---

### Step 1.3: Initialize React Frontend (Vite + TypeScript + Tailwind)

**Implementation Details:** From root, run `npm create vite@latest client -- --template react-ts`. Inside `client/`, install additional dependencies: `react-router-dom`, `axios`, `@tanstack/react-query`, `zustand` (state management), `react-hook-form`, `@hookform/resolvers`, `zod` (validation), `lucide-react` (icons), `react-hot-toast` (notifications), `clsx`, `tailwind-merge`. Install dev dependencies: `tailwindcss@3`, `postcss`, `autoprefixer`, `@types/react`, `@types/react-dom`. Initialize Tailwind: `npx tailwindcss init -p`. Configure `tailwind.config.js` content paths to `["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]`. Update `src/index.css` with Tailwind directives (`@tailwind base; @tailwind components; @tailwind utilities;`) plus custom CSS variables for the design system (primary blue #2563eb, secondary gray, accent orange). Create directory structure: `src/components/`, `src/pages/`, `src/hooks/`, `src/services/`, `src/store/`, `src/types/`, `src/utils/`, `src/layouts/`. Create `client/Dockerfile` with Node 20 Alpine, install deps, build, serve with nginx. Create `client/.env.example` with `VITE_API_URL=http://localhost:3001/api` and `VITE_AI_SERVICE_URL=http://localhost:8000`.

**Files Affected:**
- `client/package.json`
- `client/tsconfig.json`
- `client/vite.config.ts`
- `client/tailwind.config.js`
- `client/postcss.config.js`
- `client/src/index.css`
- `client/Dockerfile`
- `client/.env.example`
- `client/src/` (directory structure)

**Verification & Testing:** Run `cd client && npm install && npm run dev` and confirm Vite dev server starts on port 5173. Open browser to `http://localhost:5173` and verify the default Vite React page loads with Tailwind styles applied.

---

### Step 1.4: Initialize Python AI Engine (FastAPI)

**Implementation Details:** Create `ai-engine/` directory. Create `ai-engine/requirements.txt` with: `fastapi==0.115.0`, `uvicorn[standard]==0.30.0`, `sqlalchemy==2.0.35`, `psycopg2-binary==2.9.9`, `python-multipart==0.0.9`, `pdfminer.six==20231228`, `python-docx==1.1.0`, `spacy==3.7.5`, `scikit-learn==1.5.1`, `sentence-transformers==3.0.1`, `numpy==1.26.4`, `pandas==2.2.2`, `pydantic==2.8.0`, `pydantic-settings==2.4.0`, `python-jose[cryptography]==3.3.0`, `httpx==0.27.0`, `alembic==1.13.2`. Create `ai-engine/pyproject.toml` with project metadata. Create directory structure: `ai-engine/app/`, `ai-engine/app/api/`, `ai-engine/app/api/routes/`, `ai-engine/app/core/`, `ai-engine/app/models/`, `ai-engine/app/services/`, `ai-engine/app/schemas/`, `ai-engine/app/ml/`. Create `ai-engine/app/__init__.py` and `__init__.py` in every subdirectory. Create `ai-engine/app/main.py` with FastAPI app initialization, CORS middleware (allowing localhost:5173 and localhost:3001), and a health check endpoint at `/health`. Create `ai-engine/app/core/config.py` using pydantic-settings BaseSettings to load DATABASE_URL, MODEL_PATH, SPACY_MODEL from environment. Create `ai-engine/Dockerfile` with Python 3.11-slim, install system deps (build-essential, libpq-dev), copy requirements, pip install, download spaCy model `en_core_web_md`, copy source, expose 8000, CMD uvicorn app.main:app. Create `ai-engine/.env.example`.

**Files Affected:**
- `ai-engine/requirements.txt`
- `ai-engine/pyproject.toml`
- `ai-engine/Dockerfile`
- `ai-engine/.env.example`
- `ai-engine/app/__init__.py`
- `ai-engine/app/main.py`
- `ai-engine/app/core/__init__.py`
- `ai-engine/app/core/config.py`
- `ai-engine/app/api/__init__.py`
- `ai-engine/app/api/routes/__init__.py`
- `ai-engine/app/models/__init__.py`
- `ai-engine/app/services/__init__.py`
- `ai-engine/app/schemas/__init__.py`
- `ai-engine/app/ml/__init__.py`

**Verification & Testing:** Run `cd ai-engine && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && python -m spacy download en_core_web_md && uvicorn app.main:app --reload`. Hit `http://localhost:8000/health` and confirm a JSON response `{"status": "ok"}`. Hit `http://localhost:8000/docs` to confirm Swagger UI loads.

---

### Step 1.5: Create Express Server Entry Point with Middleware Stack

**Implementation Details:** Create `server/src/index.ts` as the main entry point. Import and configure: `express()`, `cors({origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true})`, `helmet()` with appropriate CSP settings, `morgan('dev')` for request logging, `cookieParser()`, `express.json({limit: '10mb'})`, `express.urlencoded({extended: true})`. Add a health check route at `GET /api/health` returning `{status: 'ok', timestamp: Date.now()}`. Add global error handling middleware at the bottom that catches all errors, logs them, and returns standardized error responses `{success: false, message: string, errors?: any[]}`. Create `server/src/config/index.ts` exporting a typed configuration object reading from `process.env`: PORT (default 3001), DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRY ('15m'), JWT_REFRESH_EXPIRY ('7d'), AI_SERVICE_URL (default 'http://localhost:8000'), CLIENT_URL, SMTP config, S3 config. Create `server/src/types/index.ts` with shared TypeScript interfaces: `ApiResponse<T>`, `PaginationParams`, `AuthenticatedRequest` (extending Express Request with user payload). Listen on configured PORT.

**Files Affected:**
- `server/src/index.ts`
- `server/src/config/index.ts`
- `server/src/types/index.ts`

**Verification & Testing:** Run `cd server && npm run dev`. Verify server starts on port 3001. Send `GET http://localhost:3001/api/health` using curl or browser and confirm `{"status":"ok","timestamp":...}` response. Send a request to a non-existent route and confirm the error handler returns a proper JSON error.

---

### Step 1.6: Docker Compose Full Stack Validation

**Implementation Details:** Update the root `docker-compose.yml` to include all environment variables from `.env.example` mapped to each service. Ensure the `postgres` service creates the initial database (`POSTGRES_DB: caliber`, `POSTGRES_USER: postgres`, `POSTGRES_PASSWORD: postgres`). Add volume mappings for development: `./server/src:/app/src` for server hot-reload, `./client/src:/app/src` for client hot-reload, `./ai-engine/app:/app/app` for AI engine hot-reload. Add a `networks` section with a shared `caliber-network` bridge. Create a root `.env` file from `.env.example` with development defaults filled in.

**Files Affected:**
- `docker-compose.yml` (update)
- `.env` (create from template)

**Verification & Testing:** Run `docker-compose up --build` from root. Wait for all services to start. Verify: `curl http://localhost:3001/api/health` returns ok, `curl http://localhost:8000/health` returns ok, `curl http://localhost:5173` returns HTML. Run `docker-compose ps` and confirm all 5 services (postgres, redis, server, ai-engine, client) are running. Run `docker-compose down` to clean up.

---

## Phase 2: Database Schema & ORM Setup

**Phase Objective:** Implement the complete database schema matching the ER diagram, configure Prisma ORM for the Node.js backend and SQLAlchemy for the Python AI engine, and seed the database with initial data.

---

### Step 2.1: Define Prisma Schema (All Entities from ER Diagram)

**Implementation Details:** Create `server/prisma/schema.prisma`. Set datasource to postgresql with `env("DATABASE_URL")`. Set generator to prisma-client-js. Define the following models exactly matching the ER diagram:

**User model:** `id` (String, @id, @default(uuid())), `name` (String), `email` (String, @unique), `password` (String), `role` (enum UserRole: JOB_SEEKER, EMPLOYER, ADMIN), `phone` (String?), `location` (String?), `bio` (String?), `avatar` (String?), `isActive` (Boolean, @default(true)), `createdAt` (DateTime, @default(now())), `updatedAt` (DateTime, @updatedAt). Relations: `jobs` (Job[]), `applications` (Application[]), `resumes` (Resume[]), `recommendations` (AiRecommendation[]), `userSkills` (UserSkill[]), `companyProfile` (CompanyProfile?).

**Job model:** `id` (String, @id, @default(uuid())), `employerId` (String, FK to User), `title` (String), `description` (String), `requirements` (String), `location` (String), `salaryMin` (Int?), `salaryMax` (Int?), `employmentType` (enum EmploymentType: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, REMOTE), `isActive` (Boolean, @default(true)), `createdAt` (DateTime), `updatedAt` (DateTime). Relations: `employer` (User), `applications` (Application[]), `jobSkills` (JobSkill[]), `recommendations` (AiRecommendation[]).

**Application model:** `id` (String, @id, @default(uuid())), `userId` (String, FK), `jobId` (String, FK), `status` (enum ApplicationStatus: PENDING, REVIEWED, SHORTLISTED, REJECTED, ACCEPTED), `coverLetter` (String?), `appliedAt` (DateTime, @default(now())), `updatedAt` (DateTime). Relations: `user` (User), `job` (Job). Add `@@unique([userId, jobId])` to prevent duplicate applications.

**Resume model:** `id` (String, @id, @default(uuid())), `userId` (String, FK), `filePath` (String), `fileName` (String), `extractedText` (String?), `parsedData` (Json?), `isActive` (Boolean, @default(true)), `uploadedAt` (DateTime, @default(now())). Relations: `user` (User).

**Skill model:** `id` (String, @id, @default(uuid())), `name` (String, @unique), `category` (String?). Relations: `userSkills` (UserSkill[]), `jobSkills` (JobSkill[]).

**UserSkill model (junction):** `id` (String, @id, @default(uuid())), `userId` (String, FK), `skillId` (String, FK), `proficiencyLevel` (Int?, 1-5). Relations: `user` (User), `skill` (Skill). `@@unique([userId, skillId])`.

**JobSkill model (junction):** `id` (String, @id, @default(uuid())), `jobId` (String, FK), `skillId` (String, FK), `requiredLevel` (Int?, 1-5). Relations: `job` (Job), `skill` (Skill). `@@unique([jobId, skillId])`.

**AiRecommendation model:** `id` (String, @id, @default(uuid())), `userId` (String, FK), `jobId` (String, FK), `matchScore` (Float), `skillGap` (Json?), `explanation` (String?), `createdAt` (DateTime, @default(now())). Relations: `user` (User), `job` (Job).

**CompanyProfile model:** `id` (String, @id, @default(uuid())), `userId` (String, @unique, FK), `companyName` (String), `industry` (String?), `website` (String?), `description` (String?), `size` (String?), `logo` (String?). Relations: `user` (User).

Add `@@map` annotations to snake_case table names for each model (e.g., `@@map("users")`, `@@map("jobs")`). Add appropriate `@@index` annotations on foreign keys and commonly queried fields.

**Files Affected:**
- `server/prisma/schema.prisma`

**Verification & Testing:** Run `cd server && npx prisma validate` to confirm the schema is syntactically correct. Run `npx prisma format` to auto-format. Verify no validation errors are reported.

---

### Step 2.2: Run Initial Prisma Migration

**Implementation Details:** Ensure PostgreSQL is running (via docker-compose or locally). Set the DATABASE_URL environment variable to `postgresql://postgres:postgres@localhost:5432/caliber`. Run the Prisma migration command to generate and apply the migration. This will create all tables, indexes, enums, and constraints defined in the schema. Then run `npx prisma generate` to generate the Prisma Client TypeScript types.

**Files Affected:**
- `server/prisma/migrations/YYYYMMDDHHMMSS_init/migration.sql` (auto-generated)
- `server/node_modules/.prisma/client/` (auto-generated)

**Verification & Testing:** Run `npx prisma migrate dev --name init`. Verify migration applies without errors. Run `npx prisma studio` and verify all tables appear in the web UI (users, jobs, applications, resumes, skills, user_skills, job_skills, ai_recommendations, company_profiles). Verify enum types UserRole, EmploymentType, ApplicationStatus exist.

---

### Step 2.3: Create Prisma Client Singleton

**Implementation Details:** Create `server/src/config/database.ts`. Import PrismaClient from `@prisma/client`. Implement a singleton pattern: declare a global variable to hold the Prisma instance. Export a function `getPrisma()` that returns the existing instance or creates a new one with `log: ['query', 'error', 'warn']` in development mode. Add a graceful shutdown handler that calls `prisma.$disconnect()` on `SIGINT` and `SIGTERM`. Export the `prisma` instance as default export.

**Files Affected:**
- `server/src/config/database.ts`

**Verification & Testing:** Import the prisma client in `server/src/index.ts` and add a startup check: `prisma.$connect().then(() => console.log('Database connected'))`. Run `npm run dev` and verify "Database connected" appears in console output.

---

### Step 2.4: Create Database Seed Script

**Implementation Details:** Create `server/prisma/seed.ts`. Import the Prisma client. Write a `main()` async function that:

1. Creates 3 admin users (hashed passwords using bcryptjs with salt rounds 12).
2. Creates 10 sample employer users with company profiles (e.g., "TechCorp", "DataFlow Inc", "InnovateLabs").
3. Creates 15 sample job seeker users with varied profiles.
4. Creates 50+ skills across categories: "Programming" (JavaScript, TypeScript, Python, Java, C++, Go, Rust, etc.), "Frontend" (React, Angular, Vue, HTML, CSS, Tailwind), "Backend" (Node.js, Express, Django, FastAPI, Spring), "Database" (PostgreSQL, MongoDB, MySQL, Redis), "DevOps" (Docker, Kubernetes, AWS, CI/CD), "Soft Skills" (Communication, Leadership, Teamwork), "Data Science" (Machine Learning, NLP, TensorFlow, PyTorch, Pandas).
5. Creates 30 sample job postings linked to employer users, with realistic titles, descriptions, requirements, salary ranges, locations, employment types.
6. Links skills to jobs via JobSkill entries with required levels.
7. Links skills to users via UserSkill entries with proficiency levels.
8. Creates 20 sample applications with various statuses.
9. Creates 10 sample AI recommendations with match scores and skill gap data.

Use `prisma.$transaction()` for atomicity. Add the seed script to `package.json`: `"prisma": {"seed": "ts-node prisma/seed.ts"}`.

**Files Affected:**
- `server/prisma/seed.ts`
- `server/package.json` (add prisma.seed config)

**Verification & Testing:** Run `npx prisma db seed`. Verify it completes without errors. Run `npx prisma studio` and verify: users table has 28 entries, skills table has 50+ entries, jobs table has 30 entries, applications table has 20 entries, ai_recommendations table has 10 entries. Spot-check that relationships are intact (e.g., a job's employer reference resolves to a real user).

---

### Step 2.5: Configure SQLAlchemy Models for Python AI Engine

**Implementation Details:** Create `ai-engine/app/core/database.py`. Configure SQLAlchemy async engine using `create_async_engine` with the same DATABASE_URL (converted to async postgres driver: `postgresql+asyncpg://...`). Create an `AsyncSessionLocal` sessionmaker. Create a `Base` declarative base. Create a `get_db()` async generator dependency for FastAPI.

Create `ai-engine/app/models/user.py` mirroring the User table (read-only from AI engine perspective). Create `ai-engine/app/models/job.py` mirroring the Job table with job_skills relationship. Create `ai-engine/app/models/resume.py` mirroring the Resume table. Create `ai-engine/app/models/skill.py` mirroring the Skill, UserSkill, JobSkill tables. Create `ai-engine/app/models/recommendation.py` mirroring the AiRecommendation table (read-write).

All models must use the same table names as Prisma's `@@map` values to share the database. Column types must match exactly.

**Files Affected:**
- `ai-engine/app/core/database.py`
- `ai-engine/app/models/user.py`
- `ai-engine/app/models/job.py`
- `ai-engine/app/models/resume.py`
- `ai-engine/app/models/skill.py`
- `ai-engine/app/models/recommendation.py`
- `ai-engine/app/models/__init__.py` (update with imports)
- `ai-engine/requirements.txt` (add `asyncpg==0.29.0`)

**Verification & Testing:** Start the AI engine with `uvicorn app.main:app --reload`. Add a temporary test endpoint `GET /test-db` that runs `SELECT 1` via SQLAlchemy and returns success. Hit the endpoint and verify database connectivity. Remove the test endpoint after verification.

---

## Phase 3: Authentication & Authorization System

**Phase Objective:** Implement complete user authentication with JWT access/refresh tokens, role-based authorization middleware, and all registration/login flows for the three user roles (Job Seeker, Employer, Admin).

---

### Step 3.1: Create Password Utility and JWT Token Service

**Implementation Details:** Create `server/src/utils/password.ts`. Implement `hashPassword(plain: string): Promise<string>` using bcryptjs with 12 salt rounds. Implement `comparePassword(plain: string, hashed: string): Promise<boolean>`.

Create `server/src/utils/jwt.ts`. Implement `generateAccessToken(payload: {userId: string, role: UserRole}): string` using jsonwebtoken with JWT_SECRET and expiry from config (15 minutes). Implement `generateRefreshToken(payload: {userId: string}): string` using JWT_REFRESH_SECRET and 7-day expiry. Implement `verifyAccessToken(token: string): JwtPayload | null` with try-catch returning null on failure. Implement `verifyRefreshToken(token: string): JwtPayload | null`. Define `JwtPayload` interface with `userId`, `role`, `iat`, `exp`.

**Files Affected:**
- `server/src/utils/password.ts`
- `server/src/utils/jwt.ts`

**Verification & Testing:** Create a temporary test in `server/src/index.ts`: hash a known password, compare it (should return true), compare with wrong password (should return false). Generate a token, verify it (should return payload), verify with wrong secret (should return null). Log all results. Remove test code after verification.

---

### Step 3.2: Create Authentication Middleware

**Implementation Details:** Create `server/src/middleware/auth.ts`. Implement `authenticate` middleware: extract Bearer token from `Authorization` header, verify using `verifyAccessToken()`, if valid attach `{userId, role}` to `req.user` (typed via `AuthenticatedRequest`) and call `next()`, if invalid return 401 `{success: false, message: 'Invalid or expired token'}`.

Implement `authorize(...roles: UserRole[])` middleware factory: return a middleware that checks if `req.user.role` is in the allowed roles array, if not return 403 `{success: false, message: 'Insufficient permissions'}`.

Implement `optionalAuth` middleware: same as authenticate but calls `next()` even if no token is present (for endpoints accessible by both authenticated and anonymous users).

**Files Affected:**
- `server/src/middleware/auth.ts`

**Verification & Testing:** Verification will be done in Step 3.4 when the auth routes are complete and testable via HTTP requests.

---

### Step 3.3: Create Validation Middleware

**Implementation Details:** Create `server/src/middleware/validate.ts`. Implement a generic validation middleware using `express-validator`. Create `validate` function that takes an array of `ValidationChain` from express-validator, runs them, and if errors exist returns 400 `{success: false, message: 'Validation failed', errors: formatted_errors}`.

Create `server/src/validators/auth.validators.ts`. Define validation chains:
- `registerValidation`: body('name').trim().notEmpty().isLength({min:2, max:100}), body('email').isEmail().normalizeEmail(), body('password').isLength({min:8}).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/) with message about requirements, body('role').isIn(['JOB_SEEKER', 'EMPLOYER']).
- `loginValidation`: body('email').isEmail().normalizeEmail(), body('password').notEmpty().

**Files Affected:**
- `server/src/middleware/validate.ts`
- `server/src/validators/auth.validators.ts`

**Verification & Testing:** Will be tested end-to-end in Step 3.4.

---

### Step 3.4: Implement Auth Controller and Routes

**Implementation Details:** Create `server/src/controllers/auth.controller.ts`. Implement:

- `register`: Validate input. Check if email already exists in database. Hash password. Create user with Prisma. If role is EMPLOYER, also create an empty CompanyProfile entry. Generate access and refresh tokens. Set refresh token as httpOnly cookie (secure in production, sameSite: 'lax', maxAge: 7 days). Return 201 with `{success: true, data: {user: {id, name, email, role}, accessToken}}`.

- `login`: Find user by email with Prisma. If not found, return 401 "Invalid credentials" (don't reveal whether email exists). Compare password. If wrong, return 401. If user.isActive is false, return 403 "Account is deactivated". Generate tokens. Set refresh cookie. Return 200 with user data and access token.

- `refreshToken`: Extract refresh token from cookie. Verify it. Find user by userId from token payload. If user not found or inactive, clear cookie and return 401. Generate new access token and new refresh token. Set new refresh cookie. Return 200 with new access token.

- `logout`: Clear the refresh token cookie. Return 200 `{success: true, message: 'Logged out'}`.

- `getMe`: Uses `authenticate` middleware. Fetch current user from database by `req.user.userId` including relations (userSkills with skill, companyProfile). Return user data (excluding password).

Create `server/src/routes/auth.routes.ts`. Define router with:
- `POST /api/auth/register` -> registerValidation + validate + register
- `POST /api/auth/login` -> loginValidation + validate + login
- `POST /api/auth/refresh` -> refreshToken
- `POST /api/auth/logout` -> logout
- `GET /api/auth/me` -> authenticate + getMe

Mount auth routes in `server/src/index.ts`.

**Files Affected:**
- `server/src/controllers/auth.controller.ts`
- `server/src/routes/auth.routes.ts`
- `server/src/index.ts` (add route import)

**Verification & Testing:** Using curl or Postman:
1. `POST /api/auth/register` with `{name:"Test User", email:"test@test.com", password:"Test1234", role:"JOB_SEEKER"}` -> expect 201 with user data and access token.
2. `POST /api/auth/register` with same email -> expect 400/409 duplicate error.
3. `POST /api/auth/login` with correct credentials -> expect 200 with token.
4. `POST /api/auth/login` with wrong password -> expect 401.
5. `GET /api/auth/me` with valid Bearer token -> expect 200 with user data.
6. `GET /api/auth/me` without token -> expect 401.
7. `POST /api/auth/refresh` with valid cookie -> expect 200 with new token.
8. `POST /api/auth/logout` -> expect 200 and cookie cleared.

---

### Step 3.5: Create Route Index and API Router

**Implementation Details:** Create `server/src/routes/index.ts` as a central router aggregator. Import all route modules and mount them under their prefixes: `router.use('/auth', authRoutes)`. Future route modules (users, jobs, applications, etc.) will be added here. Mount this aggregated router in `server/src/index.ts` under `/api` prefix so all routes become `/api/auth/...`, `/api/users/...`, etc.

**Files Affected:**
- `server/src/routes/index.ts`
- `server/src/index.ts` (update to use aggregated router)

**Verification & Testing:** Hit `GET /api/auth/me` with a valid token and confirm the route still works through the aggregated router. Hit a non-existent route like `GET /api/nonexistent` and confirm a 404 JSON response.

---

## Phase 4: User Profile Management (Job Seeker & Employer)

**Phase Objective:** Implement full CRUD for user profiles, including job seeker profile editing (bio, location, skills, preferences) and employer company profile management, matching the Candidate Profile Management (SRS 3.2.1) and the User entity from the ER diagram.

---

### Step 4.1: Create User Controller - Profile View & Update

**Implementation Details:** Create `server/src/controllers/user.controller.ts`.

- `getProfile(req, res)`: Fetch user by ID from params (or current user if `/me`). Include relations: userSkills (with skill), resumes, companyProfile. Exclude password field using Prisma `select` or a utility function `excludeFields()`. Return 200 with user data.

- `updateProfile(req, res)`: Authenticated. Allow updating: name, phone, location, bio, avatar. Validate inputs. Use `prisma.user.update()`. Return updated user.

- `updateSkills(req, res)`: Authenticated. Accept `skills: [{skillName: string, proficiencyLevel: number}]`. For each skill: find or create the Skill record by name (using `upsert`), then upsert UserSkill. Delete any UserSkill entries for this user that aren't in the new list (full replacement strategy). Use `prisma.$transaction()`. Return updated skills list.

- `getAllUsers(req, res)`: Admin only. Accept query params: page, limit, role, search (name/email), isActive. Use Prisma pagination with `skip` and `take`. Return paginated result with total count.

- `toggleUserActive(req, res)`: Admin only. Toggle `isActive` on a user by ID. Return updated user.

Create `server/src/validators/user.validators.ts` with validation chains for updateProfile and updateSkills.

**Files Affected:**
- `server/src/controllers/user.controller.ts`
- `server/src/validators/user.validators.ts`

**Verification & Testing:**
1. `PATCH /api/users/me` with `{name: "Updated Name", location: "Istanbul"}` -> expect 200 with updated data.
2. `PUT /api/users/me/skills` with `{skills: [{skillName: "JavaScript", proficiencyLevel: 4}, {skillName: "React", proficiencyLevel: 3}]}` -> expect 200. Verify in Prisma Studio that skills and user_skills records are created.
3. `GET /api/users?role=JOB_SEEKER&page=1&limit=10` with admin token -> expect paginated list.

---

### Step 4.2: Create Employer Company Profile Controller

**Implementation Details:** Create `server/src/controllers/company.controller.ts`.

- `updateCompanyProfile(req, res)`: Authenticated, EMPLOYER role only. Accept: companyName, industry, website, description, size, logo. Use `prisma.companyProfile.upsert()` (create if not exists, update if exists) where userId matches current user. Return updated profile.

- `getCompanyProfile(req, res)`: Public. Fetch company profile by user ID. Include the employer's active job listings count. Return profile with job count.

- `getAllCompanies(req, res)`: Public. Accept query params: search (company name), industry, page, limit. Return paginated company profiles with basic employer info.

Create `server/src/validators/company.validators.ts`.

**Files Affected:**
- `server/src/controllers/company.controller.ts`
- `server/src/validators/company.validators.ts`

**Verification & Testing:**
1. `PUT /api/companies/profile` with employer token and `{companyName: "TechCorp", industry: "Technology"}` -> expect 200.
2. `GET /api/companies/:userId` -> expect company profile with job count.
3. `GET /api/companies?search=Tech` -> expect filtered list.

---

### Step 4.3: Create User and Company Routes

**Implementation Details:** Create `server/src/routes/user.routes.ts`:
- `GET /users/me` -> authenticate + getProfile (current user)
- `GET /users/:id` -> optionalAuth + getProfile (public profile view)
- `PATCH /users/me` -> authenticate + validate + updateProfile
- `PUT /users/me/skills` -> authenticate + validate + updateSkills
- `GET /users` -> authenticate + authorize(ADMIN) + getAllUsers
- `PATCH /users/:id/toggle-active` -> authenticate + authorize(ADMIN) + toggleUserActive

Create `server/src/routes/company.routes.ts`:
- `PUT /companies/profile` -> authenticate + authorize(EMPLOYER) + validate + updateCompanyProfile
- `GET /companies/:userId` -> getCompanyProfile
- `GET /companies` -> getAllCompanies

Register both route modules in `server/src/routes/index.ts`.

**Files Affected:**
- `server/src/routes/user.routes.ts`
- `server/src/routes/company.routes.ts`
- `server/src/routes/index.ts` (update)

**Verification & Testing:** Run through the complete flow: register as employer -> update company profile -> register as job seeker -> update profile and skills -> register as admin -> list all users. Verify each endpoint returns correct data and authorization works (job seeker can't access admin routes, etc.).

---

### Step 4.4: Avatar Upload Endpoint

**Implementation Details:** Create `server/src/config/upload.ts`. Configure multer with: `storage: diskStorage` saving to `uploads/avatars/` with filename pattern `{userId}-{timestamp}.{ext}`, `fileFilter` allowing only image MIME types (jpeg, png, gif, webp), `limits: {fileSize: 5 * 1024 * 1024}` (5MB max). Create the uploads directory structure: `uploads/avatars/`, `uploads/resumes/`.

Add to user controller: `uploadAvatar(req, res)`: Accept single file upload via multer. Validate file exists. If user already has an avatar, delete the old file from disk. Update user's avatar field with the file path. Return updated user with new avatar URL.

Add static file serving in `server/src/index.ts`: `app.use('/uploads', express.static('uploads'))`.

Add route: `POST /users/me/avatar` -> authenticate + multer.single('avatar') + uploadAvatar.

**Files Affected:**
- `server/src/config/upload.ts`
- `server/src/controllers/user.controller.ts` (add uploadAvatar)
- `server/src/routes/user.routes.ts` (add route)
- `server/src/index.ts` (add static serving)

**Verification & Testing:** Upload an image file via `POST /api/users/me/avatar` with multipart/form-data. Verify the file appears in `uploads/avatars/`. Verify the returned user object has the avatar path. Access the avatar via `GET /uploads/avatars/{filename}` and confirm the image is served. Upload a non-image file and verify rejection.

---

## Phase 5: Job Posting Management

**Phase Objective:** Implement complete job posting CRUD for employers, job browsing/searching for candidates, and admin job management, matching SRS 3.2.2 (Job Posting Management).

---

### Step 5.1: Create Job Controller

**Implementation Details:** Create `server/src/controllers/job.controller.ts`.

- `createJob(req, res)`: Authenticated, EMPLOYER only. Accept: title, description, requirements, location, salaryMin, salaryMax, employmentType, skills (array of `{name: string, requiredLevel: number}`). Create job with Prisma. For each skill: find or create Skill by name, then create JobSkill entry. Use transaction. Return 201 with created job including skills.

- `updateJob(req, res)`: Authenticated, EMPLOYER only. Verify the job belongs to the requesting employer (`job.employerId === req.user.userId`). Update allowed fields. If skills array provided, delete existing JobSkill entries and recreate (full replacement). Return updated job.

- `deleteJob(req, res)`: Authenticated, EMPLOYER or ADMIN. Soft delete: set `isActive: false`. Return confirmation.

- `getJob(req, res)`: Public. Fetch job by ID. Include: employer (with companyProfile), jobSkills (with skill), application count. Return job data.

- `getAllJobs(req, res)`: Public. Accept query params: `search` (title/description full-text), `location`, `employmentType`, `salaryMin`, `salaryMax`, `skills` (comma-separated skill names), `page`, `limit`, `sortBy` (createdAt, salaryMax, title), `sortOrder` (asc, desc). Build dynamic Prisma `where` clause. Only return active jobs. Include employer companyProfile and skill names. Return paginated results with total count.

- `getEmployerJobs(req, res)`: Authenticated, EMPLOYER. Fetch all jobs posted by current employer. Include application counts per job. Support pagination.

Create `server/src/validators/job.validators.ts` with validation chains for createJob and updateJob: title (2-200 chars), description (10-10000 chars), requirements (10-5000 chars), location (required), employmentType (valid enum), salaryMin/salaryMax (optional positive integers with min <= max).

**Files Affected:**
- `server/src/controllers/job.controller.ts`
- `server/src/validators/job.validators.ts`

**Verification & Testing:**
1. `POST /api/jobs` with employer token and full job data including skills -> expect 201 with job + linked skills.
2. `GET /api/jobs?search=developer&location=Istanbul&skills=React,TypeScript&page=1&limit=10` -> expect filtered paginated results.
3. `GET /api/jobs/:id` -> expect full job detail with employer info and skills.
4. `PATCH /api/jobs/:id` with different employer's token -> expect 403.
5. `DELETE /api/jobs/:id` with correct employer token -> expect job becomes inactive.

---

### Step 5.2: Create Job Routes

**Implementation Details:** Create `server/src/routes/job.routes.ts`:
- `POST /jobs` -> authenticate + authorize(EMPLOYER) + validate(createJobValidation) + createJob
- `GET /jobs` -> getAllJobs (public)
- `GET /jobs/my-listings` -> authenticate + authorize(EMPLOYER) + getEmployerJobs
- `GET /jobs/:id` -> getJob (public)
- `PATCH /jobs/:id` -> authenticate + authorize(EMPLOYER) + validate(updateJobValidation) + updateJob
- `DELETE /jobs/:id` -> authenticate + authorize(EMPLOYER, ADMIN) + deleteJob

Register in `server/src/routes/index.ts`.

**Files Affected:**
- `server/src/routes/job.routes.ts`
- `server/src/routes/index.ts` (update)

**Verification & Testing:** Full integration test: create 3 jobs as employer, browse as unauthenticated user with various filters, verify pagination returns correct total count and page data, verify sorting works.

---

## Phase 6: Resume Upload & Parsing

**Phase Objective:** Implement resume file upload on the Node.js backend and resume text extraction/parsing on the Python AI engine, matching the Sequence Diagram flow (Upload Resume -> Parse Resume File -> Analyze Resume Data -> Respond with Extracted Data).

---

### Step 6.1: Resume Upload Endpoint (Node.js Backend)

**Implementation Details:** Create `server/src/controllers/resume.controller.ts`.

- `uploadResume(req, res)`: Authenticated, JOB_SEEKER only. Use multer configured for resume uploads: storage to `uploads/resumes/`, allow MIME types `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, max size 10MB. Save the file. Create a Resume record in database with filePath, fileName, userId. Then make an HTTP POST request to the AI engine at `${AI_SERVICE_URL}/api/parse-resume` sending the file path (or the file itself via form-data). The AI engine will return extractedText and parsedData (structured skills, experience, education). Update the Resume record with extractedText and parsedData. Also auto-create UserSkill entries for any skills the AI engine extracted. Return 201 with the full resume data including parsed results.

- `getResumes(req, res)`: Authenticated. Fetch all resumes for current user, ordered by uploadedAt desc. Return list.

- `getResume(req, res)`: Authenticated. Fetch single resume by ID, verify it belongs to current user. Return resume data including parsedData.

- `deleteResume(req, res)`: Authenticated. Verify ownership. Delete file from disk. Delete Resume record. Return confirmation.

- `downloadResume(req, res)`: Authenticated. Verify ownership (or EMPLOYER viewing an applicant's resume). Stream the file from disk as a download.

**Files Affected:**
- `server/src/controllers/resume.controller.ts`
- `server/src/config/upload.ts` (add resume upload config)

**Verification & Testing:**
1. Upload a PDF resume via `POST /api/resumes/upload` -> expect 201, file exists on disk, Resume record in DB.
2. Upload a DOCX resume -> same verification.
3. Upload a .txt file -> expect rejection.
4. `GET /api/resumes` -> expect list of uploaded resumes.
5. `GET /api/resumes/:id/download` -> expect file download.

---

### Step 6.2: Resume Parsing Service (Python AI Engine)

**Implementation Details:** Create `ai-engine/app/services/resume_parser.py`. Implement `ResumeParser` class:

- `parse_pdf(file_path: str) -> str`: Use pdfminer.six's `extract_text()` to extract all text from PDF. Handle multi-page PDFs.

- `parse_docx(file_path: str) -> str`: Use python-docx to read paragraphs and tables, concatenate all text.

- `parse_doc(file_path: str) -> str`: Use subprocess to call `antiword` or `libreoffice --convert-to txt` as fallback.

- `extract_structured_data(raw_text: str) -> dict`: Use spaCy NLP pipeline (`en_core_web_md` model) to:
  1. Extract personal info (name via NER PERSON entity, email via regex, phone via regex).
  2. Extract education (look for patterns like university names, degree types, GPA, graduation years using regex + NER).
  3. Extract work experience (identify company names via NER ORG, job titles via pattern matching, date ranges).
  4. Extract skills (match against a predefined skills taxonomy loaded from the database; also use spaCy's matcher for skill-like phrases).
  5. Extract certifications (pattern match for "certified", "certification", known cert names).
  6. Return structured dict: `{name, email, phone, education: [{institution, degree, field, year}], experience: [{company, title, duration, description}], skills: [string], certifications: [string]}`.

Create `ai-engine/app/schemas/resume.py` with Pydantic models: `ResumeParseRequest(file_path: str)`, `ParsedResumeData(name, email, phone, education, experience, skills, certifications, raw_text)`, `ResumeParseResponse(extracted_text: str, parsed_data: ParsedResumeData)`.

Create `ai-engine/app/api/routes/resume.py` with:
- `POST /api/parse-resume`: Accept file_path in request body. Call ResumeParser to extract text and structured data. Return ResumeParseResponse.

Register the route in `ai-engine/app/main.py`.

**Files Affected:**
- `ai-engine/app/services/resume_parser.py`
- `ai-engine/app/schemas/resume.py`
- `ai-engine/app/api/routes/resume.py`
- `ai-engine/app/main.py` (register route)

**Verification & Testing:**
1. Start AI engine. POST to `http://localhost:8000/api/parse-resume` with `{file_path: "/path/to/test.pdf"}` using a real sample resume PDF. Verify response contains extracted_text (non-empty string) and parsed_data with skills array.
2. Test with a DOCX resume file. Verify parsing works.
3. Test with a resume containing known skills (e.g., "Python", "JavaScript", "Machine Learning") and verify they appear in the skills array.

---

### Step 6.3: Create Resume Routes

**Implementation Details:** Create `server/src/routes/resume.routes.ts`:
- `POST /resumes/upload` -> authenticate + authorize(JOB_SEEKER) + multer.single('resume') + uploadResume
- `GET /resumes` -> authenticate + getResumes
- `GET /resumes/:id` -> authenticate + getResume
- `GET /resumes/:id/download` -> authenticate + downloadResume
- `DELETE /resumes/:id` -> authenticate + deleteResume

Create `server/src/services/aiEngine.service.ts` as a centralized HTTP client for communicating with the AI engine. Use axios with baseURL from config. Implement methods: `parseResume(filePath: string): Promise<ParsedResumeResponse>`, and placeholder methods for future AI features (matchJobs, etc.). Include error handling and timeout configuration (30 seconds for parsing).

Register resume routes in `server/src/routes/index.ts`.

**Files Affected:**
- `server/src/routes/resume.routes.ts`
- `server/src/services/aiEngine.service.ts`
- `server/src/routes/index.ts` (update)

**Verification & Testing:** Full end-to-end test: upload a PDF resume via the Node.js API -> Node.js saves file and calls AI engine -> AI engine parses and returns data -> Node.js saves parsed data to DB -> response includes parsed skills. Verify in Prisma Studio that Resume record has parsedData populated and UserSkill entries were auto-created.

---

## Phase 7: Calibering Engine

**Phase Objective:** Build the core AI matching algorithm that computes compatibility scores between candidates and jobs using NLP and ML techniques, matching SRS 3.2.3 (AI Matching Engine) and the AI Engine component from the System Architecture diagram.

---

### Step 7.1: Build Skills Taxonomy and Embedding Service

**Implementation Details:** Create `ai-engine/app/ml/embeddings.py`. Implement `EmbeddingService` class:

- `__init__`: Load the sentence-transformers model `all-MiniLM-L6-v2` (lightweight, good for semantic similarity). Cache the model as a class-level singleton.

- `encode_text(text: str) -> np.ndarray`: Encode a text string into a 384-dimensional embedding vector.

- `encode_batch(texts: list[str]) -> np.ndarray`: Batch encode multiple texts efficiently.

- `cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float`: Compute cosine similarity between two vectors.

Create `ai-engine/app/ml/skill_matcher.py`. Implement `SkillMatcher` class:

- `__init__(embedding_service: EmbeddingService)`: Store reference to embedding service. Load skill taxonomy from database on initialization.

- `compute_skill_overlap(user_skills: list[dict], job_skills: list[dict]) -> float`: Calculate weighted skill overlap. For each required job skill, check if user has it (exact match). If not exact, use embedding similarity to find the closest user skill and apply a threshold (>0.8 = partial match). Weight by required_level. Return a score 0-1.

- `identify_skill_gaps(user_skills: list[dict], job_skills: list[dict]) -> list[dict]`: For each job skill not matched by user skills, return `{skill_name, required_level, user_level: 0, gap: required_level}`.

**Files Affected:**
- `ai-engine/app/ml/embeddings.py`
- `ai-engine/app/ml/skill_matcher.py`

**Verification & Testing:** Write a test script `ai-engine/tests/test_embeddings.py`:
1. Encode "Python programming" and "Python developer" -> cosine similarity should be > 0.7.
2. Encode "Python programming" and "Cooking recipes" -> similarity should be < 0.3.
3. Test skill_overlap with known user/job skill sets and verify score is reasonable.

---

### Step 7.2: Build the Job Matching Algorithm

**Implementation Details:** Create `ai-engine/app/services/matching_engine.py`. Implement `MatchingEngine` class:

- `__init__(embedding_service, skill_matcher, db_session)`: Initialize with dependencies.

- `compute_match_score(user_id: str, job_id: str) -> MatchResult`: Core matching method. Fetch user profile (skills, resume parsed data, preferences) and job data (requirements, skills, description). Compute a composite score from multiple factors:
  1. **Skill Match Score (weight: 0.40)**: Use SkillMatcher.compute_skill_overlap().
  2. **Experience Relevance Score (weight: 0.25)**: Encode user's work experience text and job description using EmbeddingService, compute cosine similarity.
  3. **Education Match Score (weight: 0.15)**: Compare user education level/field against job requirements using keyword matching and semantic similarity.
  4. **Location Match Score (weight: 0.10)**: Exact match = 1.0, same country = 0.7, remote job = 1.0, otherwise 0.3.
  5. **Salary Fit Score (weight: 0.10)**: If user has salary expectations and job has range, score = 1.0 if within range, scaled down otherwise.

  Final score = weighted sum, normalized to 0-100. Return `MatchResult(score, breakdown: {skill, experience, education, location, salary}, skill_gaps, explanation)`.

- `generate_explanation(breakdown: dict, skill_gaps: list) -> str`: Generate a human-readable explanation string. E.g., "Strong match (85/100): Your skills closely align with this role, especially in Python and Machine Learning. Consider developing skills in Kubernetes and AWS to improve your fit."

- `match_user_to_jobs(user_id: str, limit: int = 20) -> list[MatchResult]`: Fetch all active jobs. For each, compute match score. Sort descending. Return top `limit` results. Save results to AI_RECOMMENDATION table.

- `match_job_to_candidates(job_id: str, limit: int = 20) -> list[MatchResult]`: Inverse matching for employers. Fetch all active job seekers. Score each. Return top candidates.

Create `ai-engine/app/schemas/matching.py` with Pydantic models: `MatchResult`, `MatchBreakdown`, `SkillGap`, `MatchRequest`, `MatchResponse`, `BulkMatchResponse`.

**Files Affected:**
- `ai-engine/app/services/matching_engine.py`
- `ai-engine/app/schemas/matching.py`

**Verification & Testing:** Create test script `ai-engine/tests/test_matching.py`. Use seeded database data. Compute match score for a known user-job pair. Verify:
1. Score is between 0-100.
2. Breakdown has all 5 components summing correctly.
3. Skill gaps list is non-empty when user lacks required skills.
4. Explanation string is non-empty and readable.

---

### Step 7.3: Create Matching API Endpoints

**Implementation Details:** Create `ai-engine/app/api/routes/matching.py`:

- `POST /api/match/user-to-jobs`: Accept `{user_id: str, limit: int = 20}`. Call `match_user_to_jobs()`. Save recommendations to database. Return ranked list of matches with scores, breakdowns, and explanations.

- `POST /api/match/job-to-candidates`: Accept `{job_id: str, limit: int = 20}`. Call `match_job_to_candidates()`. Return ranked candidates.

- `POST /api/match/score`: Accept `{user_id: str, job_id: str}`. Call `compute_match_score()`. Return single match result.

- `GET /api/recommendations/{user_id}`: Fetch cached recommendations from AI_RECOMMENDATION table for this user, ordered by match_score desc. Return list.

Register routes in `ai-engine/app/main.py`.

**Files Affected:**
- `ai-engine/app/api/routes/matching.py`
- `ai-engine/app/main.py` (register routes)

**Verification & Testing:**
1. `POST http://localhost:8000/api/match/user-to-jobs` with a seeded user_id -> expect ranked job list with scores.
2. `POST http://localhost:8000/api/match/job-to-candidates` with a seeded job_id -> expect ranked candidates.
3. `POST http://localhost:8000/api/match/score` with specific user+job -> expect detailed breakdown.
4. `GET http://localhost:8000/api/recommendations/{user_id}` -> expect cached results from database.

---

### Step 7.4: Integrate Matching Engine with Node.js Backend

**Implementation Details:** Update `server/src/services/aiEngine.service.ts` to add methods:
- `getJobRecommendations(userId: string, limit?: number)`: POST to AI engine `/api/match/user-to-jobs`.
- `getCandidateRecommendations(jobId: string, limit?: number)`: POST to AI engine `/api/match/job-to-candidates`.
- `getMatchScore(userId: string, jobId: string)`: POST to AI engine `/api/match/score`.

Create `server/src/controllers/recommendation.controller.ts`:
- `getMyRecommendations(req, res)`: Authenticated, JOB_SEEKER. Call AI engine to generate fresh recommendations (or fetch cached if recent < 1 hour). Return ranked jobs with scores and explanations.
- `getCandidatesForJob(req, res)`: Authenticated, EMPLOYER. Verify job belongs to employer. Call AI engine. Return ranked candidates.
- `getMatchDetail(req, res)`: Authenticated. Get detailed match breakdown for a specific user-job pair.
- `refreshRecommendations(req, res)`: Authenticated, JOB_SEEKER. Force re-computation of recommendations by calling AI engine. Return fresh results.

Create `server/src/routes/recommendation.routes.ts`:
- `GET /recommendations` -> authenticate + authorize(JOB_SEEKER) + getMyRecommendations
- `GET /recommendations/job/:jobId/candidates` -> authenticate + authorize(EMPLOYER) + getCandidatesForJob
- `GET /recommendations/match/:jobId` -> authenticate + getMatchDetail
- `POST /recommendations/refresh` -> authenticate + authorize(JOB_SEEKER) + refreshRecommendations

Register in `server/src/routes/index.ts`.

**Files Affected:**
- `server/src/services/aiEngine.service.ts` (update)
- `server/src/controllers/recommendation.controller.ts`
- `server/src/routes/recommendation.routes.ts`
- `server/src/routes/index.ts` (update)

**Verification & Testing:** Full end-to-end: register as job seeker -> upload resume (gets parsed) -> call GET /api/recommendations -> receive ranked job list with AI-generated scores and explanations. Register as employer -> post a job -> call GET /api/recommendations/job/:jobId/candidates -> receive ranked candidates.

---

## Phase 8: Application Management

**Phase Objective:** Implement the job application workflow where candidates apply to jobs, employers review applications, and application status transitions are tracked, matching SRS 3.2.5 (Use Case: Job Application).

---

### Step 8.1: Create Application Controller

**Implementation Details:** Create `server/src/controllers/application.controller.ts`.

- `applyToJob(req, res)`: Authenticated, JOB_SEEKER. Accept `{jobId, coverLetter?}`. Verify: job exists and is active, user hasn't already applied (unique constraint). Create Application with status PENDING. Return 201.

- `getMyApplications(req, res)`: Authenticated, JOB_SEEKER. Fetch all applications for current user. Include job details (title, company, location, employmentType) and current status. Support pagination and status filter.

- `getApplicationsForJob(req, res)`: Authenticated, EMPLOYER. Verify job belongs to employer. Fetch all applications for this job. Include applicant details (name, skills, resume) and match score from AI_RECOMMENDATION if available. Support pagination, status filter, and sorting by matchScore or appliedAt.

- `getApplication(req, res)`: Authenticated. Single application detail. If requester is the applicant, show full detail. If requester is the employer of the job, show full detail including applicant profile. Otherwise 403.

- `updateApplicationStatus(req, res)`: Authenticated, EMPLOYER. Accept `{status: ApplicationStatus}`. Validate status transition (PENDING -> REVIEWED -> SHORTLISTED/REJECTED, SHORTLISTED -> ACCEPTED/REJECTED). Update status. Return updated application. (Future: trigger notification).

- `withdrawApplication(req, res)`: Authenticated, JOB_SEEKER. Verify ownership. Only if status is PENDING or REVIEWED. Delete or mark as withdrawn. Return confirmation.

Create `server/src/validators/application.validators.ts`.

**Files Affected:**
- `server/src/controllers/application.controller.ts`
- `server/src/validators/application.validators.ts`

**Verification & Testing:**
1. Apply to a job as job seeker -> expect 201.
2. Apply again -> expect conflict error.
3. List my applications -> expect the application with job details.
4. As employer, list applications for a job -> expect applicants with profiles.
5. Update status from PENDING to REVIEWED -> expect success.
6. Update status from PENDING to ACCEPTED (invalid transition) -> expect error.
7. Withdraw a PENDING application -> expect success.

---

### Step 8.2: Create Application Routes

**Implementation Details:** Create `server/src/routes/application.routes.ts`:
- `POST /applications` -> authenticate + authorize(JOB_SEEKER) + validate + applyToJob
- `GET /applications/my` -> authenticate + authorize(JOB_SEEKER) + getMyApplications
- `GET /applications/job/:jobId` -> authenticate + authorize(EMPLOYER) + getApplicationsForJob
- `GET /applications/:id` -> authenticate + getApplication
- `PATCH /applications/:id/status` -> authenticate + authorize(EMPLOYER) + validate + updateApplicationStatus
- `DELETE /applications/:id` -> authenticate + authorize(JOB_SEEKER) + withdrawApplication

Register in `server/src/routes/index.ts`.

**Files Affected:**
- `server/src/routes/application.routes.ts`
- `server/src/routes/index.ts` (update)

**Verification & Testing:** Complete application workflow: job seeker applies -> employer sees application in their job's applicant list -> employer updates status to REVIEWED -> to SHORTLISTED -> to ACCEPTED. Verify each status change persists correctly.

---

## Phase 9: Skill Gap Analysis & Career Recommendations

**Phase Objective:** Implement the skill gap analysis feature that identifies missing competencies and provides course/training recommendations, matching the project proposal's key feature of "dynamic skill gap analysis with personalized course and learning recommendations."

---

### Step 9.1: Build Skill Gap Analysis Service

**Implementation Details:** Create `ai-engine/app/services/skill_gap_analyzer.py`. Implement `SkillGapAnalyzer` class:

- `analyze_gap(user_id: str, job_id: str) -> SkillGapReport`: Fetch user skills and job required skills. For each job skill: check if user has it and at what level. Compute gap = required_level - user_level (or required_level if user doesn't have it). Categorize gaps: "critical" (gap >= 3), "moderate" (gap == 2), "minor" (gap == 1). Return structured report.

- `generate_learning_path(skill_gaps: list[SkillGap]) -> list[CourseRecommendation]`: For each skill gap, generate course recommendations. Use a predefined mapping of skills to learning resources (stored in `ai-engine/app/data/learning_resources.json`). Each recommendation includes: skill_name, resource_title, resource_type (course, certification, tutorial), provider (Coursera, Udemy, freeCodeCamp, etc.), estimated_duration, url, priority (based on gap severity).

- `analyze_career_direction(user_id: str) -> CareerInsight`: Analyze user's current skills profile. Identify which job categories they're strongest in. Suggest potential career paths based on skill clusters. Return insights with recommended next skills to learn.

Create `ai-engine/app/data/learning_resources.json` with 100+ entries mapping common tech skills to real course/certification recommendations.

Create `ai-engine/app/schemas/skill_gap.py` with Pydantic models: `SkillGap`, `SkillGapReport`, `CourseRecommendation`, `LearningPath`, `CareerInsight`.

**Files Affected:**
- `ai-engine/app/services/skill_gap_analyzer.py`
- `ai-engine/app/data/learning_resources.json`
- `ai-engine/app/schemas/skill_gap.py`

**Verification & Testing:** Test with a user who has Python(4), JavaScript(3) and a job requiring Python(5), JavaScript(4), Docker(3), Kubernetes(2). Verify:
1. Skill gaps: Python gap=1 (minor), JavaScript gap=1 (minor), Docker gap=3 (critical), Kubernetes gap=2 (moderate).
2. Learning path includes Docker and Kubernetes courses prioritized as critical/moderate.
3. Career direction suggests relevant job categories.

---

### Step 9.2: Create Skill Gap API Endpoints

**Implementation Details:** Create `ai-engine/app/api/routes/skill_gap.py`:
- `POST /api/skill-gap/analyze`: Accept `{user_id, job_id}`. Return skill gap report with course recommendations.
- `POST /api/skill-gap/career-insights`: Accept `{user_id}`. Return career direction insights.
- `GET /api/skill-gap/learning-path/{user_id}`: Analyze all of user's recommendation history, aggregate common skill gaps, return a prioritized learning path.

Register routes in `ai-engine/app/main.py`.

Update `server/src/services/aiEngine.service.ts` to add: `analyzeSkillGap(userId, jobId)`, `getCareerInsights(userId)`, `getLearningPath(userId)`.

Create `server/src/controllers/skillgap.controller.ts`:
- `getSkillGapForJob(req, res)`: Authenticated, JOB_SEEKER. Call AI engine skill gap analysis. Return report.
- `getCareerInsights(req, res)`: Authenticated, JOB_SEEKER. Call AI engine. Return insights.
- `getLearningPath(req, res)`: Authenticated, JOB_SEEKER. Call AI engine. Return prioritized learning path.

Create `server/src/routes/skillgap.routes.ts`:
- `GET /skill-gap/job/:jobId` -> authenticate + getSkillGapForJob
- `GET /skill-gap/career-insights` -> authenticate + getCareerInsights
- `GET /skill-gap/learning-path` -> authenticate + getLearningPath

Register in `server/src/routes/index.ts`.

**Files Affected:**
- `ai-engine/app/api/routes/skill_gap.py`
- `ai-engine/app/main.py` (update)
- `server/src/services/aiEngine.service.ts` (update)
- `server/src/controllers/skillgap.controller.ts`
- `server/src/routes/skillgap.routes.ts`
- `server/src/routes/index.ts` (update)

**Verification & Testing:**
1. `GET /api/skill-gap/job/:jobId` as job seeker -> expect gap report with courses.
2. `GET /api/skill-gap/career-insights` -> expect career direction analysis.
3. `GET /api/skill-gap/learning-path` -> expect aggregated learning recommendations.

---

## Phase 10: Notification System

**Phase Objective:** Implement real-time and email notifications for application status changes, new job matches, and system events, matching SRS 3.2.4 (Notifications and Recommendations).

---

### Step 10.1: Create Notification Model and Service

**Implementation Details:** Add a Notification model to Prisma schema: `id` (String, uuid), `userId` (String, FK), `type` (enum NotificationType: APPLICATION_UPDATE, NEW_JOB_MATCH, NEW_APPLICANT, SYSTEM, RECOMMENDATION), `title` (String), `message` (String), `data` (Json? - for linking to relevant entities like jobId, applicationId), `isRead` (Boolean, @default(false)), `createdAt` (DateTime). Run `npx prisma migrate dev --name add_notifications`.

Create `server/src/services/notification.service.ts`:
- `createNotification(userId, type, title, message, data?)`: Create notification record in DB.
- `sendEmailNotification(to, subject, htmlBody)`: Use Nodemailer with SMTP config to send email. Create reusable transporter. Implement email templates as functions returning HTML strings.
- `notifyApplicationStatusChange(application, newStatus)`: Create in-app notification for the applicant. If status is SHORTLISTED or ACCEPTED, also send email.
- `notifyNewApplicant(job, applicant)`: Notify employer of new application.
- `notifyNewJobMatch(userId, job, matchScore)`: Notify job seeker of high-match job (score > 80).

**Files Affected:**
- `server/prisma/schema.prisma` (add Notification model)
- `server/prisma/migrations/...` (auto-generated)
- `server/src/services/notification.service.ts`

**Verification & Testing:** After migration, verify Notification table exists in Prisma Studio. Create a notification programmatically and verify it appears in the database. Test email sending by calling `sendEmailNotification` with a test SMTP service (like Mailtrap or Ethereal).

---

### Step 10.2: Create Notification Controller and Routes

**Implementation Details:** Create `server/src/controllers/notification.controller.ts`:
- `getNotifications(req, res)`: Authenticated. Fetch notifications for current user, ordered by createdAt desc. Support pagination and filter by isRead and type.
- `markAsRead(req, res)`: Authenticated. Mark single notification as read. Verify ownership.
- `markAllAsRead(req, res)`: Authenticated. Mark all user's notifications as read.
- `getUnreadCount(req, res)`: Authenticated. Return count of unread notifications.
- `deleteNotification(req, res)`: Authenticated. Delete single notification. Verify ownership.

Create `server/src/routes/notification.routes.ts`:
- `GET /notifications` -> authenticate + getNotifications
- `GET /notifications/unread-count` -> authenticate + getUnreadCount
- `PATCH /notifications/:id/read` -> authenticate + markAsRead
- `PATCH /notifications/read-all` -> authenticate + markAllAsRead
- `DELETE /notifications/:id` -> authenticate + deleteNotification

Register in `server/src/routes/index.ts`.

Integrate notification triggers: update `application.controller.ts` `updateApplicationStatus` to call `notificationService.notifyApplicationStatusChange()`. Update `application.controller.ts` `applyToJob` to call `notificationService.notifyNewApplicant()`.

**Files Affected:**
- `server/src/controllers/notification.controller.ts`
- `server/src/routes/notification.routes.ts`
- `server/src/routes/index.ts` (update)
- `server/src/controllers/application.controller.ts` (add notification triggers)

**Verification & Testing:**
1. Apply to a job -> verify employer receives a NEW_APPLICANT notification.
2. Employer updates application status to SHORTLISTED -> verify applicant receives APPLICATION_UPDATE notification.
3. `GET /api/notifications` -> expect list of notifications.
4. `GET /api/notifications/unread-count` -> expect correct count.
5. `PATCH /api/notifications/:id/read` -> verify isRead becomes true.

---

## Phase 11: Admin Dashboard Backend

**Phase Objective:** Implement admin-specific API endpoints for user management, job oversight, system monitoring, and AI system metrics, matching the Admin actor use cases from the Use Case Diagram (Manage Users, Monitor AI System, Manage Jobs).

---

### Step 11.1: Create Admin Controller

**Implementation Details:** Create `server/src/controllers/admin.controller.ts`:

- `getDashboardStats(req, res)`: Return aggregate statistics: total users (by role), total jobs (active/inactive), total applications (by status), total resumes uploaded, average match score from AI recommendations, new users this week/month.

- `getSystemHealth(req, res)`: Check health of all services: database connection (Prisma $queryRaw SELECT 1), AI engine health (HTTP GET to AI_SERVICE_URL/health), disk space for uploads directory. Return status for each component.

- `getUserActivity(req, res)`: Paginated list of recent user activities: registrations, applications, job postings. Query recent records from each table sorted by creation date.

- `getAiMetrics(req, res)`: Call AI engine endpoint for metrics: average match score distribution, most common skill gaps, number of recommendations generated, model performance stats.

- `manageJob(req, res)`: Admin can activate/deactivate any job, or force-delete it. Accept `{action: 'activate' | 'deactivate' | 'delete'}`.

Create `ai-engine/app/api/routes/admin.py`:
- `GET /api/admin/ai-metrics`: Compute and return: total recommendations generated, average match score, score distribution histogram, top 10 most common skill gaps, top 10 most recommended jobs.

Register AI engine admin routes.

**Files Affected:**
- `server/src/controllers/admin.controller.ts`
- `ai-engine/app/api/routes/admin.py`
- `ai-engine/app/main.py` (register route)

**Verification & Testing:**
1. `GET /api/admin/dashboard` with admin token -> expect stats object with all metrics.
2. `GET /api/admin/system-health` -> expect all services reporting ok.
3. `GET /api/admin/ai-metrics` -> expect metric data.
4. Non-admin requesting these endpoints -> expect 403.

---

### Step 11.2: Create Admin Routes

**Implementation Details:** Create `server/src/routes/admin.routes.ts`:
- `GET /admin/dashboard` -> authenticate + authorize(ADMIN) + getDashboardStats
- `GET /admin/system-health` -> authenticate + authorize(ADMIN) + getSystemHealth
- `GET /admin/user-activity` -> authenticate + authorize(ADMIN) + getUserActivity
- `GET /admin/ai-metrics` -> authenticate + authorize(ADMIN) + getAiMetrics
- `PATCH /admin/jobs/:id` -> authenticate + authorize(ADMIN) + manageJob

Register in `server/src/routes/index.ts`.

**Files Affected:**
- `server/src/routes/admin.routes.ts`
- `server/src/routes/index.ts` (update)

**Verification & Testing:** Hit each admin endpoint with admin token and verify correct responses. Hit with non-admin token and verify 403 on all endpoints.

---

## Phase 12: Frontend - Core Layout & Routing

**Phase Objective:** Build the React frontend shell including routing, layout components, authentication state management, and the design system foundation.

---

### Step 12.1: Configure React Router and Create Page Shells

**Implementation Details:** Update `client/src/App.tsx` to set up React Router with the following route structure:

```
/ -> Landing page (public)
/login -> Login page (public, redirect if authenticated)
/register -> Register page (public, redirect if authenticated)
/dashboard -> Dashboard (authenticated, role-based redirect)
/jobs -> Job listing/search (public)
/jobs/:id -> Job detail (public)
/profile -> User profile edit (authenticated)
/applications -> My applications (JOB_SEEKER)
/recommendations -> AI recommendations (JOB_SEEKER)
/skill-gap -> Skill gap analysis (JOB_SEEKER)
/employer/jobs -> My job postings (EMPLOYER)
/employer/jobs/new -> Create job (EMPLOYER)
/employer/jobs/:id/edit -> Edit job (EMPLOYER)
/employer/jobs/:id/applicants -> View applicants (EMPLOYER)
/admin -> Admin dashboard (ADMIN)
/admin/users -> User management (ADMIN)
/admin/jobs -> Job management (ADMIN)
```

Create placeholder page components in `client/src/pages/` for each route - just rendering the page name as a heading for now. Create `client/src/pages/Landing.tsx`, `Login.tsx`, `Register.tsx`, `Dashboard.tsx`, `JobList.tsx`, `JobDetail.tsx`, `Profile.tsx`, `MyApplications.tsx`, `Recommendations.tsx`, `SkillGap.tsx`, `employer/MyJobs.tsx`, `employer/CreateJob.tsx`, `employer/EditJob.tsx`, `employer/Applicants.tsx`, `admin/AdminDashboard.tsx`, `admin/UserManagement.tsx`, `admin/JobManagement.tsx`, `NotFound.tsx`.

**Files Affected:**
- `client/src/App.tsx`
- `client/src/pages/Landing.tsx`
- `client/src/pages/Login.tsx`
- `client/src/pages/Register.tsx`
- `client/src/pages/Dashboard.tsx`
- `client/src/pages/JobList.tsx`
- `client/src/pages/JobDetail.tsx`
- `client/src/pages/Profile.tsx`
- `client/src/pages/MyApplications.tsx`
- `client/src/pages/Recommendations.tsx`
- `client/src/pages/SkillGap.tsx`
- `client/src/pages/employer/MyJobs.tsx`
- `client/src/pages/employer/CreateJob.tsx`
- `client/src/pages/employer/EditJob.tsx`
- `client/src/pages/employer/Applicants.tsx`
- `client/src/pages/admin/AdminDashboard.tsx`
- `client/src/pages/admin/UserManagement.tsx`
- `client/src/pages/admin/JobManagement.tsx`
- `client/src/pages/NotFound.tsx`

**Verification & Testing:** Run `npm run dev`. Navigate to each route in the browser. Verify correct page component renders for each URL. Verify `/nonexistent` shows the NotFound page.

---

### Step 12.2: Create Auth Store and API Client

**Implementation Details:** Create `client/src/services/api.ts`. Configure an axios instance with `baseURL: import.meta.env.VITE_API_URL` (http://localhost:3001/api). Add a request interceptor that reads the access token from the auth store and attaches it as `Authorization: Bearer {token}`. Add a response interceptor that catches 401 errors, attempts token refresh via `POST /auth/refresh` (using withCredentials for cookies), and retries the original request. If refresh fails, clear auth state and redirect to /login.

Create `client/src/store/authStore.ts` using Zustand. State: `user: User | null`, `accessToken: string | null`, `isAuthenticated: boolean`, `isLoading: boolean`. Actions: `login(email, password)`, `register(name, email, password, role)`, `logout()`, `refreshToken()`, `fetchMe()`, `setUser(user)`, `setToken(token)`. Persist token in memory only (not localStorage for security). On app initialization, call `refreshToken()` to restore session from httpOnly cookie.

Create `client/src/types/index.ts` with TypeScript interfaces matching backend models: `User`, `Job`, `Application`, `Resume`, `Skill`, `UserSkill`, `AiRecommendation`, `Notification`, `CompanyProfile`, `MatchResult`, `SkillGap`, `PaginatedResponse<T>`, `ApiResponse<T>`.

**Files Affected:**
- `client/src/services/api.ts`
- `client/src/store/authStore.ts`
- `client/src/types/index.ts`

**Verification & Testing:** Import authStore in App.tsx. On mount, call `refreshToken()`. Log auth state to console. Open browser, verify no errors. If logged in previously, verify session restores. Test login action by calling it from browser console.

---

### Step 12.3: Create Protected Route Components

**Implementation Details:** Create `client/src/components/auth/ProtectedRoute.tsx`. Accept props: `children`, `allowedRoles?: UserRole[]`. Check `authStore.isAuthenticated`. If not authenticated, redirect to `/login` (using `Navigate` from react-router-dom, preserving the intended destination in state). If `allowedRoles` is specified and user's role is not included, redirect to `/dashboard` with a toast notification "You don't have permission to access this page".

Create `client/src/components/auth/PublicRoute.tsx`. If user IS authenticated, redirect to `/dashboard`. Otherwise render children (for login/register pages).

Update `App.tsx` to wrap routes with appropriate guards: public routes with `PublicRoute`, authenticated routes with `ProtectedRoute`, role-specific routes with `ProtectedRoute allowedRoles={[...]}`.

**Files Affected:**
- `client/src/components/auth/ProtectedRoute.tsx`
- `client/src/components/auth/PublicRoute.tsx`
- `client/src/App.tsx` (update routes with guards)

**Verification & Testing:** Without logging in, navigate to `/dashboard` -> should redirect to `/login`. Log in as JOB_SEEKER -> navigate to `/admin` -> should redirect to `/dashboard` with permission error toast. Navigate to `/login` while authenticated -> should redirect to `/dashboard`.

---

### Step 12.4: Create Layout Components (Navbar, Sidebar, Footer)

**Implementation Details:** Create `client/src/layouts/MainLayout.tsx`. This is the primary layout wrapper. It renders: a top Navbar, optional Sidebar (for dashboard views), and a main content area. The sidebar visibility depends on the route (shown on dashboard/profile/admin pages, hidden on public pages like landing/jobs listing).

Create `client/src/components/layout/Navbar.tsx`. Contains: logo/brand on left ("Caliber" with a brain/sparkle icon from lucide-react), central navigation links (Jobs, for authenticated: Dashboard, Recommendations), right side: if authenticated -> user avatar dropdown (Profile, My Applications/My Jobs based on role, Notifications bell with unread count badge, Logout), if not authenticated -> Login and Register buttons. Mobile responsive with hamburger menu.

Create `client/src/components/layout/Sidebar.tsx`. Shown in dashboard context. Navigation items vary by role:
- JOB_SEEKER: Dashboard, Recommendations, My Applications, Skill Gap Analysis, Profile
- EMPLOYER: Dashboard, My Job Postings, Create Job, Profile
- ADMIN: Dashboard, Users, Jobs, System Health

Create `client/src/components/layout/Footer.tsx`. Simple footer with copyright, links.

Create `client/src/layouts/AuthLayout.tsx`. Minimal layout for login/register pages - centered card on a branded background.

Create `client/src/layouts/DashboardLayout.tsx`. Layout with sidebar + main content area, used for authenticated dashboard pages.

**Files Affected:**
- `client/src/layouts/MainLayout.tsx`
- `client/src/layouts/AuthLayout.tsx`
- `client/src/layouts/DashboardLayout.tsx`
- `client/src/components/layout/Navbar.tsx`
- `client/src/components/layout/Sidebar.tsx`
- `client/src/components/layout/Footer.tsx`

**Verification & Testing:** Open browser. Verify Navbar renders with logo, navigation links, and auth buttons. Verify responsive behavior at mobile breakpoints (hamburger menu appears). After login, verify sidebar shows role-appropriate links. Navigate between pages and verify layout stays consistent.

---

### Step 12.5: Create Reusable UI Components

**Implementation Details:** Create a set of reusable base components in `client/src/components/ui/`:

- `Button.tsx`: Variants (primary, secondary, outline, danger, ghost), sizes (sm, md, lg), loading state with spinner, disabled state. Uses `clsx` and `tailwind-merge` for class composition.
- `Input.tsx`: Text input with label, error message, icon prefix/suffix. Integrates with react-hook-form via `forwardRef`.
- `Select.tsx`: Styled select dropdown with label and error support.
- `TextArea.tsx`: Multi-line input with character count.
- `Card.tsx`: Container component with optional header, footer sections.
- `Badge.tsx`: Status badges with color variants (success/green, warning/yellow, error/red, info/blue, neutral/gray).
- `Modal.tsx`: Overlay modal with close button, title, and action footer. Uses React Portal.
- `Spinner.tsx`: Loading spinner component in multiple sizes.
- `Pagination.tsx`: Page navigation component accepting currentPage, totalPages, onPageChange.
- `EmptyState.tsx`: Illustration/icon + message for empty lists.
- `Avatar.tsx`: User avatar with fallback to initials.
- `Toast container setup`: Configure react-hot-toast `Toaster` in App.tsx with custom styling.

**Files Affected:**
- `client/src/components/ui/Button.tsx`
- `client/src/components/ui/Input.tsx`
- `client/src/components/ui/Select.tsx`
- `client/src/components/ui/TextArea.tsx`
- `client/src/components/ui/Card.tsx`
- `client/src/components/ui/Badge.tsx`
- `client/src/components/ui/Modal.tsx`
- `client/src/components/ui/Spinner.tsx`
- `client/src/components/ui/Pagination.tsx`
- `client/src/components/ui/EmptyState.tsx`
- `client/src/components/ui/Avatar.tsx`
- `client/src/App.tsx` (add Toaster)

**Verification & Testing:** Create a temporary test page that renders each component with various props. Verify all variants display correctly. Verify Button loading state shows spinner. Verify Modal opens/closes. Verify Pagination navigates correctly. Remove test page after verification.

---

## Phase 13: Frontend - Authentication Pages

**Phase Objective:** Build the Login and Registration pages with form validation, role selection, and error handling.

---

### Step 13.1: Implement Login Page

**Implementation Details:** Update `client/src/pages/Login.tsx`. Use `AuthLayout`. Build a form with react-hook-form and zod validation schema: email (required, valid email), password (required, min 8 chars). On submit, call `authStore.login()`. Show loading spinner on button during submission. Display API errors as toast notifications. On success, redirect to `/dashboard`. Include a "Don't have an account? Register" link. Style with Tailwind: centered card, brand header, professional styling.

**Files Affected:**
- `client/src/pages/Login.tsx`

**Verification & Testing:** Open `/login`. Submit empty form -> validation errors appear. Submit with invalid email -> email error. Submit with wrong credentials -> toast error "Invalid credentials". Submit with correct credentials -> redirect to dashboard. Verify the access token is stored in authStore.

---

### Step 13.2: Implement Registration Page

**Implementation Details:** Update `client/src/pages/Register.tsx`. Use `AuthLayout`. Build a multi-field form: name (required, 2-100 chars), email (required, valid email), password (required, min 8, must contain uppercase, lowercase, number), confirmPassword (must match password), role (radio buttons: "I'm looking for a job" = JOB_SEEKER, "I'm hiring" = EMPLOYER). Use zod schema with `.refine()` for password matching. On submit, call `authStore.register()`. Show validation errors inline under each field. On success, redirect to `/dashboard`.

**Files Affected:**
- `client/src/pages/Register.tsx`

**Verification & Testing:** Open `/register`. Submit empty form -> all required field errors show. Enter mismatching passwords -> "Passwords don't match" error. Enter existing email -> toast error. Complete valid registration -> redirect to dashboard, verify user is created in DB via Prisma Studio.

---

## Phase 14: Frontend - Landing Page

**Phase Objective:** Build an attractive landing page that explains the platform's value proposition and drives users to register.

---

### Step 14.1: Implement Landing Page

**Implementation Details:** Update `client/src/pages/Landing.tsx`. Use `MainLayout`. Build sections:

1. **Hero section**: Large heading "Find Your Perfect Career Match with AI", subheading explaining the platform, two CTA buttons ("Find Jobs" -> /register?role=seeker, "Post a Job" -> /register?role=employer), optional hero illustration/abstract background.

2. **Features section**: Grid of 4-6 feature cards with lucide-react icons: "AI-Powered Matching" (Brain icon), "Smart CV Parsing" (FileText icon), "Skill Gap Analysis" (BarChart icon), "Personalized Recommendations" (Lightbulb icon), "Career Insights" (TrendingUp icon), "Real-time Notifications" (Bell icon). Each card has icon, title, and 1-2 sentence description.

3. **How it Works section**: 3-step process: "1. Create Your Profile" -> "2. Upload Your Resume" -> "3. Get AI Recommendations". Visual step indicators.

4. **Stats section** (can use placeholder numbers initially): "10,000+ Jobs", "5,000+ Candidates", "95% Match Accuracy".

5. **CTA section**: Final call-to-action "Ready to find your perfect match?" with Register button.

**Files Affected:**
- `client/src/pages/Landing.tsx`

**Verification & Testing:** Open `/`. Verify all sections render. Verify responsive layout at mobile/tablet/desktop. Verify CTA buttons link correctly. Verify the page is visually polished and professional.

---

## Phase 15: Frontend - Job Seeker Features

**Phase Objective:** Build all job seeker facing pages: dashboard, job search/browse, job detail, resume upload, applications tracking, AI recommendations, skill gap analysis, and profile management.

---

### Step 15.1: Implement Job Seeker Dashboard

**Implementation Details:** Update `client/src/pages/Dashboard.tsx`. Use `DashboardLayout`. For JOB_SEEKER role, render:

1. **Welcome card**: "Welcome back, {name}" with last login info.
2. **Quick stats row**: Cards showing: total applications (with status breakdown), active recommendations count, profile completeness percentage, number of skills.
3. **Recent recommendations**: Top 5 AI-matched jobs with score badges (using `Badge` component with color based on score: >80 green, >60 yellow, <60 red). "View all" link to /recommendations.
4. **Recent applications**: Last 5 applications with status badges. "View all" link to /applications.
5. **Skill gap summary**: Top 3 skills to develop with progress bars.

Create `client/src/hooks/useDashboard.ts` custom hook: fetches dashboard data by calling multiple API endpoints in parallel using `Promise.all` (user profile, recommendations, applications, skill gap).

**Files Affected:**
- `client/src/pages/Dashboard.tsx`
- `client/src/hooks/useDashboard.ts`
- `client/src/services/api.ts` (add API methods)

**Verification & Testing:** Log in as job seeker with seeded data. Verify dashboard shows correct stats, recent recommendations with scores, recent applications with statuses. Verify links navigate to correct pages.

---

### Step 15.2: Implement Job Search & Listing Page

**Implementation Details:** Update `client/src/pages/JobList.tsx`. Use `MainLayout`. Build:

1. **Search bar**: Text input for keyword search with search button.
2. **Filters panel** (collapsible on mobile): Employment type checkboxes (Full-time, Part-time, Contract, Internship, Remote), location text input, salary range slider or min/max inputs, skills multi-select.
3. **Results area**: Job cards in a list layout. Each card shows: job title, company name + logo, location, employment type badge, salary range, posted date (relative "2 days ago"), skill tags (first 5), match score badge (if user is authenticated and recommendations exist). Click navigates to `/jobs/:id`.
4. **Pagination** at bottom.
5. **Sort dropdown**: "Most Recent", "Highest Salary", "Best Match" (if authenticated).

Create `client/src/hooks/useJobs.ts` using `@tanstack/react-query` for data fetching with `useQuery`. Implement debounced search (300ms delay). Build the query params from all filter states.

Create `client/src/components/jobs/JobCard.tsx` reusable component.

**Files Affected:**
- `client/src/pages/JobList.tsx`
- `client/src/hooks/useJobs.ts`
- `client/src/components/jobs/JobCard.tsx`
- `client/src/services/api.ts` (add getJobs method)

**Verification & Testing:** Open `/jobs`. Verify jobs load from API. Type in search box -> verify results filter after debounce. Apply employment type filter -> verify results update. Change sort -> verify order changes. Click a job card -> navigate to `/jobs/:id`. Verify pagination works.

---

### Step 15.3: Implement Job Detail Page

**Implementation Details:** Update `client/src/pages/JobDetail.tsx`. Use `MainLayout`. Fetch job by ID from URL params using `useQuery`.

1. **Header**: Job title, company name + logo (linked to company profile), location with map icon, employment type badge, salary range, posted date.
2. **Action bar**: "Apply Now" button (disabled if already applied, shows "Applied" with check icon), "Save Job" button (bookmarking - stored locally), match score display if authenticated (with breakdown tooltip).
3. **Description section**: Rendered job description (support basic formatting).
4. **Requirements section**: Rendered requirements text.
5. **Required skills**: Skill badges with required level indicators. If user is authenticated, color-code: green if user has skill at/above required level, yellow if user has skill below level, red if user doesn't have skill.
6. **Company info sidebar**: Company name, industry, size, website link, other active jobs from this employer.
7. **Apply modal**: Triggered by "Apply Now". Contains: cover letter textarea (optional), resume selection dropdown (from user's uploaded resumes), and confirm button. On submit, call `POST /api/applications`.
8. **Skill gap section** (authenticated only): Shows specific skill gaps for this job and recommended courses.

**Files Affected:**
- `client/src/pages/JobDetail.tsx`
- `client/src/components/jobs/ApplyModal.tsx`
- `client/src/components/jobs/SkillMatchIndicator.tsx`
- `client/src/services/api.ts` (add getJob, applyToJob methods)

**Verification & Testing:** Navigate to a job detail page. Verify all sections render with correct data. Click "Apply Now" -> modal opens -> submit application -> success toast and button changes to "Applied". Try applying again -> button is disabled. Verify skill matching colors for authenticated user.

---

### Step 15.4: Implement Resume Upload Page (in Profile)

**Implementation Details:** Create `client/src/components/profile/ResumeSection.tsx`. This component handles:

1. **Upload area**: Drag-and-drop zone (using HTML5 drag events) + file input button. Shows accepted formats (PDF, DOC, DOCX) and max size (10MB). During upload, show progress bar.
2. **Resume list**: All uploaded resumes with: file name, upload date, status (parsed/processing/failed), "View Parsed Data" expandable section showing extracted skills/experience/education in a structured format.
3. **Actions per resume**: Download, delete, set as primary.
4. **Parsed data display**: When expanded, shows a structured view of what the AI extracted: personal info, skills (as tags), education (timeline), work experience (timeline), certifications.

Create `client/src/hooks/useResumes.ts` with `useQuery` for fetching resumes and `useMutation` for upload/delete.

**Files Affected:**
- `client/src/components/profile/ResumeSection.tsx`
- `client/src/hooks/useResumes.ts`
- `client/src/services/api.ts` (add resume API methods)

**Verification & Testing:** Navigate to profile page. Upload a PDF resume -> verify upload progress, file appears in list. Expand parsed data -> verify skills, education, experience are displayed. Download the resume -> verify file downloads. Delete -> verify removal.

---

### Step 15.5: Implement Profile Edit Page

**Implementation Details:** Update `client/src/pages/Profile.tsx`. Use `DashboardLayout`. Build a tabbed interface:

**Tab 1 - Personal Info**: Form with: name, email (read-only), phone, location (with autocomplete suggestions), bio (textarea). Avatar upload section. Save button.

**Tab 2 - Skills**: Current skills displayed as removable tags with proficiency level (1-5 star rating). Add skill: searchable text input with suggestions from skills database. Proficiency selector (1-5). Add button. Bulk save.

**Tab 3 - Resumes**: Embed the `ResumeSection` component from Step 15.4.

**Tab 4 - Preferences** (for JOB_SEEKER): Desired employment types (checkboxes), preferred locations, salary expectations (min/max), job categories of interest.

Use react-hook-form for each tab's form. Auto-save or explicit save per tab.

**Files Affected:**
- `client/src/pages/Profile.tsx`
- `client/src/components/profile/PersonalInfoForm.tsx`
- `client/src/components/profile/SkillsEditor.tsx`
- `client/src/components/profile/PreferencesForm.tsx`
- `client/src/services/api.ts` (add profile update methods)

**Verification & Testing:** Navigate to `/profile`. Edit name and save -> verify update persists on refresh. Add skills with proficiency levels -> verify skills appear in profile. Upload avatar -> verify it displays. Switch between tabs -> verify data loads for each.

---

### Step 15.6: Implement My Applications Page

**Implementation Details:** Update `client/src/pages/MyApplications.tsx`. Use `DashboardLayout`.

1. **Filter bar**: Status filter dropdown (All, Pending, Reviewed, Shortlisted, Accepted, Rejected), sort by (date, company name).
2. **Application cards list**: Each card shows: job title, company name, applied date, current status (colored Badge), cover letter preview (truncated). Click expands to show full details.
3. **Status timeline**: For each application, show a visual timeline of status changes with dates.
4. **Actions**: Withdraw button (only for PENDING/REVIEWED status).
5. **Empty state**: If no applications, show encouraging message with link to browse jobs.

Create `client/src/hooks/useApplications.ts`.

**Files Affected:**
- `client/src/pages/MyApplications.tsx`
- `client/src/components/applications/ApplicationCard.tsx`
- `client/src/components/applications/StatusTimeline.tsx`
- `client/src/hooks/useApplications.ts`
- `client/src/services/api.ts` (add application API methods)

**Verification & Testing:** Log in as job seeker with applications. Verify applications list loads. Filter by status -> verify filtering. Withdraw a pending application -> verify removal from list. Verify empty state for user with no applications.

---

### Step 15.7: Implement AI Recommendations Page

**Implementation Details:** Update `client/src/pages/Recommendations.tsx`. Use `DashboardLayout`.

1. **Header**: "Your AI Recommendations" with last updated timestamp and "Refresh" button.
2. **Match score visualization**: Overall profile completeness radar chart (optional, or simplified bar chart) showing how well the user's profile enables good matching.
3. **Recommended jobs list**: Ordered by match score (descending). Each card shows: match score as a large circular percentage badge (color coded), job title + company, key matching factors (e.g., "5/7 skills match", "Experience aligned"), skill gap indicators (mini badges for missing skills), "Why recommended" expandable section showing the AI's explanation text, "Apply" and "View Details" buttons.
4. **Explanation panel**: When "Why recommended" is expanded, show the full breakdown: skill match %, experience relevance %, education match %, location compatibility %, salary fit %. Show skill gap list with recommended courses.

Create `client/src/components/recommendations/RecommendationCard.tsx`.
Create `client/src/components/recommendations/MatchBreakdown.tsx`.
Create `client/src/hooks/useRecommendations.ts`.

**Files Affected:**
- `client/src/pages/Recommendations.tsx`
- `client/src/components/recommendations/RecommendationCard.tsx`
- `client/src/components/recommendations/MatchBreakdown.tsx`
- `client/src/hooks/useRecommendations.ts`
- `client/src/services/api.ts` (add recommendation API methods)

**Verification & Testing:** Log in as job seeker with a completed profile. Navigate to `/recommendations`. Verify recommendations load with scores. Click "Refresh" -> verify recommendations re-compute (loading state appears, then new data). Expand "Why recommended" -> verify breakdown displays. Click "Apply" -> verify application flow works.

---

### Step 15.8: Implement Skill Gap Analysis Page

**Implementation Details:** Update `client/src/pages/SkillGap.tsx`. Use `DashboardLayout`.

1. **Overview section**: Summary of user's current skill profile as a tag cloud or categorized list with proficiency bars.
2. **Career insights card**: AI-generated career direction analysis. Shows: recommended career paths based on current skills, skill clusters the user is strongest in.
3. **Learning path section**: Prioritized list of skills to develop. Each item shows: skill name, current level, target level for top recommendations, gap severity badge (critical/moderate/minor), recommended courses/certifications (title, provider, duration, link). Grouped by priority.
4. **Job-specific analysis**: Dropdown to select a specific job (from recommendations or saved jobs). Shows detailed skill gap for that job with targeted learning recommendations.

Create `client/src/hooks/useSkillGap.ts`.

**Files Affected:**
- `client/src/pages/SkillGap.tsx`
- `client/src/components/skillgap/LearningPathCard.tsx`
- `client/src/components/skillgap/CareerInsightsCard.tsx`
- `client/src/components/skillgap/JobSpecificGap.tsx`
- `client/src/hooks/useSkillGap.ts`
- `client/src/services/api.ts` (add skill gap API methods)

**Verification & Testing:** Navigate to `/skill-gap`. Verify overall skill profile displays. Verify career insights section shows AI-generated paths. Verify learning path has courses with priority ordering. Select a specific job -> verify job-specific gaps and courses load.

---

## Phase 16: Frontend - Employer Features

**Phase Objective:** Build all employer-facing pages: employer dashboard, job posting creation/management, applicant review, and candidate ranking.

---

### Step 16.1: Implement Employer Dashboard

**Implementation Details:** Update `client/src/pages/Dashboard.tsx` (add employer branch). For EMPLOYER role, render:

1. **Welcome card**: Company name and employer name.
2. **Quick stats**: Active job postings count, total applications received, new applications this week, average match score of applicants.
3. **Recent applications**: Last 10 applications across all jobs. Show applicant name, job title, match score, applied date, status badge. Quick action buttons (Review, Shortlist, Reject).
4. **Top candidates**: Top 5 highest-scoring candidates from AI matching across all active jobs.
5. **Job performance summary**: Mini cards for each active job showing application count and average match score.

**Files Affected:**
- `client/src/pages/Dashboard.tsx` (update with employer section)
- `client/src/hooks/useDashboard.ts` (add employer data fetching)

**Verification & Testing:** Log in as employer. Verify dashboard shows employer-specific stats and sections. Verify quick action buttons work (status updates).

---

### Step 16.2: Implement Job Creation Page

**Implementation Details:** Update `client/src/pages/employer/CreateJob.tsx`. Use `DashboardLayout`. Build a comprehensive form:

1. **Job Details section**: Title input, description (rich text area or large textarea), requirements (textarea), location (with suggestions), employment type (select).
2. **Compensation section**: Salary range (min/max number inputs), currency selector.
3. **Skills section**: Searchable skill adder (autocomplete from skills database). For each added skill, show a required proficiency level selector (1-5). Display added skills as removable tags with level badges.
4. **Preview section**: Live preview of how the job posting will appear to candidates.
5. **Action buttons**: "Save as Draft" (future), "Publish Job Posting".

Use react-hook-form with zod validation matching backend validators. On submit, call `POST /api/jobs`. On success, redirect to `/employer/jobs` with success toast.

**Files Affected:**
- `client/src/pages/employer/CreateJob.tsx`
- `client/src/components/employer/JobForm.tsx` (reusable form component for create/edit)
- `client/src/components/employer/SkillSelector.tsx`
- `client/src/components/employer/JobPreview.tsx`
- `client/src/services/api.ts` (add createJob method)

**Verification & Testing:** Navigate to `/employer/jobs/new`. Fill in all fields including skills. Verify live preview updates. Submit -> verify redirect and job appears in listings. Verify job exists in database with correct skills linked.

---

### Step 16.3: Implement My Job Postings Page

**Implementation Details:** Update `client/src/pages/employer/MyJobs.tsx`. Use `DashboardLayout`.

1. **Header**: "My Job Postings" with "Create New Job" button.
2. **Filter/search**: Search by title, filter by status (active/inactive), sort by date/applications.
3. **Job cards**: Each shows: title, posted date, active/inactive badge, application count, actions (Edit, View Applicants, Deactivate/Activate, Delete with confirmation modal).
4. **Empty state**: No jobs posted message with "Post Your First Job" CTA.

**Files Affected:**
- `client/src/pages/employer/MyJobs.tsx`
- `client/src/components/employer/EmployerJobCard.tsx`
- `client/src/services/api.ts` (add getEmployerJobs method)

**Verification & Testing:** Log in as employer with posted jobs. Verify job list loads. Click Edit -> navigate to edit page. Click Deactivate -> job status changes. Click Delete -> confirmation modal appears -> confirm -> job removed.

---

### Step 16.4: Implement Job Edit Page

**Implementation Details:** Update `client/src/pages/employer/EditJob.tsx`. Use `DashboardLayout`. Reuse the `JobForm` component from Step 16.2 but pre-populate with existing job data. Fetch job by ID, verify ownership. On submit, call `PATCH /api/jobs/:id`. Show diff of changes before saving (optional). On success, redirect back to My Jobs.

**Files Affected:**
- `client/src/pages/employer/EditJob.tsx`
- `client/src/services/api.ts` (add updateJob method)

**Verification & Testing:** Navigate to `/employer/jobs/:id/edit`. Verify form pre-populates with job data. Change title and add a skill. Submit -> verify changes persist. Verify updated data shows on job detail page.

---

### Step 16.5: Implement Applicants Review Page

**Implementation Details:** Update `client/src/pages/employer/Applicants.tsx`. Use `DashboardLayout`. Fetch applications for the job.

1. **Header**: Job title + "Applicants" label with total count.
2. **Filter/sort bar**: Filter by status, sort by match score (desc), applied date, name.
3. **Applicant cards**: Each shows: applicant name + avatar, match score (large colored badge), applied date, status badge, key skills (matching ones highlighted), resume preview link (opens in modal/new tab). Action buttons: status transition buttons based on current status (e.g., PENDING shows "Review", "Shortlist", "Reject").
4. **Applicant detail modal/sidebar**: Click on a card to see full applicant detail: complete profile, all skills with proficiency, full resume parsed data, match breakdown, cover letter, action buttons.
5. **Bulk actions**: Select multiple applicants, bulk update status.

**Files Affected:**
- `client/src/pages/employer/Applicants.tsx`
- `client/src/components/employer/ApplicantCard.tsx`
- `client/src/components/employer/ApplicantDetail.tsx`
- `client/src/services/api.ts` (add getApplicationsForJob, updateApplicationStatus methods)

**Verification & Testing:** Navigate to `/employer/jobs/:id/applicants`. Verify applicant list loads with match scores. Sort by match score -> verify order. Click an applicant -> verify detail panel opens with full info. Update status to "Shortlisted" -> verify status badge changes. Verify notification is created for the applicant (check via applicant's notification API).

---

### Step 16.6: Implement Company Profile Edit

**Implementation Details:** Create `client/src/components/employer/CompanyProfileForm.tsx`. Fields: company name, industry (select with common options), company size (select: 1-10, 11-50, 51-200, 201-500, 500+), website URL, description (textarea), logo upload. Embed this in the Profile page for EMPLOYER role as an additional tab "Company Profile".

Update `client/src/pages/Profile.tsx` to detect EMPLOYER role and add the Company Profile tab.

**Files Affected:**
- `client/src/components/employer/CompanyProfileForm.tsx`
- `client/src/pages/Profile.tsx` (update)
- `client/src/services/api.ts` (add company profile methods)

**Verification & Testing:** Log in as employer. Go to Profile -> Company Profile tab. Fill in company details and save. Verify data persists on refresh. Verify company info appears on job postings made by this employer.

---

## Phase 17: Frontend - Admin Features

**Phase Objective:** Build the admin dashboard, user management, and job management pages matching the Admin actor's use cases.

---

### Step 17.1: Implement Admin Dashboard

**Implementation Details:** Update `client/src/pages/admin/AdminDashboard.tsx`. Use `DashboardLayout`.

1. **Stats overview**: 4 large stat cards: Total Users (with breakdown by role), Total Jobs (active/inactive), Total Applications, AI Recommendations Generated.
2. **System health panel**: Status indicators (green/red dots) for: Database, AI Engine, Email Service. Refresh button.
3. **User growth chart**: Simple bar chart or list showing new registrations per week (last 4 weeks). Can use a lightweight charting solution or simple CSS bars.
4. **Recent activity feed**: Last 20 system events: new registrations, job postings, applications. Shows timestamp, event type, actor name.
5. **AI metrics summary**: Average match score, most common skill gaps (top 5), recommendation distribution.

**Files Affected:**
- `client/src/pages/admin/AdminDashboard.tsx`
- `client/src/components/admin/StatsCard.tsx`
- `client/src/components/admin/SystemHealth.tsx`
- `client/src/components/admin/ActivityFeed.tsx`
- `client/src/hooks/useAdminDashboard.ts`
- `client/src/services/api.ts` (add admin API methods)

**Verification & Testing:** Log in as admin. Verify all stats show correct counts (cross-reference with Prisma Studio). Verify system health shows green for running services. Verify activity feed shows recent events.

---

### Step 17.2: Implement User Management Page

**Implementation Details:** Update `client/src/pages/admin/UserManagement.tsx`. Use `DashboardLayout`.

1. **Search and filters**: Search by name/email, filter by role (dropdown), filter by status (active/inactive).
2. **Users table**: Columns: Avatar, Name, Email, Role (badge), Status (active/inactive badge), Registered Date, Actions. Sortable columns.
3. **Actions per user**: Toggle active/inactive button with confirmation. View profile button (opens modal with user detail).
4. **Pagination**: Standard pagination below table.

**Files Affected:**
- `client/src/pages/admin/UserManagement.tsx`
- `client/src/components/admin/UsersTable.tsx`
- `client/src/components/admin/UserDetailModal.tsx`
- `client/src/services/api.ts` (add admin user management methods)

**Verification & Testing:** Navigate to `/admin/users`. Verify user table loads with all users. Search for a user by name -> verify filtering. Toggle a user inactive -> verify status changes. Filter by role -> verify only that role shows. Verify pagination works with seeded data.

---

### Step 17.3: Implement Job Management Page

**Implementation Details:** Update `client/src/pages/admin/JobManagement.tsx`. Use `DashboardLayout`.

1. **Search and filters**: Search by title/company, filter by employment type, filter by status (active/inactive).
2. **Jobs table**: Columns: Title, Company, Location, Type (badge), Status (badge), Applications count, Posted Date, Actions.
3. **Actions**: Activate/Deactivate toggle, delete with confirmation, view detail (link to job page).
4. **Pagination**.

**Files Affected:**
- `client/src/pages/admin/JobManagement.tsx`
- `client/src/components/admin/JobsTable.tsx`
- `client/src/services/api.ts` (add admin job management methods)

**Verification & Testing:** Navigate to `/admin/jobs`. Verify job table loads. Deactivate a job -> verify status changes. Delete a job -> confirmation required -> verify removal.

---

## Phase 18: Frontend - Notifications UI

**Phase Objective:** Build the notification system UI with a navbar bell icon, dropdown, and notifications page.

---

### Step 18.1: Implement Notification Components

**Implementation Details:** Create `client/src/components/notifications/NotificationBell.tsx`. Shows a bell icon in the Navbar with unread count badge (red circle with number). On click, toggles a dropdown panel.

Create `client/src/components/notifications/NotificationDropdown.tsx`. Dropdown panel below the bell icon. Shows last 5 notifications with: type icon, title, message (truncated), time ago, unread indicator (blue dot). "Mark all as read" link at top. "View all notifications" link at bottom.

Create `client/src/pages/Notifications.tsx`. Full notifications page (accessible from "View all"). Shows all notifications with pagination, filter by type, mark as read, delete. Use `DashboardLayout`.

Create `client/src/hooks/useNotifications.ts`. Fetches notifications with `useQuery` and `refetchInterval: 30000` (poll every 30 seconds for new notifications). Provides `markAsRead`, `markAllAsRead`, `deleteNotification` mutations.

Create `client/src/store/notificationStore.ts` using Zustand. State: `unreadCount`. Actions: `setUnreadCount`, `decrementUnread`. Synced by the useNotifications hook.

Update `Navbar.tsx` to include `NotificationBell` for authenticated users.

**Files Affected:**
- `client/src/components/notifications/NotificationBell.tsx`
- `client/src/components/notifications/NotificationDropdown.tsx`
- `client/src/pages/Notifications.tsx`
- `client/src/hooks/useNotifications.ts`
- `client/src/store/notificationStore.ts`
- `client/src/components/layout/Navbar.tsx` (update)
- `client/src/App.tsx` (add /notifications route)

**Verification & Testing:** Log in as a user with notifications. Verify bell icon shows unread count. Click bell -> dropdown shows recent notifications. Click a notification -> mark as read, blue dot disappears, count decrements. Click "View all" -> navigate to notifications page. Verify polling updates count when new notifications arrive (test by creating a notification via API while page is open).

---

## Phase 19: Responsive Design & Polish

**Phase Objective:** Ensure the entire application is fully responsive across desktop, tablet, and mobile breakpoints, and apply final visual polish.

---

### Step 19.1: Mobile Responsive Layout Adjustments

**Implementation Details:** Review and update all layout components for mobile responsiveness:

- `Navbar.tsx`: Hamburger menu on mobile that opens a slide-out navigation panel. Close on navigation or outside click.
- `Sidebar.tsx`: On mobile, sidebar collapses to bottom tab bar or hidden with hamburger toggle.
- `DashboardLayout.tsx`: Stack sidebar and content vertically on mobile.
- All grid layouts: Switch from multi-column grids to single column on screens below 768px.
- Tables (admin pages): Convert to card-based layout on mobile using responsive Tailwind classes (`hidden md:table-cell` for non-essential columns).
- Forms: Full-width inputs on mobile, appropriate touch targets (min 44px).
- Modals: Full-screen on mobile instead of centered overlay.

Update Tailwind utility classes throughout all components using responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`).

**Files Affected:**
- `client/src/components/layout/Navbar.tsx` (update)
- `client/src/components/layout/Sidebar.tsx` (update)
- `client/src/layouts/DashboardLayout.tsx` (update)
- All page and component files (responsive class updates)

**Verification & Testing:** Open the application in Chrome DevTools responsive mode. Test at breakpoints: 375px (mobile), 768px (tablet), 1024px (laptop), 1440px (desktop). Verify: no horizontal scroll at any breakpoint, all content is readable, all interactive elements are tappable with touch-size targets, navigation works via hamburger menu on mobile.

---

### Step 19.2: Loading States and Error Handling

**Implementation Details:** Create `client/src/components/ui/PageLoader.tsx`: Full-page loading spinner displayed while initial data fetches. Create `client/src/components/ui/ErrorBoundary.tsx`: React error boundary component that catches render errors and displays a user-friendly error page with "Try Again" button.

Create `client/src/components/ui/DataLoader.tsx`: A wrapper component that accepts `isLoading`, `error`, `data`, and `children`. Renders spinner while loading, error message with retry on error, empty state if data is empty, and children when data is available.

Update all pages to use `DataLoader` wrapper around their data-dependent content. Add skeleton loaders (animated placeholder shapes) for card-heavy pages (job list, recommendations).

Add `react-query` global error handler in the QueryClient configuration to show toast notifications on API errors.

**Files Affected:**
- `client/src/components/ui/PageLoader.tsx`
- `client/src/components/ui/ErrorBoundary.tsx`
- `client/src/components/ui/DataLoader.tsx`
- `client/src/components/ui/Skeleton.tsx`
- `client/src/App.tsx` (add ErrorBoundary wrapper, configure QueryClient)
- All page components (add DataLoader wrappers)

**Verification & Testing:** Stop the backend server and load a page -> verify error state displays with retry button. Start the server, reload -> verify data loads through loading state -> data state. Verify skeleton loaders appear during data fetching on job list and recommendations pages.

---

## Phase 20: Security Hardening

**Phase Objective:** Apply security best practices across the entire stack to protect against common vulnerabilities (OWASP top 10) and ensure data privacy compliance as specified in the SRS.

---

### Step 20.1: Backend Security Middleware

**Implementation Details:** Update `server/src/index.ts` to add:

1. **Rate limiting**: Install `express-rate-limit`. Configure: general limit (100 requests per 15 minutes per IP), auth endpoints limit (10 requests per 15 minutes for login/register to prevent brute force). Apply as middleware.

2. **Helmet configuration**: Tighten CSP headers. Set `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`.

3. **CORS tightening**: In production, set origin to actual frontend domain. Ensure credentials: true.

4. **Input sanitization**: Install `express-mongo-sanitize` (or custom sanitizer for SQL). Create middleware that sanitizes all req.body, req.params, req.query to strip `$`, `{`, `}` patterns and SQL injection patterns.

5. **File upload validation**: In multer config, add virus scanning placeholder, validate file magic bytes (not just extension), sanitize file names.

6. **Request size limits**: Ensure JSON body limit is 10MB (for resume data), URL-encoded limit is appropriate.

**Files Affected:**
- `server/src/index.ts` (update middleware stack)
- `server/src/middleware/rateLimiter.ts`
- `server/src/middleware/sanitize.ts`
- `server/package.json` (add express-rate-limit)

**Verification & Testing:**
1. Send 11 login requests rapidly -> verify 429 Too Many Requests response after 10.
2. Send a request with SQL injection in query param (`?name='; DROP TABLE users; --`) -> verify it's sanitized.
3. Check response headers include proper security headers using browser dev tools.

---

### Step 20.2: Data Privacy and GDPR Compliance

**Implementation Details:** Create `server/src/controllers/privacy.controller.ts`:

- `exportUserData(req, res)`: Authenticated. Export all user data as JSON (GDPR right of access): profile, resumes (metadata not files), applications, recommendations, skills. Return as downloadable JSON file.

- `deleteAccount(req, res)`: Authenticated. Require password confirmation in body. Delete all user data: resumes (files and records), applications, recommendations, notifications, user skills, company profile. Anonymize the user record (replace name with "Deleted User", email with hash, clear all optional fields) rather than hard-deleting to maintain referential integrity. Set isActive to false.

Create `server/src/routes/privacy.routes.ts`:
- `GET /privacy/export` -> authenticate + exportUserData
- `DELETE /privacy/delete-account` -> authenticate + deleteAccount

Register in `server/src/routes/index.ts`.

Ensure all password fields are excluded from ALL API responses by creating a `server/src/utils/sanitizeUser.ts` utility that strips sensitive fields from user objects before sending.

**Files Affected:**
- `server/src/controllers/privacy.controller.ts`
- `server/src/routes/privacy.routes.ts`
- `server/src/routes/index.ts` (update)
- `server/src/utils/sanitizeUser.ts`

**Verification & Testing:**
1. `GET /api/privacy/export` -> verify comprehensive JSON export of all user data.
2. Verify no API response ever includes the password field (test /auth/me, /users/:id, etc.).
3. `DELETE /api/privacy/delete-account` with correct password -> verify account is anonymized, all related data cleaned up.

---

## Phase 21: Testing

**Phase Objective:** Create comprehensive test suites for both the backend API and the AI engine to ensure system reliability.

---

### Step 21.1: Backend API Integration Tests

**Implementation Details:** Install test dependencies: `jest`, `@types/jest`, `ts-jest`, `supertest`, `@types/supertest`. Create `server/jest.config.ts` configuring ts-jest preset, test environment node, test match pattern `**/*.test.ts`.

Create `server/src/__tests__/setup.ts`: Initialize test database (use a separate test database or Prisma's test utilities), seed minimal data, export test helpers (createTestUser, getAuthToken).

Create test files:
- `server/src/__tests__/auth.test.ts`: Test register (success, duplicate email, invalid data), login (success, wrong password, inactive account), refresh token, logout, get me.
- `server/src/__tests__/jobs.test.ts`: Test CRUD operations, search/filter, authorization (employer vs seeker).
- `server/src/__tests__/applications.test.ts`: Test apply, list, status updates, withdraw, duplicate prevention.
- `server/src/__tests__/resumes.test.ts`: Test upload, list, download, delete.

Add scripts: `"test": "jest --runInBand"`, `"test:watch": "jest --watch"`.

**Files Affected:**
- `server/jest.config.ts`
- `server/src/__tests__/setup.ts`
- `server/src/__tests__/auth.test.ts`
- `server/src/__tests__/jobs.test.ts`
- `server/src/__tests__/applications.test.ts`
- `server/src/__tests__/resumes.test.ts`
- `server/package.json` (add test scripts and dev deps)

**Verification & Testing:** Run `cd server && npm test`. Verify all tests pass. Check coverage meets minimum 80% for controllers and services.

---

### Step 21.2: AI Engine Tests

**Implementation Details:** Create `ai-engine/tests/` directory with:
- `ai-engine/tests/conftest.py`: Pytest fixtures for test database session, test client (FastAPI TestClient), sample user/job data.
- `ai-engine/tests/test_resume_parser.py`: Test PDF parsing (use a small test PDF), DOCX parsing, structured data extraction (verify skills are extracted from known text).
- `ai-engine/tests/test_matching_engine.py`: Test match score computation (known inputs -> expected range), test skill overlap calculation, test explanation generation.
- `ai-engine/tests/test_skill_gap.py`: Test gap analysis with known skill sets, test learning path generation.
- `ai-engine/tests/test_api.py`: Test all API endpoints with FastAPI TestClient.

Add `pytest==8.3.2` and `httpx==0.27.0` to requirements.txt. Create `ai-engine/pytest.ini` with asyncio mode config.

**Files Affected:**
- `ai-engine/tests/conftest.py`
- `ai-engine/tests/test_resume_parser.py`
- `ai-engine/tests/test_matching_engine.py`
- `ai-engine/tests/test_skill_gap.py`
- `ai-engine/tests/test_api.py`
- `ai-engine/pytest.ini`
- `ai-engine/requirements.txt` (update)

**Verification & Testing:** Run `cd ai-engine && pytest -v`. Verify all tests pass. Verify resume parsing correctly extracts skills from test documents. Verify match scores are in expected ranges.

---

## Phase 22: Deployment Configuration

**Phase Objective:** Prepare production deployment configurations including Docker production builds, environment configuration, and deployment documentation.

---

### Step 22.1: Create Production Docker Configuration

**Implementation Details:** Create `docker-compose.prod.yml` with production-optimized settings:
- All services use `restart: always`.
- Postgres uses a named volume for data persistence.
- No source code volume mounts (use built images).
- Client serves via nginx with production build.
- Environment variables sourced from `.env.production`.
- Add health checks for all services.
- Secure postgres with strong password.

Update `server/Dockerfile` with multi-stage build: stage 1 builds TypeScript, stage 2 runs only compiled JS with production node_modules.

Update `client/Dockerfile` with multi-stage build: stage 1 builds Vite production bundle, stage 2 serves via nginx.

Create `client/nginx.conf` for SPA routing (all routes -> index.html, proxy /api to backend, proper caching headers for static assets).

Update `ai-engine/Dockerfile` with production optimizations (no dev dependencies, gunicorn instead of uvicorn for production).

**Files Affected:**
- `docker-compose.prod.yml`
- `server/Dockerfile` (update)
- `client/Dockerfile` (update)
- `client/nginx.conf`
- `ai-engine/Dockerfile` (update)
- `.env.production.example`

**Verification & Testing:** Run `docker-compose -f docker-compose.prod.yml up --build`. Verify all services start. Navigate to `http://localhost` (nginx on port 80). Verify: frontend loads, API calls work through nginx proxy, resume upload + AI parsing works end-to-end, authentication flow works. Run `docker-compose -f docker-compose.prod.yml down`.

---

### Step 22.2: Create Database Backup and Migration Scripts

**Implementation Details:** Create `scripts/backup-db.sh`: Uses `pg_dump` to create a timestamped backup of the PostgreSQL database to a `backups/` directory. Retain last 7 backups and delete older ones.

Create `scripts/restore-db.sh`: Accepts a backup file path and restores it using `pg_restore`.

Create `scripts/deploy.sh`: Orchestrates deployment: pull latest code, run migrations, build images, restart services with zero-downtime (using docker-compose's rolling update capabilities).

**Files Affected:**
- `scripts/backup-db.sh`
- `scripts/restore-db.sh`
- `scripts/deploy.sh`

**Verification & Testing:** Run `bash scripts/backup-db.sh` -> verify backup file created in `backups/`. Run `bash scripts/restore-db.sh backups/{latest}` -> verify database restores correctly.

---

## Phase 23: Documentation & Final Assembly

**Phase Objective:** Create comprehensive technical documentation, API documentation, and ensure the project meets all requirements from the SRS and project proposal.

---

### Step 23.1: Generate API Documentation

**Implementation Details:** Install `swagger-jsdoc` and `swagger-ui-express` in the server. Create `server/src/config/swagger.ts` with OpenAPI 3.0 specification. Document every endpoint with: path, method, description, request body schema, response schemas, authentication requirements, example requests/responses.

Add Swagger UI route: `GET /api/docs` serves Swagger UI. `GET /api/docs.json` serves the raw OpenAPI spec.

The AI engine already has auto-generated docs via FastAPI at `/docs` (Swagger UI) and `/redoc` (ReDoc).

**Files Affected:**
- `server/src/config/swagger.ts`
- `server/src/index.ts` (mount swagger routes)
- `server/package.json` (add swagger deps)

**Verification & Testing:** Navigate to `http://localhost:3001/api/docs` -> verify Swagger UI loads with all endpoints documented. Test a few endpoints directly from Swagger UI. Navigate to `http://localhost:8000/docs` -> verify AI engine docs are complete.

---

### Step 23.2: Create Project README

**Implementation Details:** Create a comprehensive `README.md` at project root:

1. **Project Title and Description**: AI-Powered Job Matching Platform with brief overview.
2. **Architecture Diagram**: Text-based diagram of system components.
3. **Tech Stack**: Full list of technologies used.
4. **Prerequisites**: Node.js 20+, Python 3.11+, Docker, PostgreSQL 16.
5. **Quick Start**: Step-by-step setup instructions (clone, env setup, docker-compose up, seed, access URLs).
6. **Development Guide**: How to run each service individually for development.
7. **API Documentation**: Links to Swagger docs for both services.
8. **Testing**: How to run tests for backend and AI engine.
9. **Deployment**: Production deployment instructions.
10. **Team**: Team members and their roles.

**Files Affected:**
- `README.md`

**Verification & Testing:** Follow the Quick Start instructions from scratch in a clean environment. Verify every step works and the system is fully operational at the end.

---

### Step 23.3: Requirements Traceability Verification

**Implementation Details:** Create a verification checklist cross-referencing every SRS requirement with its implementation:

| SRS Requirement | Implementation Location | Status |
|---|---|---|
| 3.2.1 Candidate Profile Management | Phase 4 (User Controller) + Phase 15 (Profile UI) | Verify |
| 3.2.2 Job Posting Management | Phase 5 (Job Controller) + Phase 16 (Employer UI) | Verify |
| 3.2.3 Calibering Engine | Phase 7 (Matching Engine) + Phase 15.7 (Recommendations UI) | Verify |
| 3.2.4 Notifications and Recommendations | Phase 10 (Notifications) + Phase 18 (Notifications UI) | Verify |
| 3.2.5 Job Application Use Case | Phase 8 (Applications) + Phase 15.6 (Applications UI) | Verify |
| 3.4 User Requirements (all 3 roles) | Phases 12-17 (all frontend features) | Verify |
| 3.5 Information Management (GDPR) | Phase 20.2 (Privacy Controller) | Verify |
| 3.6 Performance (<2s response) | Phase 20.1 (Rate limiting, indexing) | Verify |
| 3.8 Multilingual support | Document as future enhancement (constrained by semester timeline) | Note |

Run through each requirement and verify the feature works end-to-end.

**Files Affected:** No files - this is a manual verification step.

**Verification & Testing:** For each row in the traceability matrix:
1. Exercise the feature through the UI.
2. Verify API responses are correct.
3. Verify database state is correct.
4. Document any gaps with explanation (time constraints as noted in SRS constraints section).

---

## Complete File Inventory

### Root Level
```
package.json
.gitignore
.env.example
.env
.env.production.example
docker-compose.yml
docker-compose.prod.yml
README.md
DEVELOPMENT_PLAN.md
scripts/backup-db.sh
scripts/restore-db.sh
scripts/deploy.sh
```

### Server (Node.js Backend)
```
server/package.json
server/tsconfig.json
server/nodemon.json
server/Dockerfile
server/jest.config.ts
server/prisma/schema.prisma
server/prisma/seed.ts
server/prisma/migrations/
server/src/index.ts
server/src/config/index.ts
server/src/config/database.ts
server/src/config/upload.ts
server/src/config/swagger.ts
server/src/types/index.ts
server/src/middleware/auth.ts
server/src/middleware/validate.ts
server/src/middleware/rateLimiter.ts
server/src/middleware/sanitize.ts
server/src/utils/password.ts
server/src/utils/jwt.ts
server/src/utils/sanitizeUser.ts
server/src/validators/auth.validators.ts
server/src/validators/user.validators.ts
server/src/validators/company.validators.ts
server/src/validators/job.validators.ts
server/src/validators/application.validators.ts
server/src/controllers/auth.controller.ts
server/src/controllers/user.controller.ts
server/src/controllers/company.controller.ts
server/src/controllers/job.controller.ts
server/src/controllers/resume.controller.ts
server/src/controllers/application.controller.ts
server/src/controllers/recommendation.controller.ts
server/src/controllers/skillgap.controller.ts
server/src/controllers/notification.controller.ts
server/src/controllers/admin.controller.ts
server/src/controllers/privacy.controller.ts
server/src/services/aiEngine.service.ts
server/src/services/notification.service.ts
server/src/routes/index.ts
server/src/routes/auth.routes.ts
server/src/routes/user.routes.ts
server/src/routes/company.routes.ts
server/src/routes/job.routes.ts
server/src/routes/resume.routes.ts
server/src/routes/application.routes.ts
server/src/routes/recommendation.routes.ts
server/src/routes/skillgap.routes.ts
server/src/routes/notification.routes.ts
server/src/routes/admin.routes.ts
server/src/routes/privacy.routes.ts
server/src/__tests__/setup.ts
server/src/__tests__/auth.test.ts
server/src/__tests__/jobs.test.ts
server/src/__tests__/applications.test.ts
server/src/__tests__/resumes.test.ts
```

### AI Engine (Python FastAPI)
```
ai-engine/requirements.txt
ai-engine/pyproject.toml
ai-engine/Dockerfile
ai-engine/.env.example
ai-engine/pytest.ini
ai-engine/app/__init__.py
ai-engine/app/main.py
ai-engine/app/core/__init__.py
ai-engine/app/core/config.py
ai-engine/app/core/database.py
ai-engine/app/api/__init__.py
ai-engine/app/api/routes/__init__.py
ai-engine/app/api/routes/resume.py
ai-engine/app/api/routes/matching.py
ai-engine/app/api/routes/skill_gap.py
ai-engine/app/api/routes/admin.py
ai-engine/app/models/__init__.py
ai-engine/app/models/user.py
ai-engine/app/models/job.py
ai-engine/app/models/resume.py
ai-engine/app/models/skill.py
ai-engine/app/models/recommendation.py
ai-engine/app/services/resume_parser.py
ai-engine/app/services/matching_engine.py
ai-engine/app/services/skill_gap_analyzer.py
ai-engine/app/schemas/resume.py
ai-engine/app/schemas/matching.py
ai-engine/app/schemas/skill_gap.py
ai-engine/app/ml/__init__.py
ai-engine/app/ml/embeddings.py
ai-engine/app/ml/skill_matcher.py
ai-engine/app/data/learning_resources.json
ai-engine/tests/conftest.py
ai-engine/tests/test_resume_parser.py
ai-engine/tests/test_matching_engine.py
ai-engine/tests/test_skill_gap.py
ai-engine/tests/test_api.py
```

### Client (React Frontend)
```
client/package.json
client/tsconfig.json
client/vite.config.ts
client/tailwind.config.js
client/postcss.config.js
client/Dockerfile
client/nginx.conf
client/.env.example
client/src/index.css
client/src/App.tsx
client/src/types/index.ts
client/src/services/api.ts
client/src/store/authStore.ts
client/src/store/notificationStore.ts
client/src/layouts/MainLayout.tsx
client/src/layouts/AuthLayout.tsx
client/src/layouts/DashboardLayout.tsx
client/src/components/layout/Navbar.tsx
client/src/components/layout/Sidebar.tsx
client/src/components/layout/Footer.tsx
client/src/components/auth/ProtectedRoute.tsx
client/src/components/auth/PublicRoute.tsx
client/src/components/ui/Button.tsx
client/src/components/ui/Input.tsx
client/src/components/ui/Select.tsx
client/src/components/ui/TextArea.tsx
client/src/components/ui/Card.tsx
client/src/components/ui/Badge.tsx
client/src/components/ui/Modal.tsx
client/src/components/ui/Spinner.tsx
client/src/components/ui/Pagination.tsx
client/src/components/ui/EmptyState.tsx
client/src/components/ui/Avatar.tsx
client/src/components/ui/PageLoader.tsx
client/src/components/ui/ErrorBoundary.tsx
client/src/components/ui/DataLoader.tsx
client/src/components/ui/Skeleton.tsx
client/src/components/jobs/JobCard.tsx
client/src/components/jobs/ApplyModal.tsx
client/src/components/jobs/SkillMatchIndicator.tsx
client/src/components/applications/ApplicationCard.tsx
client/src/components/applications/StatusTimeline.tsx
client/src/components/recommendations/RecommendationCard.tsx
client/src/components/recommendations/MatchBreakdown.tsx
client/src/components/skillgap/LearningPathCard.tsx
client/src/components/skillgap/CareerInsightsCard.tsx
client/src/components/skillgap/JobSpecificGap.tsx
client/src/components/profile/ResumeSection.tsx
client/src/components/profile/PersonalInfoForm.tsx
client/src/components/profile/SkillsEditor.tsx
client/src/components/profile/PreferencesForm.tsx
client/src/components/employer/JobForm.tsx
client/src/components/employer/SkillSelector.tsx
client/src/components/employer/JobPreview.tsx
client/src/components/employer/EmployerJobCard.tsx
client/src/components/employer/ApplicantCard.tsx
client/src/components/employer/ApplicantDetail.tsx
client/src/components/employer/CompanyProfileForm.tsx
client/src/components/admin/StatsCard.tsx
client/src/components/admin/SystemHealth.tsx
client/src/components/admin/ActivityFeed.tsx
client/src/components/admin/UsersTable.tsx
client/src/components/admin/UserDetailModal.tsx
client/src/components/admin/JobsTable.tsx
client/src/components/notifications/NotificationBell.tsx
client/src/components/notifications/NotificationDropdown.tsx
client/src/pages/Landing.tsx
client/src/pages/Login.tsx
client/src/pages/Register.tsx
client/src/pages/Dashboard.tsx
client/src/pages/JobList.tsx
client/src/pages/JobDetail.tsx
client/src/pages/Profile.tsx
client/src/pages/MyApplications.tsx
client/src/pages/Recommendations.tsx
client/src/pages/SkillGap.tsx
client/src/pages/Notifications.tsx
client/src/pages/NotFound.tsx
client/src/pages/employer/MyJobs.tsx
client/src/pages/employer/CreateJob.tsx
client/src/pages/employer/EditJob.tsx
client/src/pages/employer/Applicants.tsx
client/src/pages/admin/AdminDashboard.tsx
client/src/pages/admin/UserManagement.tsx
client/src/pages/admin/JobManagement.tsx
client/src/hooks/useDashboard.ts
client/src/hooks/useJobs.ts
client/src/hooks/useApplications.ts
client/src/hooks/useResumes.ts
client/src/hooks/useRecommendations.ts
client/src/hooks/useSkillGap.ts
client/src/hooks/useNotifications.ts
client/src/hooks/useAdminDashboard.ts
```

**Total Files: ~160+**
**Total Phases: 23**
**Total Steps: 55+**






● Here's your deployment guide, step by step:                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                              ---                                                                                                                                                                                                                                                                                                         Part 1: Push to GitHub                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                              First, make sure everything is committed and pushed:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    cd "C:\Okul Projeleri\Caliber"                                                                                                                                                                                                                                                                           
  git add -A
  git commit -m "Caliber Platform - complete"
  git branch -M main
  git remote add origin https://github.com/YOUR_USERNAME/Caliber.git
  git push -u origin main

  ---
  Part 2: Backend on Railway

  Step 1 — Create project

  1. Go to https://railway.app > sign in with GitHub
  2. Click New Project > Deploy from GitHub Repo > select Caliber

  Step 2 — Add PostgreSQL

  1. In your project, click + New > Database > PostgreSQL
  2. Railway auto-provides DATABASE_URL to your services

  Step 3 — Configure the Server service

  1. Click your deployed service (it auto-detected the repo)
  2. Go to Settings:
    - Root Directory: server
    - Build Command: npm install && npx prisma generate && npm run build
    - Start Command: npx prisma migrate deploy && node dist/index.js
  3. Go to Variables, add:
  JWT_SECRET          = (run: openssl rand -hex 32)
  JWT_REFRESH_SECRET  = (run: openssl rand -hex 32)
  CLIENT_URL          = (fill after Netlify deploy)
  AI_SERVICE_URL      = (fill after AI engine deploy)
  UPLOAD_DIR          = /data/uploads
  NODE_ENV            = production
  RESEND_API_KEY      = re_xxxxxxxxxxxx
  EMAIL_FROM          = Caliber <onboarding@resend.dev>
  ▎ DATABASE_URL and PORT are auto-set by Railway

  Step 4 — Add a Volume (for file uploads)

  1. Server service > Settings > Volumes
  2. Click + New Volume
  3. Mount path: /data/uploads

  Step 5 — Generate a public URL

  1. Server service > Settings > Networking > Generate Domain
  2. Copy the URL (e.g., https://caliber-server-production.up.railway.app)

  Step 6 — Seed the database (one time)

  1. Server service > click ... menu > Open Shell
  2. Run: npx prisma db seed

  ---
  Part 3: AI Engine on Railway (same project)

  Step 1 — Add service

  1. In the same project, click + New > GitHub Repo > same Caliber repo

  Step 2 — Configure

  1. Settings:
    - Root Directory: ai-engine
    - Start Command: pip install -r requirements.txt && python -m spacy download en_core_web_sm && uvicorn app.main:app --host 0.0.0.0 --port $PORT
  2. Variables:
  DATABASE_URL        = (copy from PostgreSQL service, or use Railway's reference variable)
  ASYNC_DATABASE_URL  = (same as DATABASE_URL but change postgresql:// to postgresql+asyncpg://)
  SPACY_MODEL         = en_core_web_sm

  Step 3 — Generate domain

  1. Settings > Networking > Generate Domain
  2. Copy URL (e.g., https://caliber-ai-production.up.railway.app)
  3. Go back to your Server service > Variables > set AI_SERVICE_URL = this URL

  ---
  Part 4: Frontend on Netlify

  Step 1 — Create site

  1. Go to https://app.netlify.com > Add new site > Import from Git
  2. Select your Caliber repo

  Step 2 — Build settings

  Base directory:    client
  Build command:     npm run build
  Publish directory: client/dist

  Step 3 — Environment variable

  VITE_API_URL = https://caliber-server-production.up.railway.app/api
  (use your actual Railway server URL)

  Step 4 — Deploy

  Click deploy. Netlify gives you a URL like https://caliber-xxxxx.netlify.app

  ---
  Part 5: Connect everything

  Now update the cross-references:

  ┌────────────────┬────────────────┬───────────────────────────────────────────────────────┐
  │     Where      │    Variable    │                         Value                         │
  ├────────────────┼────────────────┼───────────────────────────────────────────────────────┤
  │ Railway Server │ CLIENT_URL     │ https://caliber-xxxxx.netlify.app                    │
  ├────────────────┼────────────────┼───────────────────────────────────────────────────────┤
  │ Railway Server │ AI_SERVICE_URL │ https://caliber-ai-production.up.railway.app         │
  ├────────────────┼────────────────┼───────────────────────────────────────────────────────┤
  │ Netlify        │ VITE_API_URL   │ https://caliber-server-production.up.railway.app/api │
  └────────────────┴────────────────┴───────────────────────────────────────────────────────┘

  After updating, Railway auto-redeploys. On Netlify, trigger a redeploy from Deploys > Trigger deploy.

  ---
  Verify

  1. Open your Netlify URL - landing page should load
  2. Register a new account
  3. Log in
  4. If you seeded: admin@caliber.com / Admin123!

  That's it - 3 services, all connected. Should take about 15-20 minutes total.