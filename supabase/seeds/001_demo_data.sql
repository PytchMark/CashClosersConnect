-- Cash Closers WhatsApp CRM - Seed Data
-- Run this after migrations

-- ===========================================
-- DEMO WORKSPACE & DATA
-- ===========================================

-- Note: Profiles are created automatically via auth trigger
-- First create a super admin user in Supabase Auth, then update their profile:

-- UPDATE profiles SET global_role = 'super_admin' WHERE email = 'admin@cashclosers.com';

-- Demo Workspace
INSERT INTO workspaces (id, name, slug, company_name, brand_color, timezone, currency, status, client_contact_name, client_contact_email, notes)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Demo Client',
  'demo-client',
  'Demo Company Ltd',
  '#D4AF37',
  'America/Jamaica',
  'JMD',
  'active',
  'John Demo',
  'john@democompany.com',
  'Demo workspace for testing and onboarding'
) ON CONFLICT (slug) DO NOTHING;

-- Workspace Settings
INSERT INTO workspace_settings (workspace_id, service_window_hours, default_country_code, auto_assign_mode, voice_notes_enabled, templates_enabled)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  24,
  'JM',
  'manual',
  true,
  true
) ON CONFLICT (workspace_id) DO NOTHING;

-- WhatsApp Business Account (placeholder - needs real WABA ID)
INSERT INTO whatsapp_business_accounts (id, workspace_id, waba_id, meta_business_id, access_mode, status)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'DEMO_WABA_ID_REPLACE_ME',
  'DEMO_BUSINESS_ID',
  'manual',
  'pending'
) ON CONFLICT (waba_id) DO NOTHING;

-- WhatsApp Phone Number (placeholder)
INSERT INTO whatsapp_phone_numbers (id, workspace_id, whatsapp_business_account_id, phone_number_id, display_phone_number, verified_name, is_primary, status)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'DEMO_PHONE_ID_REPLACE_ME',
  '+1876XXXXXXX',
  'Demo Company',
  true,
  'pending'
) ON CONFLICT (phone_number_id) DO NOTHING;

-- Lead Stages
INSERT INTO lead_stages (workspace_id, name, position, color, is_default) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'New Lead', 1, '#6366F1', true),
  ('a0000000-0000-0000-0000-000000000001', 'Contacted', 2, '#F59E0B', false),
  ('a0000000-0000-0000-0000-000000000001', 'Qualified', 3, '#10B981', false),
  ('a0000000-0000-0000-0000-000000000001', 'Closed Won', 4, '#22C55E', false)
ON CONFLICT (workspace_id, name) DO NOTHING;

-- Tags
INSERT INTO tags (workspace_id, name, color) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Hot Lead', '#EF4444'),
  ('a0000000-0000-0000-0000-000000000001', 'VIP', '#D4AF37'),
  ('a0000000-0000-0000-0000-000000000001', 'Follow Up', '#3B82F6'),
  ('a0000000-0000-0000-0000-000000000001', 'Referral', '#8B5CF6'),
  ('a0000000-0000-0000-0000-000000000001', 'Corporate', '#64748B')
ON CONFLICT (workspace_id, name) DO NOTHING;

-- Canned Replies
INSERT INTO canned_replies (workspace_id, title, body) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Greeting', 'Hi! Thank you for reaching out to us. How can I help you today?'),
  ('a0000000-0000-0000-0000-000000000001', 'Thank You', 'Thank you for your interest! I''ll get back to you shortly with more details.'),
  ('a0000000-0000-0000-0000-000000000001', 'Business Hours', 'Our business hours are Monday to Friday, 9 AM to 5 PM (Jamaica Time). We''ll respond to your message during business hours.')
ON CONFLICT DO NOTHING;

-- Sample Templates
INSERT INTO templates (workspace_id, name, category, language_code, status, body_text, header_type) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'hello_world', 'UTILITY', 'en', 'approved', 'Hello {{1}}, welcome to our service!', 'TEXT'),
  ('a0000000-0000-0000-0000-000000000001', 'appointment_reminder', 'UTILITY', 'en', 'approved', 'Hi {{1}}, this is a reminder about your appointment on {{2}} at {{3}}. Reply YES to confirm or NO to reschedule.', 'TEXT')
ON CONFLICT (workspace_id, name, language_code) DO NOTHING;

