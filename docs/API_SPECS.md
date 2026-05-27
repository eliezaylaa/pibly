# PIBLY — API Specifications

_Base URL:_ https://pibly-backend.onrender.com
_Auth:_ Authorization: Bearer <token>

## Auth

- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout 🔒

## Users

- GET /users 🔒 admin
- GET /users/myprofile 🔒
- GET /users/:id 🔒
- PUT /users/:id 🔒
- DELETE /users/:id 🔒 admin
- GET /users/search?name= 🔒

## Posts

- GET /posts — public
- GET /posts/all 🔒 admin
- GET /posts/me 🔒
- GET /posts/:id 🔒
- POST /posts 🔒
- PUT /posts/:id 🔒
- DELETE /posts/:id 🔒

## Sessions

- POST /sessions/join 🔒
- PUT /sessions/:id/accept 🔒
- PUT /sessions/:id/reject 🔒
- PUT /sessions/:id/end 🔒
- GET /sessions/mysessions 🔒
- GET /sessions/all 🔒 admin
- DELETE /sessions/:id 🔒 admin

## Payments

- POST /payments/create-intent 🔒
- POST /payments/confirm 🔒
- PUT /payments/:id/refund 🔒 admin
- GET /payments/mytransactions 🔒
- GET /payments/all 🔒 admin

## Invoices

- GET /invoices 🔒 admin
- GET /invoices/myinvoices 🔒
- PUT /invoices/:id 🔒 admin
- DELETE /invoices/:id 🔒 admin

## Reports

- GET /reports 🔒 admin
  Returns: total_users, total_active_posts, total_sessions_completed, total_revenue, fix_rate, top_category, avg_transaction_value, total_posts_today
