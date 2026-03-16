import { createClient } from "@/lib/supabase/server";
import { TemplatesContent } from "@/components/templates/TemplatesContent";

export default async function TemplatesPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const supabase = await createClient();

  // Fetch templates
  const { data: templates } = await supabase
    .from("templates")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  return (
    <TemplatesContent
      workspaceId={workspaceId}
      templates={templates || []}
    />
  );
}
