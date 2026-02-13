# CashClosersConnect — Sales OS CRM (MVP v1)

Internal-first Sales Agent OS + Team CRM built with vanilla HTML/CSS/JS frontend and Node/Express backend on Supabase Postgres.

## Stack
- Frontend: Vanilla HTML/CSS/JS under `public/crm`
- Backend: Node + Express in `server.js`
- DB: Supabase Postgres (`db/schema.sql`)
- Auth: DB credentials + bcrypt passcode hash + JWT (no Supabase Auth)

## App Routes
- `/crm/login`
- `/crm/agent`
- `/crm/manager`

## UX Notes
- Responsive mobile layout: sidebar transforms into a horizontal tab rail on smaller screens.
- Tables are wrapped in horizontal scroll containers for smaller devices.
- Includes viewport meta tags for all CRM pages.

## Core Architecture Rule
Contacts are single-source records in `crm_contacts`. Pipelines are **filtered views** rendered from `crm_lead_state` joined to `crm_contacts`.
- Moving a card updates `crm_lead_state.stage_id`
- Do not duplicate contacts between pipelines

## Environment
Copy `.env.example` to `.env`.

Required variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `CRM_APP_NAME`
- `NODE_ENV`
- `PORT`

## Run (Local)
```bash
npm install
npm start
```

## Docker (Cloud Run ready)
Build and run locally:
```bash
docker build -t cashclosers-crm .
docker run --rm -p 8080:8080 --env-file .env cashclosers-crm
```

Deploy to Cloud Run (example):
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/cashclosers-crm
gcloud run deploy cashclosers-crm \
  --image gcr.io/PROJECT_ID/cashclosers-crm \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars SUPABASE_URL=...,SUPABASE_SERVICE_ROLE_KEY=...,JWT_SECRET=...,CRM_APP_NAME='BizyDepo Sales OS',NODE_ENV=production
```


## Cloud Run Troubleshooting (PORT=8080 startup error)
If Cloud Run reports that the container did not listen on `PORT=8080` in time:
- Ensure these env vars are set on the Cloud Run service: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`.
- Confirm startup command is default (`npm start`) and container port is `8080`.
- Verify app health endpoint: `GET /health` (does not require DB access).
- This app now lazy-initializes Supabase, so missing Supabase env vars no longer crash boot; CRM API calls will return a structured `MISSING_ENV` error until vars are configured.

## Database Schema
Full schema is in `db/schema.sql` and includes:
- `crm_users`
- `crm_accounts`
- `crm_contacts`
- `crm_pipelines`
- `crm_pipeline_stages`
- `crm_lead_state`
- `crm_notes`
- `crm_activities`

Apply schema in Supabase SQL editor:
```sql
-- paste db/schema.sql
```

## Seed Data
Use `db/seed.sql` as a base:
1. Create manager + sample agent
2. Create global pipeline + standard stages
3. Add account + sample rows

> Update the sample bcrypt hash if you want a different passcode.

## API Overview
### Auth
- `POST /api/crm/login` `{ identifier, passcode }`
- `GET /api/crm/me`

### Manager
- `GET/POST /api/crm/users`
- `POST /api/crm/users/:id/reset-passcode`
- `GET/POST /api/crm/accounts`
- `GET/POST /api/crm/pipelines`
- `GET/POST /api/crm/pipelines/:id/stages`
- `GET /api/crm/contacts?q=&account_id=&owner_user_id=&tag=`
- `POST /api/crm/contacts`
- `POST /api/crm/assign`
- `POST /api/crm/import/contacts` (multipart CSV field name: `file`)

### Agent
- `GET /api/crm/my/board?p=<pipeline_id>`
- `POST /api/crm/lead/move`
- `POST /api/crm/notes`
- `POST /api/crm/followup`
- `POST /api/crm/lead/status`

### Shared
- `GET /api/crm/contact/:id/timeline`

## CSV Import Format
Header best-effort mapping:
- `first_name`, `last_name` (or single `name` to split)
- `phone`, `email`, `company`, `parish`
- `tags` (comma-separated)
- `account` or `account_name`

Deduping:
- by `phone` if present
- else by `email`

Returns summary:
```json
{ "ok": true, "summary": { "inserted": 0, "updated": 0, "skipped": 0, "total": 0 } }
```

## Reliability + Security Rules Implemented
- Input validation on all mutation endpoints
- RBAC middleware for manager/agent permissions
- JWT verification for all CRM APIs
- Consistent JSON error format:
```json
{ "ok": false, "error": "...", "code": "..." }
```
