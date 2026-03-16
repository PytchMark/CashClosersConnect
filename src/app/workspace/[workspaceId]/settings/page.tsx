import { createClient } from "@/lib/supabase/server";
import { SettingsContent } from "@/components/settings/SettingsContent";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const supabase = await createClient();

  // Fetch workspace
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single();

  // Fetch settings
  const { data: settings } = await supabase
    .from("workspace_settings")
    .select("*")
    .eq("workspace_id", workspaceId)
    .single();

  // Fetch WhatsApp account
  const { data: waba } = await supabase
    .from("whatsapp_business_accounts")
    .select("*")
    .eq("workspace_id", workspaceId)
    .single();

  // Fetch phone numbers
  const { data: phoneNumbers } = await supabase
    .from("whatsapp_phone_numbers")
    .select("*")
    .eq("workspace_id", workspaceId);

  // Fetch members
  const { data: members } = await supabase
    .from("workspace_members")
    .select(`
      *,
      profiles (id, full_name, email, avatar_url)
    `)
    .eq("workspace_id", workspaceId);

  return (
    <SettingsContent
      workspace={workspace}
      settings={settings}
      waba={waba}
      phoneNumbers={phoneNumbers || []}
      members={members || []}
    />
  );
}
