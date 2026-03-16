"use client";

import { Search, Inbox } from "lucide-react";
import { formatRelativeTime, truncate } from "@/lib/utils";
import type { Conversation, Contact, Profile } from "@/types/database";

interface ConversationWithContact extends Conversation {
  contacts: Contact;
  assigned_profile: Profile | null;
}

interface ConversationListProps {
  conversations: ConversationWithContact[];
  selectedId: string | undefined;
  onSelect: (conversation: ConversationWithContact) => void;
  filter: "all" | "unread" | "mine";
  onFilterChange: (filter: "all" | "unread" | "mine") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: ConversationListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-accent-error";
      case "high":
        return "border-l-accent-warning";
      default:
        return "border-l-transparent";
    }
  };

  const getContactName = (contact: Contact) => {
    return (
      contact.full_name ||
      `${contact.first_name || ""} ${contact.last_name || ""}`.trim() ||
      contact.phone_e164
    );
  };

  return (
    <div className="w-80 border-r border-panel-border bg-panel flex flex-col shrink-0">
      {/* Search & Filter */}
      <div className="p-3 border-b border-panel-border space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-dark-700 border border-panel-border rounded-lg pl-9 pr-4 py-2 text-sm placeholder:text-dark-400 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
            data-testid="conversation-search"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "unread", "mine"] as const).map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-gold-500/20 text-gold-500"
                  : "bg-dark-700 text-dark-300 hover:bg-dark-600"
              }`}
              data-testid={`filter-${f}`}
            >
              {f === "all" ? "All" : f === "unread" ? "Unread" : "Mine"}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Inbox className="w-12 h-12 text-dark-500 mb-4" />
            <p className="text-dark-400 text-sm">No conversations found</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation)}
              className={`w-full p-3 text-left border-l-4 transition-colors ${
                selectedId === conversation.id
                  ? "bg-gold-500/10 border-l-gold-500"
                  : `hover:bg-panel-light ${getPriorityColor(conversation.priority)}`
              }`}
              data-testid={`conversation-${conversation.id}`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 bg-dark-600 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium">
                    {getContactName(conversation.contacts)
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Name & Time */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium truncate">
                      {getContactName(conversation.contacts)}
                    </span>
                    <span className="text-xs text-dark-400 shrink-0">
                      {conversation.last_message_at
                        ? formatRelativeTime(conversation.last_message_at)
                        : ""}
                    </span>
                  </div>

                  {/* Preview & Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-dark-400 truncate">
                      {truncate(conversation.last_message_preview || "", 40)}
                    </p>
                    {conversation.unread_count > 0 && (
                      <span className="unread-badge shrink-0">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>

                  {/* Status & Priority */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        conversation.status === "open"
                          ? "bg-accent-success/20 text-accent-success"
                          : conversation.status === "pending"
                          ? "bg-accent-warning/20 text-accent-warning"
                          : "bg-dark-600 text-dark-400"
                      }`}
                    >
                      {conversation.status}
                    </span>
                    {conversation.template_required && (
                      <span className="px-2 py-0.5 rounded text-xs bg-accent-warning/20 text-accent-warning">
                        Template Only
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
