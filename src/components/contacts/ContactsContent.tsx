"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  ChevronDown,
} from "lucide-react";
import { formatPhoneDisplay, formatRelativeTime } from "@/lib/utils";
import type { Contact, LeadStage, Tag, Profile } from "@/types/database";

interface ContactWithRelations extends Contact {
  lead_stages: LeadStage | null;
  owner: Profile | null;
}

interface ContactsContentProps {
  workspaceId: string;
  initialContacts: ContactWithRelations[];
  leadStages: LeadStage[];
  tags: Tag[];
}

export function ContactsContent({
  initialContacts,
  leadStages,
}: ContactsContentProps) {
  const [contacts] = useState(initialContacts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const filteredContacts = contacts.filter((contact) => {
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const matches =
        contact.full_name?.toLowerCase().includes(search) ||
        contact.first_name?.toLowerCase().includes(search) ||
        contact.last_name?.toLowerCase().includes(search) ||
        contact.phone_e164?.includes(searchQuery) ||
        contact.email?.toLowerCase().includes(search);
      if (!matches) return false;
    }
    if (selectedStage && contact.lead_stage_id !== selectedStage) return false;
    return true;
  });

  const getContactName = (contact: Contact) => {
    return (
      contact.full_name ||
      `${contact.first_name || ""} ${contact.last_name || ""}`.trim() ||
      contact.phone_e164
    );
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Contacts</h2>
          <p className="text-sm text-dark-400">
            {filteredContacts.length} contacts
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg font-medium hover:bg-gold-400 transition-colors"
          data-testid="add-contact-button"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-700 border border-panel-border rounded-lg pl-10 pr-4 py-2 text-sm placeholder:text-dark-400 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
            data-testid="contact-search"
          />
        </div>
        <div className="relative">
          <select
            value={selectedStage || ""}
            onChange={(e) => setSelectedStage(e.target.value || null)}
            className="bg-dark-700 border border-panel-border rounded-lg px-4 py-2 pr-10 text-sm appearance-none cursor-pointer"
            data-testid="stage-filter"
          >
            <option value="">All Stages</option>
            {leadStages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto glass-panel rounded-xl">
        <table className="w-full">
          <thead>
            <tr className="border-b border-panel-border text-left">
              <th className="px-4 py-3 text-sm font-medium text-dark-400">
                Contact
              </th>
              <th className="px-4 py-3 text-sm font-medium text-dark-400">
                Phone
              </th>
              <th className="px-4 py-3 text-sm font-medium text-dark-400">
                Stage
              </th>
              <th className="px-4 py-3 text-sm font-medium text-dark-400">
                Owner
              </th>
              <th className="px-4 py-3 text-sm font-medium text-dark-400">
                Last Activity
              </th>
              <th className="px-4 py-3 text-sm font-medium text-dark-400"></th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-dark-400">
                  No contacts found
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="border-b border-panel-border hover:bg-panel-light transition-colors"
                  data-testid={`contact-row-${contact.id}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-dark-600 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium">
                          {getContactName(contact).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{getContactName(contact)}</p>
                        {contact.email && (
                          <p className="text-xs text-dark-400">{contact.email}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatPhoneDisplay(contact.phone_e164)}
                  </td>
                  <td className="px-4 py-3">
                    {contact.lead_stages ? (
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: `${contact.lead_stages.color || "#D4AF37"}22`,
                          color: contact.lead_stages.color || "#D4AF37",
                        }}
                      >
                        {contact.lead_stages.name}
                      </span>
                    ) : (
                      <span className="text-dark-500 text-sm">No stage</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-dark-400">
                    {contact.owner?.full_name || "Unassigned"}
                  </td>
                  <td className="px-4 py-3 text-sm text-dark-400">
                    {contact.last_message_at
                      ? formatRelativeTime(contact.last_message_at)
                      : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1 hover:bg-dark-600 rounded transition-colors">
                      <MoreVertical className="w-4 h-4 text-dark-400" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
