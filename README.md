# BoothBnb Backend

## Overview
This service handles all data, business logic, and third-party integrations for BoothBnb — bookings, payments, email notifications, and scheduled reconciliation — exposed as a REST API consumed by the frontend.

## Quick Links
* **Web Application:** [https://dev.boothbnb.online](https://dev.boothbnb.online)
* **Front-end Repo:** [https://github.com/ChongWengKit/boothbnb-frontend](https://github.com/ChongWengKit/boothbnb-frontend)
* **Documentation:** [https://api.dev.boothbnb.online/swagger](https://api.dev.boothbnb.online/swagger)

## Tech Stack
* **Framework:** Next.js, React, TypeScript
* **Database & ORM:** Neon PostgreSQL, Prisma ORM
* **Deployment & CI/CD:** Vercel, GitHub Actions, Cloudflare (DNS)
* **Integrations:** Stripe, Frankfurter, Resend, Cloudinary

## Key Features
* **Database Management:** Designed a relational PostgreSQL schema with Prisma ORM to enforce data integrity across users, events, bookings, and payments.
* **Payment Processing:** Integrated Stripe payment processing with Frankfurter exchange rates to support multi-currency checkout.
* **Email Workflows:** Integrated Resend to manage automated email workflows.
* **Media & Mapping:** Integrated Cloudinary for optimized media delivery and Leaflet.js for interactive location mapping.
* **Webhook Synchronization:** Designed webhook processing to synchronize Stripe payments and Resend email events with the application database.
* **Reconciliation Jobs:** Implemented scheduled reconciliation jobs for booking, payment, and email status, providing recovery when webhook delivery fails.
* **Security & Middleware:** Built authentication middleware to validate request headers and protect restricted API routes.

## ⚙️ Getting Started

```bash
git clone https://github.com/ChongWengKit/boothbnb-backend.git
cd boothbnb-backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

## 🔑 Environment Variables

Create a `.env` file in the root and set the following:

* `NODE_ENV` — environment mode (e.g. `dev`, `production`)
* `DOMAIN` — base domain URL for the app
* `BACKEND_DOMAIN` — domain/host the backend runs on
* `FRONTEND_DOMAIN` — domain/host the frontend runs on, used for CORS
* `PORT` — port the server listens on
* `DATABASE_URL` — Neon PostgreSQL connection string
* `RESEND_API_KEY` — Resend API key for sending transactional email
* `JWT_SECRET` — secret used to sign and verify authentication tokens
* `GOOGLE_CLIENT_ID` — Google OAuth client ID for sign-in
* `EMAIL` — sender email address used for outgoing notifications
* `CLOUDINARY_CLOUD_NAME` — Cloudinary account cloud name
* `CLOUDINARY_API_KEY` — Cloudinary API key
* `CLOUDINARY_API_SECRET` — Cloudinary API secret
* `STRIPE_SECRET_KEY` — Stripe secret key for server-side payment processing
* `STRIPE_PUBLIC_KEY` — Stripe publishable key
* `STRIPE_WEBHOOK_SECRET` — secret used to verify incoming Stripe webhook signatures
* `STRIPE_ACCOUNT` — connected Stripe account ID, used for vendor onboarding/payouts
* `CRON_SECRET` — secret used to authenticate scheduled/cron job requests
* `CURRENCY_API` — Frankfurter currency conversion API endpoint
