# PIBLY — Design Choices & Justification

## Node.js + Express

Non-blocking I/O ideal for real-time platform with many concurrent socket connections. Minimal and modular — aligns with brief requirements.

## PostgreSQL

Relational data fits perfectly: users → posts → sessions → transactions → invoices. Strong consistency for financial data. ON DELETE SET NULL preserves historical records.

## Socket.io

Reliable real-time bidirectional communication. Used for helper join notifications, session events, and WebRTC signaling.

## Jitsi Meet

Free, no account needed, rooms created automatically by URL, works in WebView and iframe, open source.

## Stripe

Industry standard. Manual capture payment intent — charge only when problem is marked fixed. Excellent React Native SDK.

## React + Vite

Component-based architecture, large ecosystem, faster builds. Recharts for KPI visualization.

## React Native + Expo

Shared React knowledge with web frontend. Expo simplifies builds. Cross-platform iOS + Android.

## Database Decisions

- ON DELETE SET NULL — preserves transaction/invoice history when users deleted
- expires_at on posts — auto 24h expiry prevents stale listings
- refresh_token in DB — enables server-side revocation on logout
- platform_fee stored on transaction — snapshot at transaction time

## Security Decisions

- JWT in Authorization header not cookies — CSRF not applicable
- Helmet.js — 11 HTTP security headers automatically
- Rate limiting 100/15min — brute force prevention
- bcrypt 10 rounds — industry standard

## Business Model

No subscriptions, no ads. 10% fee only on successful sessions. Pibly only earns when problems are actually solved.
