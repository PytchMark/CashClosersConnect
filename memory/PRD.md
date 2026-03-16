# Cash Closers WhatsApp CRM - Product Requirements Document

## Original Problem Statement
Build a production-ready internal multi-tenant WhatsApp CRM for Cash Closers, a virtual sales agency. The CRM should have a premium black and gold theme matching the agency branding (https://cashclosersja.com).

## Architecture
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom black/gold theme
- **Database**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Messaging API**: Meta WhatsApp Cloud API
- **Auth**: Supabase Auth with Google OAuth (user's GCP credentials)
- **Deployment**: Google Cloud Run

## User Personas
1. **Super Admin** - Full system access, manages all workspaces
2. **Workspace Admin** - Manages specific client workspaces
3. **Agent** - Handles conversations within assigned workspaces
4. **Client Viewer** - Read-only access to their workspace data

## Core Requirements
### Multi-Tenant Architecture
- [x] Workspace isolation with RLS policies
- [x] Role-based access control (RBAC)
- [x] Per-workspace WhatsApp account mapping

### WhatsApp Integration
- [x] Webhook verification endpoint
- [x] Inbound message processing
- [x] Outbound message sending
- [x] 24-hour service window enforcement
- [x] Template message support
- [x] Status tracking (sent, delivered, read, played)

### CRM Features
- [x] Inbox with real-time updates
- [x] Conversation management
- [x] Contact management
- [x] Lead pipeline (Kanban)
- [x] Message templates
- [x] Tags and notes
- [x] Canned replies

## What's Been Implemented (Jan 2026)

### Database Layer
- [x] 20+ tables with full schema
- [x] RLS policies for tenant isolation
- [x] Helper functions (is_super_admin, is_workspace_member, etc.)
- [x] Seed data for demo workspace

### API Routes
- [x] `/api/webhooks/whatsapp` - Webhook handler (GET + POST)
- [x] `/api/whatsapp/send` - Send messages
- [x] `/auth/callback` - OAuth callback

### UI Pages
- [x] `/` - Landing page
- [x] `/login` - Authentication (email + Google OAuth)
- [x] `/dashboard` - Workspace selector
- [x] `/workspace/[id]/inbox` - Message inbox
- [x] `/workspace/[id]/contacts` - Contact list
- [x] `/workspace/[id]/pipeline` - Kanban board
- [x] `/workspace/[id]/templates` - Template management
- [x] `/workspace/[id]/settings` - Workspace settings

### Design System
- [x] Premium black (#0A0A0A) and gold (#D4AF37) theme
- [x] Glass-morphism panels
- [x] WhatsApp-style message bubbles
- [x] Status indicators
- [x] Responsive layout

## Prioritized Backlog

### P0 (Critical - Next)
- [ ] Configure Supabase credentials
- [ ] Configure Meta WhatsApp credentials
- [ ] Configure Google OAuth credentials
- [ ] Run database migrations
- [ ] Create first admin user

### P1 (High Priority)
- [ ] Media file upload/download
- [ ] Voice note recording
- [ ] Audio player with waveform
- [ ] Real-time subscription fixes
- [ ] Contact import (CSV)

### P2 (Medium Priority)
- [ ] Reports/analytics page
- [ ] Bulk messaging
- [ ] Conversation assignment (round-robin)
- [ ] Webhook retry queue
- [ ] Client portal view

### P3 (Nice to Have)
- [ ] Dark/light theme toggle
- [ ] Custom fields for contacts
- [ ] Scheduled messages
- [ ] Message search
- [ ] Export functionality

## Next Tasks
1. User configures Supabase project and adds credentials
2. User runs database migrations in Supabase SQL editor
3. User creates first admin user in Supabase Auth
4. User configures Meta WhatsApp business account
5. User sets webhook URL in Meta Developer Console
6. Test end-to-end message flow