-- Sample Contacts
INSERT INTO contacts (id, workspace_id, phone_e164, first_name, last_name, full_name, email, city, country, source, opt_in_status) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '+18765551001', 'Marcus', 'Johnson', 'Marcus Johnson', 'marcus@example.com', 'Kingston', 'Jamaica', 'website', 'opted_in'),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '+18765551002', 'Shantel', 'Brown', 'Shantel Brown', 'shantel@example.com', 'Montego Bay', 'Jamaica', 'referral', 'opted_in'),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '+18765551003', 'Devon', 'Williams', 'Devon Williams', 'devon@example.com', 'Spanish Town', 'Jamaica', 'social_media', 'opted_in'),
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', '+18765551004', 'Kimberly', 'Thompson', 'Kimberly Thompson', 'kim@example.com', 'Portmore', 'Jamaica', 'website', 'unknown'),
  ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', '+18765551005', 'Andre', 'Davis', 'Andre Davis', 'andre@example.com', 'Ocho Rios', 'Jamaica', 'trade_show', 'opted_in'),
  ('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', '+18765551006', 'Camille', 'Stewart', 'Camille Stewart', 'camille@example.com', 'Mandeville', 'Jamaica', 'referral', 'opted_in'),
  ('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', '+18765551007', 'Ryan', 'Campbell', 'Ryan Campbell', 'ryan@example.com', 'May Pen', 'Jamaica', 'website', 'unknown'),
  ('d0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', '+18765551008', 'Tanya', 'Morgan', 'Tanya Morgan', 'tanya@example.com', 'Negril', 'Jamaica', 'social_media', 'opted_in'),
  ('d0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', '+18765551009', 'Jason', 'Graham', 'Jason Graham', 'jason@example.com', 'Kingston', 'Jamaica', 'website', 'opted_in'),
  ('d0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', '+18765551010', 'Nicole', 'Reid', 'Nicole Reid', 'nicole@example.com', 'Portmore', 'Jamaica', 'referral', 'opted_in')
ON CONFLICT (workspace_id, phone_e164) DO NOTHING;

-- Sample Conversations
INSERT INTO conversations (id, workspace_id, contact_id, whatsapp_phone_number_id, status, priority, last_message_preview, last_message_at, unread_count, template_required) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'open', 'high', 'Yes, I''m interested in your premium package', NOW() - INTERVAL '10 minutes', 2, false),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'open', 'normal', 'Can you send me more information?', NOW() - INTERVAL '30 minutes', 1, false),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'pending', 'normal', 'I''ll think about it and get back to you', NOW() - INTERVAL '2 hours', 0, false),
  ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'open', 'urgent', 'I need this done today!', NOW() - INTERVAL '5 minutes', 3, false),
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'closed', 'normal', 'Thank you for your help!', NOW() - INTERVAL '1 day', 0, false),
  ('e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', 'open', 'normal', 'When can we schedule a call?', NOW() - INTERVAL '45 minutes', 1, false),
  ('e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000001', 'snoozed', 'low', 'Let me check with my team', NOW() - INTERVAL '3 days', 0, true),
  ('e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000001', 'open', 'high', 'I want to proceed with the deal', NOW() - INTERVAL '15 minutes', 1, false),
  ('e0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000001', 'open', 'normal', 'What are your payment options?', NOW() - INTERVAL '1 hour', 1, false),
  ('e0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000001', 'pending', 'normal', 'I''ll send the documents tomorrow', NOW() - INTERVAL '4 hours', 0, false)
ON CONFLICT DO NOTHING;

-- Sample Messages (mix of inbound and outbound)
INSERT INTO messages (workspace_id, conversation_id, contact_id, whatsapp_phone_number_id, direction, sender_type, type, text_body, status, created_at) VALUES
  -- Conversation 1
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'inbound', 'contact', 'text', 'Hello, I saw your ad and I''m interested', 'received', NOW() - INTERVAL '1 hour'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'outbound', 'agent', 'text', 'Hi Marcus! Thanks for reaching out. We have several packages available. Would you like to hear about our premium offering?', 'delivered', NOW() - INTERVAL '55 minutes'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'inbound', 'contact', 'text', 'Yes, I''m interested in your premium package', 'received', NOW() - INTERVAL '10 minutes'),
  
  -- Conversation 2
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'inbound', 'contact', 'text', 'Hi, a friend referred me to you', 'received', NOW() - INTERVAL '2 hours'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'outbound', 'agent', 'text', 'Welcome Shantel! We''re happy to have you. What services are you looking for?', 'read', NOW() - INTERVAL '1 hour 45 minutes'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'inbound', 'contact', 'text', 'Can you send me more information?', 'received', NOW() - INTERVAL '30 minutes'),
  
  -- Conversation 4 (urgent)
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'inbound', 'contact', 'text', 'Hello? Is anyone there?', 'received', NOW() - INTERVAL '20 minutes'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'inbound', 'contact', 'text', 'I really need help ASAP', 'received', NOW() - INTERVAL '15 minutes'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'inbound', 'contact', 'text', 'I need this done today!', 'received', NOW() - INTERVAL '5 minutes'),

  -- Conversation 8 (hot lead)
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000001', 'inbound', 'contact', 'text', 'I''ve been thinking about your proposal', 'received', NOW() - INTERVAL '30 minutes'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000001', 'outbound', 'agent', 'text', 'Great to hear from you Tanya! Do you have any questions?', 'delivered', NOW() - INTERVAL '25 minutes'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000001', 'inbound', 'contact', 'text', 'I want to proceed with the deal', 'received', NOW() - INTERVAL '15 minutes')
ON CONFLICT DO NOTHING;

-- Note: After creating auth users for your team, run:
-- INSERT INTO workspace_members (workspace_id, profile_id, role, can_view_all_conversations, can_assign_conversations, can_manage_templates, can_manage_settings)
-- VALUES ('a0000000-0000-0000-0000-000000000001', '<user-uuid>', 'workspace_admin', true, true, true, true);
