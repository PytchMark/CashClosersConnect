-- Cash Closers WhatsApp CRM - Row Level Security Policies
-- Migration 002: RLS Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_business_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE canned_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- PROFILES POLICIES
-- ===========================================

-- Users can read their own profile
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Super admins can read all profiles
CREATE POLICY profiles_select_super_admin ON profiles
  FOR SELECT USING (is_super_admin(auth.uid()));

-- Users can update their own profile
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Super admins can update any profile
CREATE POLICY profiles_update_super_admin ON profiles
  FOR UPDATE USING (is_super_admin(auth.uid()));

-- ===========================================
-- WORKSPACES POLICIES
-- ===========================================

-- Members can read workspaces they belong to
CREATE POLICY workspaces_select_member ON workspaces
  FOR SELECT USING (
    is_super_admin(auth.uid()) OR
    is_workspace_member(auth.uid(), id)
  );

-- Super admins and workspace admins can insert
CREATE POLICY workspaces_insert ON workspaces
  FOR INSERT WITH CHECK (
    is_super_admin(auth.uid())
  );

-- Workspace admins and super admins can update
CREATE POLICY workspaces_update ON workspaces
  FOR UPDATE USING (
    is_super_admin(auth.uid()) OR
    workspace_role(auth.uid(), id) = 'workspace_admin'
  );

-- ===========================================
-- WORKSPACE MEMBERS POLICIES
-- ===========================================

-- Users can see their own memberships
CREATE POLICY workspace_members_select_own ON workspace_members
  FOR SELECT USING (profile_id = auth.uid());

-- Super admins and workspace admins can see all members in workspace
CREATE POLICY workspace_members_select_admin ON workspace_members
  FOR SELECT USING (
    is_super_admin(auth.uid()) OR
    workspace_role(auth.uid(), workspace_id) = 'workspace_admin'
  );

-- Super admins and workspace admins can manage members
CREATE POLICY workspace_members_insert ON workspace_members
  FOR INSERT WITH CHECK (
    is_super_admin(auth.uid()) OR
    workspace_role(auth.uid(), workspace_id) = 'workspace_admin'
  );

CREATE POLICY workspace_members_update ON workspace_members
  FOR UPDATE USING (
    is_super_admin(auth.uid()) OR
    workspace_role(auth.uid(), workspace_id) = 'workspace_admin'
  );

CREATE POLICY workspace_members_delete ON workspace_members
  FOR DELETE USING (
    is_super_admin(auth.uid()) OR
    workspace_role(auth.uid(), workspace_id) = 'workspace_admin'
  );

-- ===========================================
-- WORKSPACE SETTINGS POLICIES
-- ===========================================

CREATE POLICY workspace_settings_select ON workspace_settings
  FOR SELECT USING (
    is_super_admin(auth.uid()) OR
    is_workspace_member(auth.uid(), workspace_id)
  );

CREATE POLICY workspace_settings_insert ON workspace_settings
  FOR INSERT WITH CHECK (
    is_super_admin(auth.uid()) OR
    workspace_role(auth.uid(), workspace_id) = 'workspace_admin'
  );

CREATE POLICY workspace_settings_update ON workspace_settings
  FOR UPDATE USING (
    is_super_admin(auth.uid()) OR
    has_workspace_permission(auth.uid(), workspace_id, 'manage_settings')
  );

-- ===========================================
-- WHATSAPP BUSINESS ACCOUNTS POLICIES
-- ===========================================

CREATE POLICY whatsapp_business_accounts_select ON whatsapp_business_accounts
  FOR SELECT USING (
    is_super_admin(auth.uid()) OR
    is_workspace_member(auth.uid(), workspace_id)
  );

CREATE POLICY whatsapp_business_accounts_manage ON whatsapp_business_accounts
  FOR ALL USING (
    is_super_admin(auth.uid()) OR
    workspace_role(auth.uid(), workspace_id) = 'workspace_admin'
  );

-- ===========================================
-- WHATSAPP PHONE NUMBERS POLICIES
-- ===========================================

CREATE POLICY whatsapp_phone_numbers_select ON whatsapp_phone_numbers
  FOR SELECT USING (
    is_super_admin(auth.uid()) OR
    is_workspace_member(auth.uid(), workspace_id)
  );

