import { createClient } from "@/lib/supabase/server";
import { PipelineContent } from "@/components/pipeline/PipelineContent";

export default async function PipelinePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const supabase = await createClient();

  // Fetch lead stages
  const { data: leadStages } = await supabase
    .from("lead_stages")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("position", { ascending: true });

  // Fetch contacts with lead stages
  const { data: contacts } = await supabase
    .from("contacts")
    .select(`
      *,
      lead_stages (id, name, color, position),
      owner:profiles!contacts_owner_profile_id_fkey (id, full_name)
    `)
    .eq("workspace_id", workspaceId)
    .not("lead_stage_id", "is", null);

  return (
    <PipelineContent
      workspaceId={workspaceId}
      leadStages={leadStages || []}
      contacts={contacts || []}
    />
  );
}
