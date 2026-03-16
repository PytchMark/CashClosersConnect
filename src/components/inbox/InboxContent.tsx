"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ConversationList } from "./ConversationList";
import { MessagePane } from "./MessagePane";
import { ContactSidebar } from "./ContactSidebar";
import type {
  Conversation,
  Contact,
  Message,
  Template,
  CannedReply,
  WorkspaceSettings,
  Profile,
} from "@/types/database";

interface ConversationWithContact extends Conversation {
  contacts: Contact;
  assigned_profile: Profile | null;
}

interface InboxContentProps {
  workspaceId: string;
  initialConversations: ConversationWithContact[];
  templates: Template[];
  cannedReplies: CannedReply[];
  settings: WorkspaceSettings | null;
}

export function InboxContent({
  workspaceId,
  initialConversations,
  templates,
  cannedReplies,
  settings,
}: InboxContentProps) {
  const supabase = createClient();
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationWithContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "mine">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch messages when conversation is selected
  const fetchMessages = useCallback(async (conversationId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    setLoadingMessages(true);
    const { data } = await db
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    setMessages(data || []);
    setLoadingMessages(false);

    // Mark as read
    await db
      .from("conversations")
      .update({ unread_count: 0 })
      .eq("id", conversationId);
  }, [supabase]);

  // Handle conversation selection
  const handleSelectConversation = (conversation: ConversationWithContact) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const contact = conv.contacts;
      const matchesSearch =
        contact.full_name?.toLowerCase().includes(searchLower) ||
        contact.first_name?.toLowerCase().includes(searchLower) ||
        contact.last_name?.toLowerCase().includes(searchLower) ||
        contact.phone_e164?.includes(searchQuery) ||
        conv.last_message_preview?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filter === "unread" && conv.unread_count === 0) return false;
    // Note: "mine" filter would need current user ID

    return true;
  });

  // Real-time subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel(`workspace-${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;

          // Update messages if viewing this conversation
          if (selectedConversation?.id === newMessage.conversation_id) {
            setMessages((prev) => [...prev, newMessage]);
          }

          // Update conversation list
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === newMessage.conversation_id
                ? {
                    ...conv,
                    last_message_preview: newMessage.text_body || "[Media]",
                    last_message_at: newMessage.created_at,
                    unread_count:
                      selectedConversation?.id === conv.id
                        ? 0
                        : conv.unread_count + 1,
                  }
                : conv
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          const updated = payload.new as Conversation;
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === updated.id ? { ...conv, ...updated } : conv
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, workspaceId, selectedConversation?.id]);

  // Handle sending message
  const handleSendMessage = async (
    text: string,
    type: "text" | "template" = "text",
    templateId?: string
  ) => {
    if (!selectedConversation) return;

    // Check if template is required
    if (selectedConversation.template_required && type !== "template") {
      alert(
        "Customer service window has expired. You must use an approved template."
      );
      return;
    }

    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: workspaceId,
          conversation_id: selectedConversation.id,
          type,
          text,
          template_id: templateId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send message");
      }

      // Message will be added via realtime subscription
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="flex h-full">
      {/* Conversation List */}
      <ConversationList
        conversations={filteredConversations}
        selectedId={selectedConversation?.id}
        onSelect={handleSelectConversation}
        filter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Message Pane */}
      <MessagePane
        conversation={selectedConversation}
        messages={messages}
        loading={loadingMessages}
        templates={templates}
        cannedReplies={cannedReplies}
        onSendMessage={handleSendMessage}
        settings={settings}
      />

      {/* Contact Sidebar */}
      {selectedConversation && (
        <ContactSidebar
          workspaceId={workspaceId}
          contact={selectedConversation.contacts}
          conversation={selectedConversation}
        />
      )}
    </div>
  );
}