CREATE POLICY whatsapp_phone_numbers_manage ON whatsapp_phone_numbers
  FOR ALL USING (
    is_super_admin(auth.uid()) OR
    workspace_role(auth.uid(), workspace_id) = 'workspace_admin'
  );

-- ===========================================
-- CONTACTS POLICIES
-- ===========================================

CREATE POLICY contacts_select ON contacts
  FOR SELECT USING (
    is_super_admin(auth.uid()) OR
    is_workspace_member(auth.uid(), workspace_id)
  );

CREATE POLICY contacts_insert ON contacts
  FOR INSERT WITH CHECK (
    is_super_admin(auth.uid()) OR
    is_workspace_member(auth.uid(), workspace_id)
  );

CREATE POLICY contacts_update ON contacts
  FOR UPDATE USING (
    is_super_admin(auth.uid()) OR
    is_workspace_member(auth.uid(), workspace_id)
  );

CREATE POLICY contacts_delete ON contacts
  FOR DELETE USING (
    is_super_admin(auth.uid()) OR
    workspace_role(auth.uid(), workspace_id) IN ('workspace_admin')
  );

-- ===========================================
-- CONVERSATIONS POLICIES
-- ===========================================

-- Agents can see conversations assigned to them or if they have view_all permission
CREATE POLICY conversations_select ON conversations
  FOR SELECT USING (
    is_super_admin(auth.uid()) OR
    (is_workspace_member(auth.uid(), workspace_id) AND (
      assigned_profile_id = auth.uid() OR
      has_workspace_permission(auth.uid(), workspace_id, 'view_all_conversations') OR
      workspace_role(auth.uid(), workspace_id) = 'workspace_admin'
    ))
  );

CREATE POLICY conversations_insert ON conversations
  FOR INSERT WITH CHECK (
    is_super_admin(auth.uid()) OR
    is_workspace_member(auth.uid(), workspace_id)
  );

CREATE POLICY conversations_update ON conversations
  FOR UPDATE USING (
    is_super_admin(auth.uid()) OR
    (is_workspace_member(auth.uid(), workspace_id) AND (
      assigned_profile_id = auth.uid() OR
      has_workspace_permission(auth.uid(), workspace_id, 'assign_conversations') OR
      workspace_role(auth.uid(), workspace_id) = 'workspace_admin'
    ))
  );

-- ===========================================
-- MESSAGES POLICIES
-- ===========================================

CREATE POLICY messages_select ON messages
  FOR SELECT USING (
    is_super_admin(auth.uid()) OR
    is_workspace_member(auth.uid(), workspace_id)
  );

CREATE POLICY messages_insert ON messages
  FOR INSERT WITH CHECK (
    is_super_admin(auth.uid()) OR
    is_workspace_member(auth.uid(), workspace_id)
  );

CREATE POLICY messages_update ON messages
  FOR UPDATE USING (
    is_super_admin(auth.uid()) OR
    is_workspace_member(auth.uid(), workspace_id)
  );

-- ===========================================
-- MESSAGE STATUS EVENTS POLICIES
-- ===========================================

CREATE POLICY message_status_events_select ON message_status_events
  FOR SELECT USING (
    is_super_admin(auth.uid()) OR
    is_workspace_member(auth.uid(), workspace_id)
  );

-- Insert only via service role (webhooks)

-- ===========================================
-- MEDIA FILES POLICIES
-- ===========================================

CREATE POLICY media_files_select ON media_files
  FOR SELECT USING (
    is_super_admin(auth.uid()) OR
    is_workspace_member(auth.uid(), workspace_id)
  );

CREATE POLICY media_files_insert ON media_files
  FOR INSERT WITH CHECK (
    is_super_admin(auth.uid()) OR
    is_workspace_member(auth.uid(), workspace_id)
  );

-- ===========================================
-- TEMPLATES POLICIES
-- ===========================================

CREATE POLICY templates_select ON templates
  FOR SELECT USING (
    is_super_admin(auth.uid()) OR
    is_workspace_member(auth.uid(), workspace_id)
  );

CREATE POLICY templates_manage ON templates
  FOR ALL USING (
    is_super_admin(auth.uid()) OR
    has_workspace_permission(auth.uid(), workspace_id, 'manage_templates')
  );

