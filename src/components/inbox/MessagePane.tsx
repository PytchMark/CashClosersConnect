"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  Mic,
  FileText,
  Smile,
  AlertTriangle,
  Check,
  CheckCheck,
  Clock,
  X,
  Play,
  Pause,
} from "lucide-react";
import { formatRelativeTime, isWithinServiceWindow } from "@/lib/utils";
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

interface MessagePaneProps {
  conversation: ConversationWithContact | null;
  messages: Message[];
  loading: boolean;
  templates: Template[];
  cannedReplies: CannedReply[];
  onSendMessage: (
    text: string,
    type?: "text" | "template",
    templateId?: string
  ) => void;
  settings: WorkspaceSettings | null;
}

export function MessagePane({
  conversation,
  messages,
  loading,
  templates,
  cannedReplies,
  onSendMessage,
}: MessagePaneProps) {
  const [text, setText] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCannedReplies, setShowCannedReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText("");
  };

  const handleCannedReply = (reply: CannedReply) => {
    setText(reply.body);
    setShowCannedReplies(false);
  };

  const handleTemplate = (template: Template) => {
    onSendMessage(template.body_text || "", "template", template.id);
    setShowTemplates(false);
  };

  const isTemplateRequired =
    conversation?.template_required ||
    !isWithinServiceWindow(
      conversation?.customer_service_window_expires_at
    );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="w-3.5 h-3.5 text-dark-400" />;
      case "delivered":
        return <CheckCheck className="w-3.5 h-3.5 text-dark-400" />;
      case "read":
      case "played":
        return <CheckCheck className="w-3.5 h-3.5 text-accent-info" />;
      case "failed":
        return <X className="w-3.5 h-3.5 text-accent-error" />;
      case "queued":
        return <Clock className="w-3.5 h-3.5 text-dark-500" />;
      default:
        return null;
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-dark-800 text-center p-8">
        <div className="w-20 h-20 bg-dark-700 rounded-full flex items-center justify-center mb-4">
          <Send className="w-10 h-10 text-dark-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">Select a Conversation</h3>
        <p className="text-dark-400 max-w-sm">
          Choose a conversation from the list to start messaging
        </p>
      </div>
    );
  }

  const contactName =
    conversation.contacts.full_name ||
    `${conversation.contacts.first_name || ""} ${conversation.contacts.last_name || ""}`.trim() ||
    conversation.contacts.phone_e164;

  return (
    <div className="flex-1 flex flex-col bg-dark-800 min-w-0">
      {/* Header */}
      <div className="h-16 border-b border-panel-border px-4 flex items-center justify-between bg-panel shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-dark-600 rounded-full flex items-center justify-center">
            <span className="font-medium">
              {contactName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-medium">{contactName}</h3>
            <p className="text-xs text-dark-400">
              {conversation.contacts.phone_e164}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {conversation.assigned_profile && (
            <span className="text-xs text-dark-400">
              Assigned to {conversation.assigned_profile.full_name}
            </span>
          )}
        </div>
      </div>

      {/* Template Warning */}
      {isTemplateRequired && (
        <div className="template-warning mx-4 mt-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-medium text-sm">Template Required</p>
            <p className="text-xs opacity-80">
              The 24-hour service window has expired. You can only send approved
              message templates.
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-dark-400">No messages yet</p>
            <p className="text-sm text-dark-500">
              Start the conversation by sending a message
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.direction === "outbound" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] ${
                  message.direction === "outbound"
                    ? "message-outbound"
                    : "message-inbound"
                } px-4 py-2.5`}
              >
                {/* Voice Note */}
                {(message.type === "audio" || message.type === "voice") && (
                  <VoiceNotePlayer />
                )}

                {/* Text */}
                {message.type === "text" && (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.text_body}
                  </p>
                )}

                {/* Template */}
                {message.type === "template" && (
                  <div>
                    <span className="text-xs opacity-60 block mb-1">
                      [Template]
                    </span>
                    <p className="text-sm whitespace-pre-wrap">
                      {message.text_body}
                    </p>
                  </div>
                )}

                {/* Image */}
                {message.type === "image" && (
                  <div>
                    <div className="w-48 h-48 bg-dark-600 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-dark-400">[Image]</span>
                    </div>
                    {message.caption && (
                      <p className="text-sm mt-2">{message.caption}</p>
                    )}
                  </div>
                )}

                {/* Document */}
                {message.type === "document" && (
                  <div className="flex items-center gap-3 p-2 bg-black/20 rounded-lg">
                    <FileText className="w-8 h-8" />
                    <div className="text-sm">
                      <p className="font-medium">Document</p>
                      {message.caption && (
                        <p className="text-xs opacity-60">{message.caption}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div
                  className={`flex items-center gap-1 mt-1 ${
                    message.direction === "outbound"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <span className="whatsapp-timestamp">
                    {formatRelativeTime(message.created_at)}
                  </span>
                  {message.direction === "outbound" && (
                    <span className="whatsapp-status-icon">
                      {getStatusIcon(message.status)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-panel-border p-4 bg-panel shrink-0">
        {/* Quick Actions */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setShowCannedReplies(!showCannedReplies)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showCannedReplies
                ? "bg-gold-500/20 text-gold-500"
                : "bg-dark-700 text-dark-300 hover:bg-dark-600"
            }`}
            data-testid="canned-replies-toggle"
          >
            Quick Replies
          </button>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showTemplates
                ? "bg-gold-500/20 text-gold-500"
                : "bg-dark-700 text-dark-300 hover:bg-dark-600"
            }`}
            data-testid="templates-toggle"
          >
            Templates
          </button>
        </div>

        {/* Canned Replies Dropdown */}
        {showCannedReplies && cannedReplies.length > 0 && (
          <div className="mb-3 bg-dark-700 rounded-lg p-2 max-h-40 overflow-y-auto">
            {cannedReplies.map((reply) => (
              <button
                key={reply.id}
                onClick={() => handleCannedReply(reply)}
                className="w-full text-left p-2 hover:bg-dark-600 rounded-lg transition-colors"
                data-testid={`canned-reply-${reply.id}`}
              >
                <p className="text-sm font-medium">{reply.title}</p>
                <p className="text-xs text-dark-400 truncate">{reply.body}</p>
              </button>
            ))}
          </div>
        )}

        {/* Templates Dropdown */}
        {showTemplates && templates.length > 0 && (
          <div className="mb-3 bg-dark-700 rounded-lg p-2 max-h-40 overflow-y-auto">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplate(template)}
                className="w-full text-left p-2 hover:bg-dark-600 rounded-lg transition-colors"
                data-testid={`template-${template.id}`}
              >
                <p className="text-sm font-medium">{template.name}</p>
                <p className="text-xs text-dark-400 truncate">
                  {template.body_text}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <button
            type="button"
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            data-testid="attach-button"
          >
            <Paperclip className="w-5 h-5 text-dark-400" />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                isTemplateRequired
                  ? "Select a template to send..."
                  : "Type a message..."
              }
              disabled={isTemplateRequired}
              className="w-full bg-dark-700 border border-panel-border rounded-xl px-4 py-3 pr-10 text-sm placeholder:text-dark-400 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              data-testid="message-input"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
          <button
            type="button"
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            data-testid="voice-note-button"
          >
            <Mic className="w-5 h-5 text-dark-400" />
          </button>
          <button
            type="submit"
            disabled={!text.trim() || isTemplateRequired}
            className="p-3 bg-gold-500 hover:bg-gold-400 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="send-button"
          >
            <Send className="w-5 h-5 text-black" />
          </button>
        </form>
      </div>
    </div>
  );
}

// Voice Note Player Component
function VoiceNotePlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

  // Simulated waveform bars
  const waveformBars = Array.from({ length: 30 }, () => ({
    height: Math.random() * 24 + 8,
  }));

  return (
    <div className="voice-note">
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="voice-note-play"
        data-testid="voice-play-button"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>
      <div className="flex-1">
        <div className="audio-waveform">
          {waveformBars.map((bar, i) => (
            <div
              key={i}
              className="audio-waveform-bar"
              style={{
                height: `${bar.height}px`,
                opacity: 0.5,
              }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-dark-400">0:00</span>
          <span className="text-xs text-dark-400">0:30</span>
        </div>
      </div>
    </div>
  );
}
