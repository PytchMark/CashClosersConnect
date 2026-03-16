import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { WorkspaceLayout } from "@/components/shared/WorkspaceLayout";

export default async function WorkspaceLayoutWrapper({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await db
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch workspace
  const { data: workspace } = await db
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single();

  if (!workspace) {
    notFound();
  }

  // Check if user has access (super_admin or workspace member)
  const isSuperAdmin = profile?.global_role === "super_admin";

  if (!isSuperAdmin) {
    const { data: membership } = await db
      .from("workspace_members")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("profile_id", user.id)
      .eq("is_active", true)
      .single();

    if (!membership) {
      redirect("/dashboard");
    }
  }

  // Fetch workspace settings
  const { data: settings } = await db
    .from("workspace_settings")
    .select("*")
    .eq("workspace_id", workspaceId)
    .single();

  return (
    <WorkspaceLayout
      workspace={workspace}
      settings={settings}
      profile={profile}
      user={user}
    >
      {children}
    </WorkspaceLayout>
  );
}
