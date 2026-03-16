# Cash Closers WhatsApp CRM - Setup Guide

## Overview
This is an internal multi-tenant WhatsApp CRM for Cash Closers, a virtual sales agency. Agents use this CRM to manage WhatsApp conversations for multiple clients.

## Prerequisites
- Node.js 18+
- Supabase account
- Meta Developer account with WhatsApp Business Platform access
- Google Cloud Platform account (for OAuth)

## 1. Supabase Project Setup

### Create Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Enter project name: `cashclosers-crm`
4. Generate a secure database password
5. Select region closest to Jamaica (US East)
6. Click "Create new project"

### Get Credentials
From Project Settings > API:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## 2. Database Setup

### Run Migrations
1. Go to Supabase Dashboard > SQL Editor
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Run the SQL
4. Copy contents of `supabase/migrations/002_rls_policies.sql`
5. Run the SQL

### Seed Demo Data
1. Copy contents of `supabase/seeds/001_demo_data.sql`
2. Run the SQL

## 3. Supabase Auth Setup

### Enable Email Provider
1. Go to Authentication > Providers
2. Enable "Email" provider
3. Configure settings:
   - Enable "Confirm email" (optional for testing)
   - Set "Minimum password length" to 8

### Enable Google OAuth
1. Go to Authentication > Providers
2. Enable "Google" provider
3. Enter your Google Client ID and Client Secret
4. Callback URL: `https://<your-supabase-project>.supabase.co/auth/v1/callback`

## 4. Google Cloud OAuth Setup

### Create OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Go to APIs & Services > Credentials
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application"
6. Add Authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://your-production-domain.com`
7. Add Authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `https://your-production-domain.com/auth/callback`
   - `https://<your-supabase-project>.supabase.co/auth/v1/callback`
8. Save credentials to `.env.local`

## 5. Storage Bucket Setup

### Create Buckets
1. Go to Supabase Dashboard > Storage
2. Create bucket: `whatsapp-media` (private)
3. Create bucket: `workspace-logos` (private)
4. Create bucket: `profile-avatars` (private)

### Configure Policies
For `whatsapp-media` bucket, add policy:
```sql
CREATE POLICY "Workspace members can read media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'whatsapp-media' AND
  EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.profile_id = auth.uid()
    AND wm.workspace_id::text = (storage.foldername(name))[1]
    AND wm.is_active = true
  )
);
```

## 6. Meta WhatsApp Setup

### Create Meta Developer App
1. Go to [Meta Developers](https://developers.facebook.com/)
2. Create new app > Select "Business" type
3. Add "WhatsApp" product
4. Go to WhatsApp > Getting Started

### Generate System User Token
1. Go to Business Settings > System Users
2. Create system user with "Admin" role
3. Add assets: Your WhatsApp Business Account
4. Generate token with permissions:
   - `whatsapp_business_management`
   - `whatsapp_business_messaging`
5. Save token to `WHATSAPP_SYSTEM_USER_TOKEN`

### Configure Webhook
1. Go to WhatsApp > Configuration
2. Set Callback URL: `https://your-domain.com/api/webhooks/whatsapp`
3. Set Verify Token: (any secure string, save to `WHATSAPP_WEBHOOK_VERIFY_TOKEN`)
4. Subscribe to:
   - `messages`
   - `message_status`

### Connect Client WABA
For each client workspace:
1. Get their WhatsApp Business Account ID (WABA ID)
2. Add the WABA to your Meta Business Manager
3. Create entry in `whatsapp_business_accounts` table
4. Add their phone number(s) to `whatsapp_phone_numbers` table

## 7. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Meta WhatsApp
META_APP_ID=123456789
META_APP_SECRET=abc123...
META_VERIFY_TOKEN=your-verify-token
META_GRAPH_API_VERSION=v23.0
WHATSAPP_SYSTEM_USER_TOKEN=EAA...
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-verify-token
WHATSAPP_API_BASE_URL=https://graph.facebook.com

# Google OAuth (your own GCP credentials)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
INTERNAL_CRON_SECRET=your-cron-secret
```

## 8. Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 9. Deployment (Google Cloud Run)

### Build and Deploy
```bash
# Build container
gcloud builds submit --tag gcr.io/PROJECT_ID/cashclosers-crm

# Deploy to Cloud Run
gcloud run deploy cashclosers-crm \
  --image gcr.io/PROJECT_ID/cashclosers-crm \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=...,NEXT_PUBLIC_SUPABASE_ANON_KEY=...,..."
```

### Environment Variables on Cloud Run
Set all environment variables from `.env.example` in Cloud Run service configuration.

## 10. Testing

### Test Inbound Message
1. Send a WhatsApp message to your connected number
2. Check webhook logs in Supabase: `select * from webhook_events order by created_at desc`
3. Verify message appears in CRM inbox

### Test Outbound Message
1. Log in to CRM
2. Open a conversation
3. Send a text message
4. Verify delivery status updates

### Test Voice Note
1. Send a voice note via WhatsApp to your number
2. Verify it appears in the conversation
3. Test audio playback in CRM

## Troubleshooting

### Webhook Not Receiving Events
- Verify webhook URL is publicly accessible
- Check Meta Developer Console for webhook errors
- Verify `WHATSAPP_WEBHOOK_VERIFY_TOKEN` matches

### Messages Not Sending
- Check `WHATSAPP_SYSTEM_USER_TOKEN` is valid
- Verify system user has access to the WABA
- Check audit_logs for error messages

### Auth Not Working
- Verify Supabase URL and keys are correct
- Check Google OAuth redirect URIs include all domains
- Verify user profile is created in `profiles` table

### RLS Blocking Access
- Ensure user has entry in `profiles` table
- Check `workspace_members` entry exists and is active
- Verify helper functions are created correctly

## Common Issues

1. **"Template Required" showing incorrectly**
   - Check `customer_service_window_expires_at` is set correctly
   - Verify timezone handling

2. **Real-time not working**
   - Enable real-time for affected tables in Supabase
   - Check network/firewall allows WebSocket connections

3. **Media files not downloading**
   - Verify storage bucket policies
   - Check `WHATSAPP_SYSTEM_USER_TOKEN` has media access

## Agent Go-Live Checklist

- [ ] Supabase project created and configured
- [ ] All migrations run successfully
- [ ] RLS policies applied
- [ ] Storage buckets created with policies
- [ ] Meta app created with WhatsApp product
- [ ] System user token generated
- [ ] Webhook configured and verified
- [ ] Client WABA connected
- [ ] Phone number(s) added
- [ ] Test inbound message received
- [ ] Test outbound message sent and delivered
- [ ] Test voice note send/receive
- [ ] Test template message
- [ ] Admin user created and can log in
- [ ] Agent user created and assigned to workspace
- [ ] All environment variables set in production
