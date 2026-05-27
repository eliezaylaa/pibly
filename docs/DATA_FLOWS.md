# PIBLY — Data Flows

## 1. Authentication Flow

Client → POST /auth/register → INSERT users → generate JWT → store refresh_token → return tokens
Client → POST /auth/login → SELECT user → bcrypt.compare → generate JWT → return tokens
Client → POST /auth/refresh → verify refresh_token in DB → return new access token
Client → POST /auth/logout → clear refresh_token in DB

## 2. Session Flow

Poster → POST /posts → post created → enter Poster Waiting Room
Helper → POST /sessions/join → Socket emit helper_joined → Poster notified
Poster → Stripe card form → POST /payments/create-intent → clientSecret returned
Poster → PUT /sessions/accept → Socket emit session_accepted → Helper notified
Both → Jitsi Video Call (meet.jit.si/pibly-session-{id})
Poster → PUT /sessions/end (is_fixed:true) → Stripe capture → CREATE transaction → CREATE invoice → Socket session_ended
Poster → PUT /sessions/end (is_fixed:false) → Stripe cancel → session closed

## 3. Payment Flow

POST /payments/create-intent → stripe.paymentIntents.create(manual capture) → clientSecret
Frontend → stripe.confirmCardPayment(clientSecret) → payment held
PUT /sessions/end fixed=true → stripe.paymentIntents.capture → payment released
PUT /sessions/end fixed=false → stripe.paymentIntents.cancel → payment returned

## 4. Real-time Flow

Client → socket.emit join*room(userId) → joins room user*{id}
Controller action → getIO().to(user\_{id}).emit(event, data) → client receives
Events: helper_joined, session_accepted, session_rejected, session_ended

## 5. Token Refresh Flow

Request → 401 Unauthorized (token expired)
Frontend interceptor → POST /auth/refresh with refreshToken
API → verify refresh_token in DB → generate new access token
Frontend → retry original request with new token → 200 OK

## 6. CI/CD Flow

git push dev → GitLab pipeline triggers
Test: node:20 + postgres:15 → npm test → 60%+ coverage
Build: docker build backend + frontend → push to GitLab registry
Deploy: curl Render webhook → Render redeploys automatically