-- ===========================================
-- NOTES POLICIES
-- ===========================================

-- Workspace members can see notes (except client_viewer)
CREATE POLICY notes_select ON notes
  FOR SELECT USING (
    is_super_admin(auth.uid()) OR
    (is_workspace_member(auth.uid(), workspace_id) AND 
     workspace_role(auth.uid(), workspace_id) != 'client_viewer')
  );

CREATE POLICY notes_insert ON notes
  FOR INSERT WITH CHECK (
    is_super_admin(auth.uid()) OR
    (is_workspace_member(auth.uid(), workspace_id) AND 
     workspace_role(auth.uid(), workspace_id) != 'client_viewer')
  );

CREATE POLICY notes_update ON notes
  FOR UPDATE USING (
    is_super_admin(auth.uid()) OR
    profile_id = auth.uid()
  );

CREATE POLICY notes_delete ON notes
  FOR DELETE USING (
    is_super_admin(auth.uid()) OR
    profile_id = auth.uid()
  );

-- ===========================================
-- TAGS & CONTACT TAGS POLICIES
-- ===========================================

CREATE POLICY tags_select ON tags
  FOR SELECT USING (
    is_super_admin(auth.uid()) OR
    is_workspace_member(auth.uid(), workspace_id)
  );

CREATE POLICY tags_manage ON tags
  FOR ALL USING (
    is_super_admin(auth.uid()) OR
    is_workspace_member(auth.uid(), workspace_id)
  );

CREATE POLICY contact_tags_select ON contact_tags
  FOR SELECT USING (
    is_super_admin(auth.uid()) OR
    is_workspace_member(auth.uid(), workspace_id)
  );

CREATE POLICY contact_tags_manage ON contact_tags
  FOR ALL USING (
    is_super_admin(auth.uid()) OR
    is_workspace_member(auth.uid(), workspace_id)
  );

-- ===========================================
-- LEAD STAGES POLICIES
-- ===========================================

CREATE POLICY lead_stages_select ON lead_stages
  FOR SELECT USING (
    is_super_admin(auth.uid()) OR
    is_workspace_member(auth.uid(), workspace_id)
  );

CREATE POLICY lead_stages_manage ON lead_stages
  FOR ALL USING (
    is_super_admin(auth.uid()) OR
    workspace_role(auth.uid(), workspace_id) = 'workspace_admin'
  );

-- ===========================================
-- CANNED REPLIES POLICIES
-- ===========================================

CREATE POLICY canned_replies_select ON canned_replies
  FOR SELECT USING (
    is_super_admin(auth.uid()) OR
    is_workspace_member(auth.uid(), workspace_id)
  );

CREATE POLICY canned_replies_manage ON canned_replies
  FOR ALL USING (
    is_super_admin(auth.uid()) OR
    is_workspace_member(auth.uid(), workspace_id)
  );

-- ===========================================
-- ASSIGNMENTS POLICIES
-- ===========================================

CREATE POLICY assignments_select ON assignments
  FOR SELECT USING (
    is_super_admin(auth.uid()) OR
    is_workspace_member(auth.uid(), workspace_id)
  );

CREATE POLICY assignments_insert ON assignments
  FOR INSERT WITH CHECK (
    is_super_admin(auth.uid()) OR
    has_workspace_permission(auth.uid(), workspace_id, 'assign_conversations')
  );

-- ===========================================
-- AUDIT LOGS POLICIES
-- ===========================================

-- Only workspace_admin and super_admin can read
CREATE POLICY audit_logs_select ON audit_logs
  FOR SELECT USING (
    is_super_admin(auth.uid()) OR
    (workspace_id IS NOT NULL AND workspace_role(auth.uid(), workspace_id) = 'workspace_admin')
  );

-- Insert allowed for all authenticated users (logging their own actions)
CREATE POLICY audit_logs_insert ON audit_logs
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- ===========================================
-- WEBHOOK EVENTS POLICIES
-- ===========================================

-- No direct client access - backend only via service role
-- These policies are intentionally restrictive

CREATE POLICY webhook_events_select_super_admin ON webhook_events
  FOR SELECT USING (is_super_admin(auth.uid()));
