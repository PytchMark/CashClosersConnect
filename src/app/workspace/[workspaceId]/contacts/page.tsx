import { createClient } from "@/lib/supabase/server";
import { ContactsContent } from "@/components/contacts/ContactsContent";

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const supabase = await createClient();

  // Fetch contacts
  const { data: contacts } = await supabase
    .from("contacts")
    .select(`
      *,
      lead_stages (id, name, color),
      owner:profiles!contacts_owner_profile_id_fkey (id, full_name)
    `)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(200);

  // Fetch lead stages
  const { data: leadStages } = await supabase
    .from("lead_stages")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("position", { ascending: true });

  // Fetch tags
  const { data: tags } = await supabase
    .from("tags")
    .select("*")
    .eq("workspace_id", workspaceId);

  return (
    <ContactsContent
      workspaceId={workspaceId}
      initialContacts={contacts || []}
      leadStages={leadStages || []}
      tags={tags || []}
    />
  );
}
