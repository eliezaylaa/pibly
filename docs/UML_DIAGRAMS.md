# PIBLY — UML Diagrams

## 1. Class Diagram

USERS (1) --- () POSTS (1) --- () SESSIONS (1) --- (1) TRANSACTIONS (1) --- (1) INVOICES

USERS: id, name, email, password, role, bio, phone, address, zip_code, city, country, refresh_token
Methods: register(), login(), logout(), updateProfile()

POSTS: id, user_id(FK), title, description, category, price, status, expires_at
Methods: create(), update(), delete()

SESSIONS: id, post_id(FK), poster_id(FK), helper_id(FK), status, is_fixed, started_at, ended_at
Methods: join(), accept(), reject(), end()

TRANSACTIONS: id, session_id(FK), payer_id(FK), payee_id(FK), amount, platform_fee, stripe_order_id, status
Methods: create(), confirm(), refund()

INVOICES: id, transaction_id(FK), session_id(FK), post_id(FK), poster_id(FK), helper_id(FK), status

## 2. Activity Diagram — Session Flow

POSTER HELPER
[Login] [Login]
| |
[Create Post] [Browse Feed]
| |
[Poster Waiting Room] [Join Session]
| |
|<-- Socket: helper_joined ----|
| |
[Accept Helper] [Helper Waiting Room]
| |
[Stripe Card Form] |
| |
[PUT /sessions/accept] |
| |
|--- Socket: session_accepted ->|
| |
[Jitsi Video Call] <-----------> [Jitsi Video Call]
| |
[PUT /sessions/end] |
| |
[is_fixed=true] → Stripe capture → CREATE transaction → CREATE invoice
[is_fixed=false] → Stripe cancel
| |
[Dashboard] [Dashboard]

## 3. CI/CD Pipeline Diagram

git push
|
[TEST]
node:20 + postgres:15
npm test (60%+ coverage)
|
[BUILD]
docker build backend dev/prod
docker build frontend dev/prod
push to GitLab registry
|
[DEPLOY]
dev → auto → Render webhook
prod → manual → Render webhook
