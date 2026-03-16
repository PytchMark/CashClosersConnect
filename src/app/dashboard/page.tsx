import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/shared/DashboardContent";

export default async function DashboardPage() {
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

  // Fetch user's workspaces
  const { data: memberships } = await db
    .from("workspace_members")
    .select(`
      *,
      workspaces (*)
    `)
    .eq("profile_id", user.id)
    .eq("is_active", true);

  // For super admins, also get all workspaces
  let allWorkspaces = null;
  if (profile?.global_role === "super_admin") {
    const { data } = await db.from("workspaces").select("*").eq("status", "active");
    allWorkspaces = data;
  }

  return (
    <DashboardContent
      user={user}
      profile={profile}
      memberships={memberships || []}
      allWorkspaces={allWorkspaces}
    />
  );
}
