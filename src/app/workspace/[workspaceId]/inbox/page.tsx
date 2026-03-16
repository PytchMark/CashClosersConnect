import { createClient } from "@/lib/supabase/server";
import { InboxContent } from "@/components/inbox/InboxContent";

export default async function InboxPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const supabase = await createClient();

  // Fetch conversations with contact info
  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      *,
      contacts (
        id,
        phone_e164,
        first_name,
        last_name,
        full_name,
        email
      ),
      assigned_profile:profiles!conversations_assigned_profile_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq("workspace_id", workspaceId)
    .eq("is_archived", false)
    .order("last_message_at", { ascending: false })
    .limit(100);

  // Fetch templates for the workspace
  const { data: templates } = await supabase
    .from("templates")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("status", "approved");

  // Fetch canned replies
  const { data: cannedReplies } = await supabase
    .from("canned_replies")
    .select("*")
    .eq("workspace_id", workspaceId);

  // Fetch workspace settings
  const { data: settings } = await supabase
    .from("workspace_settings")
    .select("*")
    .eq("workspace_id", workspaceId)
    .single();

  return (
    <InboxContent
      workspaceId={workspaceId}
      initialConversations={conversations || []}
      templates={templates || []}
      cannedReplies={cannedReplies || []}
      settings={settings}
    />
  );
}
