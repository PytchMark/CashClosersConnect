"use client";

import { useState } from "react";
import {
  Building2,
  Phone,
  Users,
  MessageSquare,
  Shield,
  Palette,
  ChevronRight,
} from "lucide-react";
import type {
  Workspace,
  WorkspaceSettings,
  WhatsappBusinessAccount,
  WhatsappPhoneNumber,
  WorkspaceMember,
  Profile,
} from "@/types/database";

interface MemberWithProfile extends WorkspaceMember {
  profiles: Profile;
}

interface SettingsContentProps {
  workspace: Workspace | null;
  settings: WorkspaceSettings | null;
  waba: WhatsappBusinessAccount | null;
  phoneNumbers: WhatsappPhoneNumber[];
  members: MemberWithProfile[];
}

type Tab = "general" | "whatsapp" | "members" | "messaging" | "security";

export function SettingsContent({
  workspace,
  settings,
  waba,
  phoneNumbers,
  members,
}: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState<Tab>("general");

  if (!workspace) {
    return (
      <div className="p-6">
        <p className="text-dark-400">Workspace not found</p>
      </div>
    );
  }

  const tabs = [
    { id: "general" as Tab, label: "General", icon: Building2 },
    { id: "whatsapp" as Tab, label: "WhatsApp", icon: Phone },
    { id: "members" as Tab, label: "Team Members", icon: Users },
    { id: "messaging" as Tab, label: "Messaging", icon: MessageSquare },
    { id: "security" as Tab, label: "Security", icon: Shield },
  ];

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-panel-border bg-panel p-4">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-gold-500/20 text-gold-500"
                  : "text-dark-300 hover:bg-panel-light hover:text-white"
              }`}
              data-testid={`settings-tab-${tab.id}`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "general" && (
          <GeneralSettings workspace={workspace} />
        )}
        {activeTab === "whatsapp" && (
          <WhatsAppSettings waba={waba} phoneNumbers={phoneNumbers} />
        )}
        {activeTab === "members" && (
          <MembersSettings members={members} />
        )}
        {activeTab === "messaging" && (
          <MessagingSettings settings={settings} />
        )}
        {activeTab === "security" && (
          <SecuritySettings settings={settings} />
        )}
      </div>
    </div>
  );
}

function GeneralSettings({ workspace }: { workspace: Workspace }) {
  return (
    <div className="max-w-2xl">
      <h3 className="text-xl font-semibold mb-6">General Settings</h3>

      <div className="space-y-6">
        <div className="glass-panel rounded-xl p-6">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gold-500" />
            Workspace Information
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-dark-400 block mb-1">Name</label>
              <input
                type="text"
                defaultValue={workspace.name}
                className="w-full bg-dark-700 border border-panel-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-dark-400 block mb-1">Slug</label>
              <input
                type="text"
                defaultValue={workspace.slug}
                className="w-full bg-dark-700 border border-panel-border rounded-lg px-3 py-2 text-sm"
                disabled
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm text-dark-400 block mb-1">Company Name</label>
              <input
                type="text"
                defaultValue={workspace.company_name}
                className="w-full bg-dark-700 border border-panel-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-gold-500" />
            Branding
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-dark-400 block mb-1">Brand Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  defaultValue={workspace.brand_color || "#D4AF37"}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  defaultValue={workspace.brand_color || "#D4AF37"}
                  className="flex-1 bg-dark-700 border border-panel-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-dark-400 block mb-1">Timezone</label>
              <input
                type="text"
                defaultValue={workspace.timezone}
                className="w-full bg-dark-700 border border-panel-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6">
          <h4 className="font-medium mb-4">Client Contact</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-dark-400 block mb-1">Contact Name</label>
              <input
                type="text"
                defaultValue={workspace.client_contact_name || ""}
                className="w-full bg-dark-700 border border-panel-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-dark-400 block mb-1">Contact Email</label>
              <input
                type="email"
                defaultValue={workspace.client_contact_email || ""}
                className="w-full bg-dark-700 border border-panel-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <button className="px-6 py-2 bg-gold-500 text-black rounded-lg font-medium hover:bg-gold-400 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}

function WhatsAppSettings({
  waba,
  phoneNumbers,
}: {
  waba: WhatsappBusinessAccount | null;
  phoneNumbers: WhatsappPhoneNumber[];
}) {
  return (
    <div className="max-w-2xl">
      <h3 className="text-xl font-semibold mb-6">WhatsApp Configuration</h3>

      <div className="space-y-6">
        <div className="glass-panel rounded-xl p-6">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-gold-500" />
            Business Account
          </h4>
          {waba ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-dark-400">WABA ID</span>
                <span className="font-mono text-sm">{waba.waba_id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Status</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  waba.status === "connected"
                    ? "bg-accent-success/20 text-accent-success"
                    : "bg-accent-warning/20 text-accent-warning"
                }`}>
                  {waba.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Access Mode</span>
                <span>{waba.access_mode}</span>
              </div>
            </div>
          ) : (
            <p className="text-dark-400">No WhatsApp Business Account connected</p>
          )}
        </div>

        <div className="glass-panel rounded-xl p-6">
          <h4 className="font-medium mb-4">Phone Numbers</h4>
          {phoneNumbers.length > 0 ? (
            <div className="space-y-3">
              {phoneNumbers.map((phone) => (
                <div
                  key={phone.id}
                  className="flex items-center justify-between p-3 bg-dark-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{phone.display_phone_number}</p>
                    <p className="text-xs text-dark-400">
                      {phone.verified_name || "Not verified"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {phone.is_primary && (
                      <span className="px-2 py-1 bg-gold-500/20 text-gold-500 rounded text-xs">
                        Primary
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      phone.status === "active"
                        ? "bg-accent-success/20 text-accent-success"
                        : "bg-dark-600 text-dark-400"
                    }`}>
                      {phone.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-dark-400">No phone numbers configured</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MembersSettings({ members }: { members: MemberWithProfile[] }) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "workspace_admin":
        return "bg-gold-500/20 text-gold-500";
      case "agent":
        return "bg-accent-info/20 text-accent-info";
      case "client_viewer":
        return "bg-dark-600 text-dark-400";
      default:
        return "bg-dark-600 text-dark-400";
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Team Members</h3>
        <button className="px-4 py-2 bg-gold-500 text-black rounded-lg font-medium hover:bg-gold-400 transition-colors">
          Invite Member
        </button>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="glass-panel rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-dark-600 rounded-full flex items-center justify-center">
                <span className="font-medium">
                  {member.profiles.full_name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div>
                <p className="font-medium">{member.profiles.full_name}</p>
                <p className="text-sm text-dark-400">{member.profiles.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                {member.role.replace("_", " ")}
              </span>
              <button className="p-1 hover:bg-dark-700 rounded transition-colors">
                <ChevronRight className="w-5 h-5 text-dark-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagingSettings({ settings }: { settings: WorkspaceSettings | null }) {
  return (
    <div className="max-w-2xl">
      <h3 className="text-xl font-semibold mb-6">Messaging Settings</h3>

      <div className="space-y-6">
        <div className="glass-panel rounded-xl p-6">
          <h4 className="font-medium mb-4">Service Window</h4>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-dark-400 block mb-1">
                Customer Service Window (hours)
              </label>
              <input
                type="number"
                defaultValue={settings?.service_window_hours || 24}
                className="w-32 bg-dark-700 border border-panel-border rounded-lg px-3 py-2 text-sm"
              />
              <p className="text-xs text-dark-500 mt-1">
                Free-form messaging is allowed within this window after customer&apos;s last message
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6">
          <h4 className="font-medium mb-4">Features</h4>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium">Voice Notes</p>
                <p className="text-sm text-dark-400">Enable sending and receiving voice notes</p>
              </div>
              <input
                type="checkbox"
                defaultChecked={settings?.voice_notes_enabled}
                className="w-5 h-5 accent-gold-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium">Templates</p>
                <p className="text-sm text-dark-400">Enable message templates</p>
              </div>
              <input
                type="checkbox"
                defaultChecked={settings?.templates_enabled}
                className="w-5 h-5 accent-gold-500"
              />
            </label>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6">
          <h4 className="font-medium mb-4">Assignment</h4>
          <div>
            <label className="text-sm text-dark-400 block mb-1">Auto-assign Mode</label>
            <select
              defaultValue={settings?.auto_assign_mode || "manual"}
              className="w-48 bg-dark-700 border border-panel-border rounded-lg px-3 py-2 text-sm"
            >
              <option value="manual">Manual</option>
              <option value="round_robin">Round Robin</option>
            </select>
          </div>
        </div>

        <button className="px-6 py-2 bg-gold-500 text-black rounded-lg font-medium hover:bg-gold-400 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}

function SecuritySettings({ settings }: { settings: WorkspaceSettings | null }) {
  return (
    <div className="max-w-2xl">
      <h3 className="text-xl font-semibold mb-6">Security & Privacy</h3>

      <div className="space-y-6">
        <div className="glass-panel rounded-xl p-6">
          <h4 className="font-medium mb-4">Client Portal</h4>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium">Enable Client Portal</p>
              <p className="text-sm text-dark-400">
                Allow clients to view their conversations in read-only mode
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked={settings?.client_portal_enabled}
              className="w-5 h-5 accent-gold-500"
            />
          </label>
        </div>

        <div className="glass-panel rounded-xl p-6">
          <h4 className="font-medium mb-4">Audit Logs</h4>
          <div>
            <label className="text-sm text-dark-400 block mb-1">
              Retention Period (days)
            </label>
            <input
              type="number"
              defaultValue={settings?.audit_log_retention_days || 180}
              className="w-32 bg-dark-700 border border-panel-border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button className="px-6 py-2 bg-gold-500 text-black rounded-lg font-medium hover:bg-gold-400 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}
