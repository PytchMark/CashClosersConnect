export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          avatar_url: string | null;
          global_role: "super_admin" | "staff";
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          avatar_url?: string | null;
          global_role?: "super_admin" | "staff";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          avatar_url?: string | null;
          global_role?: "super_admin" | "staff";
          is_active?: boolean;
          updated_at?: string;
        };
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          company_name: string;
          brand_color: string | null;
          logo_url: string | null;
          timezone: string;
          currency: string;
          status: "active" | "paused" | "archived";
          client_contact_name: string | null;
          client_contact_email: string | null;
          client_contact_phone: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          company_name: string;
          brand_color?: string | null;
          logo_url?: string | null;
          timezone?: string;
          currency?: string;
          status?: "active" | "paused" | "archived";
          client_contact_name?: string | null;
          client_contact_email?: string | null;
          client_contact_phone?: string | null;
          notes?: string | null;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          slug?: string;
          company_name?: string;
          brand_color?: string | null;
          logo_url?: string | null;
          timezone?: string;
          currency?: string;
          status?: "active" | "paused" | "archived";
          client_contact_name?: string | null;
          client_contact_email?: string | null;
          client_contact_phone?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          profile_id: string;
          role: "workspace_admin" | "agent" | "client_viewer";
          can_view_all_conversations: boolean;
          can_assign_conversations: boolean;
          can_manage_templates: boolean;
          can_manage_settings: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          profile_id: string;
          role: "workspace_admin" | "agent" | "client_viewer";
          can_view_all_conversations?: boolean;
          can_assign_conversations?: boolean;
          can_manage_templates?: boolean;
          can_manage_settings?: boolean;
          is_active?: boolean;
        };
        Update: {
          role?: "workspace_admin" | "agent" | "client_viewer";
          can_view_all_conversations?: boolean;
          can_assign_conversations?: boolean;
          can_manage_templates?: boolean;
          can_manage_settings?: boolean;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      workspace_settings: {
        Row: {
          id: string;
          workspace_id: string;
          service_window_hours: number;
          default_country_code: string | null;
          auto_assign_mode: "manual" | "round_robin";
          voice_notes_enabled: boolean;
          templates_enabled: boolean;
          client_portal_enabled: boolean;
          audit_log_retention_days: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          service_window_hours?: number;
          default_country_code?: string | null;
          auto_assign_mode?: "manual" | "round_robin";
          voice_notes_enabled?: boolean;
          templates_enabled?: boolean;
          client_portal_enabled?: boolean;
          audit_log_retention_days?: number;
        };
        Update: {
          service_window_hours?: number;
          default_country_code?: string | null;
          auto_assign_mode?: "manual" | "round_robin";
          voice_notes_enabled?: boolean;
          templates_enabled?: boolean;
          client_portal_enabled?: boolean;
          audit_log_retention_days?: number;
          updated_at?: string;
        };
      };
      whatsapp_business_accounts: {
        Row: {
          id: string;
          workspace_id: string;
          meta_business_id: string | null;
          waba_id: string;
          access_mode: "partner_shared" | "embedded_signup" | "manual";
          system_user_name: string | null;
          status: "connected" | "pending" | "error" | "disconnected";
          raw_metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          meta_business_id?: string | null;
          waba_id: string;
          access_mode?: "partner_shared" | "embedded_signup" | "manual";
          system_user_name?: string | null;
          status?: "connected" | "pending" | "error" | "disconnected";
          raw_metadata?: Json;
        };
        Update: {
          meta_business_id?: string | null;
          waba_id?: string;
          access_mode?: "partner_shared" | "embedded_signup" | "manual";
          system_user_name?: string | null;
          status?: "connected" | "pending" | "error" | "disconnected";
          raw_metadata?: Json;
          updated_at?: string;
        };
      };
      whatsapp_phone_numbers: {
        Row: {
          id: string;
          workspace_id: string;
          whatsapp_business_account_id: string;
          phone_number_id: string;
          display_phone_number: string;
          verified_name: string | null;
          quality_rating: string | null;
          code_verification_status: string | null;
          throughput_tier: string | null;
          is_primary: boolean;
          status: "active" | "pending" | "suspended" | "disconnected";
          raw_metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          whatsapp_business_account_id: string;
          phone_number_id: string;
          display_phone_number: string;
          verified_name?: string | null;
          quality_rating?: string | null;
          code_verification_status?: string | null;
          throughput_tier?: string | null;
          is_primary?: boolean;
          status?: "active" | "pending" | "suspended" | "disconnected";
          raw_metadata?: Json;
        };
        Update: {
          verified_name?: string | null;
          quality_rating?: string | null;
          code_verification_status?: string | null;
          throughput_tier?: string | null;
          is_primary?: boolean;
          status?: "active" | "pending" | "suspended" | "disconnected";
          raw_metadata?: Json;
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          workspace_id: string;
          phone_e164: string;
          first_name: string | null;
          last_name: string | null;
          full_name: string | null;
          email: string | null;
          city: string | null;
          country: string | null;
          source: string | null;
          lead_stage_id: string | null;
          owner_profile_id: string | null;
          last_inbound_at: string | null;
          last_outbound_at: string | null;
          last_message_at: string | null;
          is_blocked: boolean;
          opt_in_status: "unknown" | "opted_in" | "opted_out";
          custom_fields: Json;
          raw_profile: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          phone_e164: string;
          first_name?: string | null;
          last_name?: string | null;
          full_name?: string | null;
          email?: string | null;
          city?: string | null;
          country?: string | null;
          source?: string | null;
          lead_stage_id?: string | null;
          owner_profile_id?: string | null;
          last_inbound_at?: string | null;
          last_outbound_at?: string | null;
          last_message_at?: string | null;
          is_blocked?: boolean;
          opt_in_status?: "unknown" | "opted_in" | "opted_out";
          custom_fields?: Json;
          raw_profile?: Json;
        };
        Update: {
          phone_e164?: string;
          first_name?: string | null;
          last_name?: string | null;
          full_name?: string | null;
          email?: string | null;
          city?: string | null;
          country?: string | null;
          source?: string | null;
          lead_stage_id?: string | null;
          owner_profile_id?: string | null;
          last_inbound_at?: string | null;
          last_outbound_at?: string | null;
          last_message_at?: string | null;
          is_blocked?: boolean;
          opt_in_status?: "unknown" | "opted_in" | "opted_out";
          custom_fields?: Json;
          raw_profile?: Json;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          workspace_id: string;
          contact_id: string;
          whatsapp_phone_number_id: string;
          assigned_profile_id: string | null;
          status: "open" | "pending" | "closed" | "snoozed";
          priority: "low" | "normal" | "high" | "urgent";
          subject: string | null;
          last_message_id: string | null;
          last_message_preview: string | null;
          last_message_at: string | null;
          unread_count: number;
          customer_service_window_expires_at: string | null;
          template_required: boolean;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          contact_id: string;
          whatsapp_phone_number_id: string;
          assigned_profile_id?: string | null;
          status?: "open" | "pending" | "closed" | "snoozed";
          priority?: "low" | "normal" | "high" | "urgent";
          subject?: string | null;
          last_message_id?: string | null;
          last_message_preview?: string | null;
          last_message_at?: string | null;
          unread_count?: number;
          customer_service_window_expires_at?: string | null;
          template_required?: boolean;
          is_archived?: boolean;
        };
        Update: {
          assigned_profile_id?: string | null;
          status?: "open" | "pending" | "closed" | "snoozed";
          priority?: "low" | "normal" | "high" | "urgent";
          subject?: string | null;
          last_message_id?: string | null;
          last_message_preview?: string | null;
          last_message_at?: string | null;
          unread_count?: number;
          customer_service_window_expires_at?: string | null;
          template_required?: boolean;
          is_archived?: boolean;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          workspace_id: string;
          conversation_id: string;
          contact_id: string;
          whatsapp_phone_number_id: string;
          direction: "inbound" | "outbound";
          sender_type: "contact" | "agent" | "system";
          profile_id: string | null;
          meta_message_id: string | null;
          reply_to_meta_message_id: string | null;
          type: "text" | "image" | "document" | "audio" | "voice" | "video" | "template" | "interactive" | "reaction" | "system";
          text_body: string | null;
          caption: string | null;
          media_file_id: string | null;
          template_id: string | null;
          status: "queued" | "sent" | "delivered" | "read" | "played" | "failed" | "received";
          error_code: string | null;
          error_message: string | null;
          sent_at: string | null;
          delivered_at: string | null;
          read_at: string | null;
          played_at: string | null;
          received_at: string | null;
          failed_at: string | null;
          raw_payload: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          conversation_id: string;
          contact_id: string;
          whatsapp_phone_number_id: string;
          direction: "inbound" | "outbound";
          sender_type: "contact" | "agent" | "system";
          profile_id?: string | null;
          meta_message_id?: string | null;
          reply_to_meta_message_id?: string | null;
          type: "text" | "image" | "document" | "audio" | "voice" | "video" | "template" | "interactive" | "reaction" | "system";
          text_body?: string | null;
          caption?: string | null;
          media_file_id?: string | null;
          template_id?: string | null;
          status?: "queued" | "sent" | "delivered" | "read" | "played" | "failed" | "received";
          error_code?: string | null;
          error_message?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          read_at?: string | null;
          played_at?: string | null;
          received_at?: string | null;
          failed_at?: string | null;
          raw_payload?: Json;
        };
        Update: {
          meta_message_id?: string | null;
          status?: "queued" | "sent" | "delivered" | "read" | "played" | "failed" | "received";
          error_code?: string | null;
          error_message?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          read_at?: string | null;
          played_at?: string | null;
          failed_at?: string | null;
          raw_payload?: Json;
          updated_at?: string;
        };
      };
      message_status_events: {
        Row: {
          id: string;
          workspace_id: string;
          message_id: string | null;
          meta_message_id: string | null;
          status: string;
          event_time: string;
          raw_payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          message_id?: string | null;
          meta_message_id?: string | null;
          status: string;
          event_time: string;
          raw_payload?: Json;
        };
        Update: {
          message_id?: string | null;
          status?: string;
          event_time?: string;
          raw_payload?: Json;
        };
      };
      media_files: {
        Row: {
          id: string;
          workspace_id: string;
          conversation_id: string | null;
          contact_id: string | null;
          direction: "inbound" | "outbound";
          storage_bucket: string;
          storage_path: string;
          mime_type: string;
          media_type: "image" | "document" | "audio" | "voice" | "video";
          original_filename: string | null;
          file_size_bytes: number | null;
          meta_media_id: string | null;
          sha256: string | null;
          duration_seconds: number | null;
          waveform_json: Json | null;
          is_downloaded: boolean;
          download_status: "pending" | "downloaded" | "failed";
          raw_payload: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          conversation_id?: string | null;
          contact_id?: string | null;
          direction: "inbound" | "outbound";
          storage_bucket: string;
          storage_path: string;
          mime_type: string;
          media_type: "image" | "document" | "audio" | "voice" | "video";
          original_filename?: string | null;
          file_size_bytes?: number | null;
          meta_media_id?: string | null;
          sha256?: string | null;
          duration_seconds?: number | null;
          waveform_json?: Json | null;
          is_downloaded?: boolean;
          download_status?: "pending" | "downloaded" | "failed";
          raw_payload?: Json;
        };
        Update: {
          storage_path?: string;
          file_size_bytes?: number | null;
          sha256?: string | null;
          duration_seconds?: number | null;
          waveform_json?: Json | null;
          is_downloaded?: boolean;
          download_status?: "pending" | "downloaded" | "failed";
          raw_payload?: Json;
          updated_at?: string;
        };
      };
      templates: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          category: string | null;
          language_code: string;
          status: "pending" | "approved" | "rejected" | "paused";
          template_namespace: string | null;
          body_text: string | null;
          header_type: string | null;
          footer_text: string | null;
          buttons: Json;
          variables: Json;
          raw_payload: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          category?: string | null;
          language_code?: string;
          status?: "pending" | "approved" | "rejected" | "paused";
          template_namespace?: string | null;
          body_text?: string | null;
          header_type?: string | null;
          footer_text?: string | null;
          buttons?: Json;
          variables?: Json;
          raw_payload?: Json;
        };
        Update: {
          name?: string;
          category?: string | null;
          language_code?: string;
          status?: "pending" | "approved" | "rejected" | "paused";
          template_namespace?: string | null;
          body_text?: string | null;
          header_type?: string | null;
          footer_text?: string | null;
          buttons?: Json;
          variables?: Json;
          raw_payload?: Json;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          workspace_id: string;
          contact_id: string | null;
          conversation_id: string | null;
          profile_id: string;
          body: string;
          is_pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          contact_id?: string | null;
          conversation_id?: string | null;
          profile_id: string;
          body: string;
          is_pinned?: boolean;
        };
        Update: {
          body?: string;
          is_pinned?: boolean;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          color?: string | null;
        };
        Update: {
          name?: string;
          color?: string | null;
        };
      };
      contact_tags: {
        Row: {
          id: string;
          workspace_id: string;
          contact_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          contact_id: string;
          tag_id: string;
        };
        Update: never;
      };
      lead_stages: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          position: number;
          color: string | null;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          position: number;
          color?: string | null;
          is_default?: boolean;
        };
        Update: {
          name?: string;
          position?: number;
          color?: string | null;
          is_default?: boolean;
        };
      };
      canned_replies: {
        Row: {
          id: string;
          workspace_id: string;
          title: string;
          body: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          title: string;
          body: string;
          created_by?: string | null;
        };
        Update: {
          title?: string;
          body?: string;
          updated_at?: string;
        };
      };
      assignments: {
        Row: {
          id: string;
          workspace_id: string;
          conversation_id: string;
          assigned_to_profile_id: string | null;
          assigned_by_profile_id: string | null;
          assignment_type: "manual" | "round_robin" | "unassigned";
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          conversation_id: string;
          assigned_to_profile_id?: string | null;
          assigned_by_profile_id?: string | null;
          assignment_type: "manual" | "round_robin" | "unassigned";
        };
        Update: never;
      };
      audit_logs: {
        Row: {
          id: string;
          workspace_id: string | null;
          profile_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id?: string | null;
          profile_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
        };
        Update: never;
      };
      webhook_events: {
        Row: {
          id: string;
          provider: string;
          event_key: string;
          workspace_id: string | null;
          phone_number_id: string | null;
          event_type: string;
          payload: Json;
          processing_status: "pending" | "processed" | "failed" | "ignored";
          error_message: string | null;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider?: string;
          event_key: string;
          workspace_id?: string | null;
          phone_number_id?: string | null;
          event_type: string;
          payload: Json;
          processing_status?: "pending" | "processed" | "failed" | "ignored";
          error_message?: string | null;
          processed_at?: string | null;
        };
        Update: {
          workspace_id?: string | null;
          processing_status?: "pending" | "processed" | "failed" | "ignored";
          error_message?: string | null;
          processed_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_super_admin: {
        Args: { uid: string };
        Returns: boolean;
      };
      is_workspace_member: {
        Args: { uid: string; workspace: string };
        Returns: boolean;
      };
      workspace_role: {
        Args: { uid: string; workspace: string };
        Returns: string;
      };
      has_workspace_permission: {
        Args: { uid: string; workspace: string; permission: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];
export type WorkspaceMember = Database["public"]["Tables"]["workspace_members"]["Row"];
export type WorkspaceSettings = Database["public"]["Tables"]["workspace_settings"]["Row"];
export type WhatsappBusinessAccount = Database["public"]["Tables"]["whatsapp_business_accounts"]["Row"];
export type WhatsappPhoneNumber = Database["public"]["Tables"]["whatsapp_phone_numbers"]["Row"];
export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type MessageStatusEvent = Database["public"]["Tables"]["message_status_events"]["Row"];
export type MediaFile = Database["public"]["Tables"]["media_files"]["Row"];
export type Template = Database["public"]["Tables"]["templates"]["Row"];
export type Note = Database["public"]["Tables"]["notes"]["Row"];
export type Tag = Database["public"]["Tables"]["tags"]["Row"];
export type ContactTag = Database["public"]["Tables"]["contact_tags"]["Row"];
export type LeadStage = Database["public"]["Tables"]["lead_stages"]["Row"];
export type CannedReply = Database["public"]["Tables"]["canned_replies"]["Row"];
export type Assignment = Database["public"]["Tables"]["assignments"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];
export type WebhookEvent = Database["public"]["Tables"]["webhook_events"]["Row"];
