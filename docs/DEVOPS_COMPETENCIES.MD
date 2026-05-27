# PIBLY — DevOps Competencies Validation

## Live URLs

- Backend: https://pibly-backend.onrender.com
- Frontend: https://pibly-frontend.onrender.com
- GitHub: https://github.com/eliezaylaa/pibly
- GitLab: https://gitlab.com/eliezaylaa/pibly

## 1. Dockerfiles ✅

### Backend

- Dockerfile.dev — node:18-alpine, nodemon, hot reload
- Dockerfile.prod — node:18-alpine, production deps only, node src/index.js

### Frontend

- Dockerfile.dev — node:22-alpine, vite dev server with --host
- Dockerfile.prod — node:22-alpine build → nginx:alpine serve dist/

## 2. Docker Compose ✅

Three compose files:

- backend/docker-compose.yml — backend + postgres:15
- frontend/docker-compose.yml — frontend only
- docker-compose.yml (root) — backend + frontend + postgres together

## 3. CI/CD Pipeline ✅

.gitlab-ci.yml with 3 stages:

### Stage 1: Test

- Image: node:20-alpine
- Service: postgres:15-alpine
- Environment variables injected (JWT, Stripe, DB)
- Runs: npm test --forceExit
- Coverage: 60%+ (requirement: 20%)
- Triggers: every push to any branch

### Stage 2: Build

- Image: docker:24 + docker:24-dind
- build:backend:dev → registry/backend:dev (dev branch)
- build:frontend:dev → registry/frontend:dev (dev branch)
- build:backend:prod → registry/backend:prod (main branch)
- build:frontend:prod → registry/frontend:prod (main branch)
- Pushes to GitLab Container Registry

### Stage 3: Deploy

- deploy:dev → automatic on dev branch push
- deploy:prod → manual trigger on main branch
- Uses Render deploy hooks via curl
- Zero downtime deployment on Render

## 4. Security ✅

- No passwords or secrets in git repository
- All secrets in GitLab CI/CD Variables (masked + protected)
- .env files in .gitignore
- Stripe key: sk_test_fake in CI, real key in GitLab Variables
- DATABASE_URL: injected at runtime

## 5. Deployment ✅

### Backend → Render Web Service

- Runtime: Node.js
- Root: backend/
- Build: npm install
- Start: node src/index.js
- Auto-deploy on push to main

### Database → Render PostgreSQL

- Managed PostgreSQL 15
- Internal connection string injected as DATABASE_URL
- SSL enabled (rejectUnauthorized: false)

### Frontend → Render Static Site

- Root: frontend/
- Build: npm install && npm run build
- Publish: dist/
- VITE_API_URL injected at build time

## 6. GitLab Runner

- Using GitLab.com shared runners
- Pipeline executes automatically on every push
- Logs visible in GitLab → CI/CD → Pipelines
