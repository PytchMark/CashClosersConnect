"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Building2,
  ChevronRight,
  Plus,
  Crown,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Profile, Workspace, WorkspaceMember } from "@/types/database";

interface DashboardContentProps {
  user: User;
  profile: Profile | null;
  memberships: (WorkspaceMember & { workspaces: Workspace })[];
  allWorkspaces: Workspace[] | null;
}

export function DashboardContent({
  user,
  profile,
  memberships,
  allWorkspaces,
}: DashboardContentProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isSuperAdmin = profile?.global_role === "super_admin";
  const workspaces = isSuperAdmin
    ? allWorkspaces || []
    : memberships.map((m) => m.workspaces);

  return (
    <div className="min-h-screen bg-dark-800">
      {/* Header */}
      <header className="border-b border-panel-border bg-panel sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-black">CC</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold">Cash Closers CRM</h1>
                <p className="text-xs text-dark-400">Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isSuperAdmin && (
                <span className="flex items-center gap-1 px-3 py-1 bg-gold-500/20 text-gold-500 rounded-full text-xs font-medium">
                  <Crown className="w-3 h-3" />
                  Super Admin
                </span>
              )}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">
                    {profile?.full_name || user.email}
                  </p>
                  <p className="text-xs text-dark-400">{user.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 hover:bg-panel-light rounded-lg transition-colors"
                  data-testid="sign-out-button"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5 text-dark-300 hover:text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {profile?.full_name?.split(" ")[0] || "Agent"}
          </h2>
          <p className="text-dark-400">
            Select a workspace to start managing conversations
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass-panel rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold-500/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-gold-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{workspaces.length}</p>
                <p className="text-sm text-dark-400">Workspaces</p>
              </div>
            </div>
          </div>
          <div className="glass-panel rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-success/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-accent-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">--</p>
                <p className="text-sm text-dark-400">Open Conversations</p>
              </div>
            </div>
          </div>
          <div className="glass-panel rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-info/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-accent-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">--</p>
                <p className="text-sm text-dark-400">Total Contacts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Workspaces Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Your Workspaces</h3>
            {isSuperAdmin && (
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg font-medium hover:bg-gold-400 transition-colors"
                data-testid="create-workspace-button"
              >
                <Plus className="w-4 h-4" />
                New Workspace
              </button>
            )}
          </div>

          {workspaces.length === 0 ? (
            <div className="glass-panel rounded-xl p-12 text-center">
              <Building2 className="w-12 h-12 text-dark-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Workspaces</h3>
              <p className="text-dark-400 mb-4">
                You haven&apos;t been assigned to any workspaces yet.
              </p>
              <p className="text-sm text-dark-500">
                Contact your administrator to get access.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaces.map((workspace) => (
                <Link
                  key={workspace.id}
                  href={`/workspace/${workspace.id}/inbox`}
                  className="glass-panel rounded-xl p-6 hover:border-gold-500 transition-all duration-300 group"
                  data-testid={`workspace-card-${workspace.slug}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-black font-bold text-lg"
                      style={{
                        background:
                          workspace.brand_color ||
                          "linear-gradient(135deg, #D4AF37, #F5C842)",
                      }}
                    >
                      {workspace.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        workspace.status === "active"
                          ? "bg-accent-success/20 text-accent-success"
                          : workspace.status === "paused"
                          ? "bg-accent-warning/20 text-accent-warning"
                          : "bg-dark-500/20 text-dark-300"
                      }`}
                    >
                      {workspace.status}
                    </span>
                  </div>
                  <h4 className="font-semibold mb-1 group-hover:text-gold-500 transition-colors">
                    {workspace.name}
                  </h4>
                  <p className="text-sm text-dark-400 mb-4">
                    {workspace.company_name}
                  </p>
                  <div className="flex items-center justify-between text-xs text-dark-500">
                    <span>{workspace.timezone}</span>
                    <ChevronRight className="w-4 h-4 group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/settings"
            className="glass-panel rounded-xl p-6 flex items-center gap-4 hover:border-gold-500 transition-all group"
            data-testid="account-settings-link"
          >
            <div className="w-12 h-12 bg-dark-600 rounded-lg flex items-center justify-center group-hover:bg-gold-500/20 transition-colors">
              <Settings className="w-6 h-6 text-dark-300 group-hover:text-gold-500" />
            </div>
            <div>
              <h4 className="font-medium group-hover:text-gold-500 transition-colors">
                Account Settings
              </h4>
              <p className="text-sm text-dark-400">
                Manage your profile and preferences
              </p>
            </div>
          </Link>
          {isSuperAdmin && (
            <Link
              href="/admin"
              className="glass-panel rounded-xl p-6 flex items-center gap-4 hover:border-gold-500 transition-all group"
              data-testid="admin-panel-link"
            >
              <div className="w-12 h-12 bg-dark-600 rounded-lg flex items-center justify-center group-hover:bg-gold-500/20 transition-colors">
                <Crown className="w-6 h-6 text-dark-300 group-hover:text-gold-500" />
              </div>
              <div>
                <h4 className="font-medium group-hover:text-gold-500 transition-colors">
                  Admin Panel
                </h4>
                <p className="text-sm text-dark-400">
                  Manage users, workspaces, and system settings
                </p>
              </div>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
