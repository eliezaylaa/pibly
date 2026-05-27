# PIBLY — DevWeb Competencies Validation

## API ✅

- RESTful design with proper HTTP methods and status codes
- JWT secured — all routes protected
- Full CRUD: users, posts, sessions, payments, invoices
- 8 KPI reports endpoint

## Back Office ✅

- Users CRUD — search by name/email/role/country, sort asc/desc
- Posts CRUD — search, filter by category/status, sort
- Sessions — filter by status, edit, delete
- Transactions — refund capability
- Invoices — status update, delete
- Reports — 8 KPIs with Bar + Pie + Revenue charts

## Front Office ✅

- React + Vite SPA
- JWT login/register with auto refresh token
- Protected + Public routes
- Feed with search and category filter
- Post detail with join session
- Create post with category selection
- My Posts, My Sessions, My Invoices cards
- Profile edit with earnings
- Jitsi video calls via iframe
- Socket.io real-time notifications
- Stripe Elements card payment form

## Security ✅

- JWT in headers — CSRF not applicable
- Helmet.js — XSS + HTTP headers
- express-validator — input validation
- Rate limiting 100/15min
- bcrypt 10 rounds
- Refresh token DB revocation

## Testing ✅

- Jest + Supertest
- 60%+ coverage (requirement: 20%)
- Auto runs in CI on every push
- Coverage visible in GitLab pipeline

## DevOps ✅

- Dockerfile.dev + Dockerfile.prod (backend + frontend)
- docker-compose.yml (root + backend + frontend)
- .gitlab-ci.yml — test + build + deploy
- Render auto-deployment via webhooks
- No secrets in git

## Documentation ✅

- ARCHITECTURE.md, API_SPECS.md, UML_DIAGRAMS.md
- DESIGN_CHOICES.md, DATA_FLOWS.md
- AI_USAGE.md, DEVWEB_COMPETENCIES.md

## Live URLs

- Backend: https://pibly-backend.onrender.com
- Frontend: https://pibly-frontend.onrender.com
- GitHub: https://github.com/eliezaylaa/pibly
- GitLab: https://gitlab.com/eliezaylaa/pibly
