# PIBLY — Architecture Documentation

_Live URLs:_

- Backend: https://pibly-backend.onrender.com
- Frontend: https://pibly-frontend.onrender.com
- GitHub: https://github.com/eliezaylaa/pibly
- GitLab: https://gitlab.com/eliezaylaa/pibly

## Technology Stack

### Backend

- Node.js + Express.js — REST API
- PostgreSQL 15 — relational database
- Socket.io — real-time communication
- JWT — access token 15min + refresh token 7days
- Stripe — payment processing
- Helmet — HTTP security headers
- express-rate-limit — 100 req/15min
- express-validator — input validation
- bcrypt — password hashing (10 rounds)

### Frontend

- React + Vite
- React Router
- Axios with refresh token interceptor
- Recharts — KPI charts
- Stripe.js — card payment form
- Socket.io-client

### Mobile

- React Native + Expo SDK 54
- React Navigation
- AsyncStorage
- Stripe React Native
- WebView — Jitsi Meet video calls

### DevOps

- Docker + Docker Compose
- GitLab CI/CD (test → build → deploy)
- Render — cloud hosting

## System Architecture

Three-tier:

- Presentation: React web + React Native mobile
- Application: Node.js/Express + Socket.io
- Data: PostgreSQL

## Database Schema

- users: id, name, email, password, role, bio, phone, address, zip_code, city, country, refresh_token, created_at
- posts: id, user_id(FK), title, description, category, price, status, expires_at, created_at
- sessions: id, post_id(FK), poster_id(FK), helper_id(FK), status, is_fixed, started_at, ended_at, created_at
- transactions: id, session_id(FK), payer_id(FK), payee_id(FK), amount, platform_fee, stripe_order_id, status, created_at
- invoices: id, transaction_id(FK), session_id(FK), post_id(FK), poster_id(FK), helper_id(FK), status, created_at

## Security

- JWT Bearer tokens + DB refresh token revocation
- bcrypt 10 rounds
- Helmet HTTP security headers
- Rate limiting 100/15min
- express-validator input validation
- CORS restricted to known origins
- Role-based access control (user/admin)

## Real-time

Socket.io rooms: user*{id} and session*{id}
Events: helper_joined, session_accepted, session_rejected, session_ended

## CI/CD

- Test: Jest + PostgreSQL service (60%+ coverage)
- Build: Docker images → GitLab registry
- Deploy: Render webhooks (auto dev, manual prod)
