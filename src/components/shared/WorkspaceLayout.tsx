"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  MessageSquare,
  Users,
  Kanban,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  Phone,
  Bell,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Profile, Workspace, WorkspaceSettings } from "@/types/database";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  workspace: Workspace;
  settings: WorkspaceSettings | null;
  profile: Profile | null;
  user: User;
}

export function WorkspaceLayout({
  children,
  workspace,
  profile,
  user,
}: WorkspaceLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    {
      href: `/workspace/${workspace.id}/inbox`,
      icon: MessageSquare,
      label: "Inbox",
    },
    {
      href: `/workspace/${workspace.id}/contacts`,
      icon: Users,
      label: "Contacts",
    },
    {
      href: `/workspace/${workspace.id}/pipeline`,
      icon: Kanban,
      label: "Pipeline",
    },
    {
      href: `/workspace/${workspace.id}/templates`,
      icon: FileText,
      label: "Templates",
    },
    {
      href: `/workspace/${workspace.id}/settings`,
      icon: Settings,
      label: "Settings",
    },
  ];

  return (
    <div className="flex h-screen bg-dark-800 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-panel border-r border-panel-border flex flex-col shrink-0">
        {/* Workspace Header */}
        <div className="p-4 border-b border-panel-border">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-dark-400 hover:text-white text-sm mb-3 transition-colors"
            data-testid="back-to-dashboard"
          >
            <ChevronLeft className="w-4 h-4" />
            All Workspaces
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-black font-bold"
              style={{
                background:
                  workspace.brand_color ||
                  "linear-gradient(135deg, #D4AF37, #F5C842)",
              }}
            >
              {workspace.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold truncate">{workspace.name}</h2>
              <p className="text-xs text-dark-400 truncate">
                {workspace.company_name}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-gold-500/20 text-gold-500"
                    : "text-dark-300 hover:bg-panel-light hover:text-white"
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* WhatsApp Phone Number */}
        <div className="p-4 border-t border-panel-border">
          <div className="glass-panel rounded-lg p-3">
            <div className="flex items-center gap-2 text-dark-400 text-xs mb-1">
              <Phone className="w-3 h-3" />
              <span>WhatsApp Number</span>
            </div>
            <p className="text-sm font-medium">+1 876 XXX XXXX</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-accent-success/20 text-accent-success rounded text-xs">
              Connected
            </span>
          </div>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-panel-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-dark-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {(profile?.full_name || user.email || "U").charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {profile?.full_name || user.email}
              </p>
              <p className="text-xs text-dark-400 truncate">Agent</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-panel-light rounded-lg transition-colors"
              data-testid="sidebar-sign-out"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-dark-400 hover:text-white" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-panel-border bg-panel flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold">
              {navItems.find((item) => pathname.startsWith(item.href))?.label ||
                "Workspace"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-panel-light rounded-lg transition-colors relative"
              data-testid="notifications-button"
            >
              <Bell className="w-5 h-5 text-dark-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent-error rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </main>
    </div>
  );
}
