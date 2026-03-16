# Cash Closers WhatsApp CRM

Internal multi-tenant WhatsApp CRM for Cash Closers Virtual Sales Agency.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth with Google OAuth
- **Messaging**: Meta WhatsApp Cloud API
- **Real-time**: Supabase Realtime

## Features

### Core Features
- 📱 WhatsApp message inbox with real-time updates
- 👥 Multi-tenant workspace isolation
- 🏷️ Contact management with tags and lead stages
- 📊 Kanban pipeline for lead tracking
- 📝 Message templates management
- 🎤 Voice note support (send/receive)
- 🔐 Role-based access control

### WhatsApp Integration
- Inbound message handling via webhooks
- Outbound message sending (text, media, templates)
- Customer service window enforcement (24h rule)
- Message status tracking (sent, delivered, read)
- Media file handling

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Meta Developer account

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd cashclosers-crm

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Environment Variables

See `.env.example` for all required variables. Key ones:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
WHATSAPP_SYSTEM_USER_TOKEN=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
```

## Project Structure

```
/app
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── webhooks/      # WhatsApp webhooks
│   │   │   └── whatsapp/      # WhatsApp send API
│   │   ├── auth/              # Auth callback
│   │   ├── dashboard/         # Dashboard page
│   │   ├── login/             # Login page
│   │   └── workspace/         # Workspace pages
│   │       └── [workspaceId]/
│   │           ├── inbox/     # Message inbox
│   │           ├── contacts/  # Contact list
│   │           ├── pipeline/  # Kanban board
│   │           ├── templates/ # Message templates
│   │           └── settings/  # Workspace settings
│   ├── components/            # React components
│   │   ├── inbox/            # Inbox components
│   │   ├── contacts/         # Contact components
│   │   ├── pipeline/         # Pipeline components
│   │   ├── templates/        # Template components
│   │   ├── settings/         # Settings components
│   │   └── shared/           # Shared components
│   ├── lib/                  # Utilities
│   │   ├── supabase/        # Supabase clients
│   │   └── utils.ts         # Helper functions
│   └── types/               # TypeScript types
│       ├── database.ts      # Supabase types
│       └── whatsapp.ts      # WhatsApp API types
├── supabase/
│   ├── migrations/          # SQL migrations
│   └── seeds/               # Seed data
└── docs/
    └── setup.md             # Setup guide
```

## Database Schema

See `supabase/migrations/001_initial_schema.sql` for full schema.

Key tables:
- `profiles` - User profiles (linked to Supabase Auth)
- `workspaces` - Client workspaces
- `workspace_members` - User-workspace assignments
- `contacts` - Contact/lead records
- `conversations` - Message threads
- `messages` - Individual messages
- `templates` - WhatsApp message templates
- `webhook_events` - Raw webhook payloads

## API Endpoints

### Webhooks
- `GET /api/webhooks/whatsapp` - Webhook verification
- `POST /api/webhooks/whatsapp` - Receive WhatsApp events

### WhatsApp
- `POST /api/whatsapp/send` - Send message

## Deployment

### Google Cloud Run

```bash
# Build container (uses cloudbuild.yaml to resolve Docker context robustly)
gcloud builds submit --config cloudbuild.yaml

# Deploy
gcloud run deploy cashclosers-crm \
  --image gcr.io/PROJECT_ID/cashclosers-crm \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

If your Cloud Build trigger uses an inline Docker step, make sure the build context points at
this repository root where `Dockerfile` lives, or switch the trigger to use `cloudbuild.yaml`.

Set environment variables in Cloud Run service configuration.

## Design System

### Colors
- **Primary Gold**: `#D4AF37`
- **Background**: `#0A0A0A`
- **Panel**: `#111111`
- **Border**: `#2A2A2A`

### Typography
- Font: Geist Sans / Mono
- Scale: Tailwind default

## Security

- Row Level Security (RLS) on all tables
- JWT-based authentication via Supabase
- Workspace-scoped data isolation
- Server-side WhatsApp token storage
- Audit logging for sensitive actions

## Contributing

1. Create feature branch
2. Make changes
3. Run linter: `npm run lint`
4. Submit pull request

## License

Proprietary - Cash Closers Jamaica

## Support

Contact: support@cashclosersja.com
