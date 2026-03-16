"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Tag,
  StickyNote,
  Calendar,
  ChevronDown,
  Plus,
  X,
} from "lucide-react";
import { formatRelativeTime, formatPhoneDisplay } from "@/lib/utils";
import type { Conversation, Contact, Note, Tag as TagType, LeadStage } from "@/types/database";

interface ContactSidebarProps {
  workspaceId: string;
  contact: Contact;
  conversation: Conversation;
}

export function ContactSidebar({
  workspaceId,
  contact,
}: ContactSidebarProps) {
  const supabase = createClient();
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [contactTags, setContactTags] = useState<string[]>([]);
  const [leadStages, setLeadStages] = useState<LeadStage[]>([]);
  const [newNote, setNewNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      
      // Fetch notes
      const { data: notesData } = await db
        .from("notes")
        .select("*")
        .eq("contact_id", contact.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setNotes(notesData || []);

      // Fetch all workspace tags
      const { data: tagsData } = await db
        .from("tags")
        .select("*")
        .eq("workspace_id", workspaceId);
      setTags(tagsData || []);

      // Fetch contact's tags
      const { data: contactTagsData } = await db
        .from("contact_tags")
        .select("tag_id")
        .eq("contact_id", contact.id);
      setContactTags(contactTagsData?.map((ct: { tag_id: string }) => ct.tag_id) || []);

      // Fetch lead stages
      const { data: stagesData } = await db
        .from("lead_stages")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("position", { ascending: true });
      setLeadStages(stagesData || []);
    };

    fetchData();
  }, [supabase, workspaceId, contact.id]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const { data, error } = await db
      .from("notes")
      .insert({
        workspace_id: workspaceId,
        contact_id: contact.id,
        profile_id: (await supabase.auth.getUser()).data.user?.id,
        body: newNote.trim(),
      })
      .select()
      .single();

    if (!error && data) {
      setNotes([data, ...notes]);
      setNewNote("");
      setShowNoteInput(false);
    }
  };

  const handleToggleTag = async (tagId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    
    if (contactTags.includes(tagId)) {
      // Remove tag
      await db
        .from("contact_tags")
        .delete()
        .eq("contact_id", contact.id)
        .eq("tag_id", tagId);
      setContactTags(contactTags.filter((id) => id !== tagId));
    } else {
      // Add tag
      await db.from("contact_tags").insert({
        workspace_id: workspaceId,
        contact_id: contact.id,
        tag_id: tagId,
      });
      setContactTags([...contactTags, tagId]);
    }
  };

  const handleStageChange = async (stageId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    await db
      .from("contacts")
      .update({ lead_stage_id: stageId })
      .eq("id", contact.id);
  };

  const contactName =
    contact.full_name ||
    `${contact.first_name || ""} ${contact.last_name || ""}`.trim() ||
    contact.phone_e164;

  return (
    <div className="w-80 border-l border-panel-border bg-panel overflow-y-auto shrink-0">
      {/* Contact Header */}
      <div className="p-4 border-b border-panel-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 bg-dark-600 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold">
              {contactName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{contactName}</h3>
            <p className="text-sm text-dark-400">{contact.source || "Unknown source"}</p>
          </div>
        </div>

        {/* Lead Stage */}
        <div className="relative">
          <label className="text-xs text-dark-400 mb-1 block">Lead Stage</label>
          <select
            value={contact.lead_stage_id || ""}
            onChange={(e) => handleStageChange(e.target.value)}
            className="w-full bg-dark-700 border border-panel-border rounded-lg px-3 py-2 text-sm appearance-none cursor-pointer hover:border-gold-500 transition-colors"
            data-testid="lead-stage-select"
          >
            <option value="">No stage</option>
            {leadStages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-8 w-4 h-4 text-dark-400 pointer-events-none" />
        </div>
      </div>

      {/* Contact Details */}
      <div className="p-4 border-b border-panel-border space-y-3">
        <h4 className="text-sm font-medium text-dark-300 flex items-center gap-2">
          <User className="w-4 h-4" />
          Contact Details
        </h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-dark-400" />
            <span>{formatPhoneDisplay(contact.phone_e164)}</span>
          </div>
          {contact.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-dark-400" />
              <span>{contact.email}</span>
            </div>
          )}
          {(contact.city || contact.country) && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-dark-400" />
              <span>
                {[contact.city, contact.country].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Activity */}
      <div className="p-4 border-b border-panel-border space-y-3">
        <h4 className="text-sm font-medium text-dark-300 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Activity
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-dark-400 text-xs">Last Inbound</p>
            <p>
              {contact.last_inbound_at
                ? formatRelativeTime(contact.last_inbound_at)
                : "Never"}
            </p>
          </div>
          <div>
            <p className="text-dark-400 text-xs">Last Outbound</p>
            <p>
              {contact.last_outbound_at
                ? formatRelativeTime(contact.last_outbound_at)
                : "Never"}
            </p>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="p-4 border-b border-panel-border">
        <h4 className="text-sm font-medium text-dark-300 flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4" />
          Tags
        </h4>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const isSelected = contactTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => handleToggleTag(tag.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-opacity-100"
                    : "bg-opacity-20 hover:bg-opacity-40"
                }`}
                style={{
                  backgroundColor: isSelected
                    ? tag.color || "#D4AF37"
                    : `${tag.color || "#D4AF37"}33`,
                  color: isSelected ? "#000" : tag.color || "#D4AF37",
                }}
                data-testid={`tag-${tag.id}`}
              >
                {tag.name}
                {isSelected && <X className="w-3 h-3 ml-1 inline" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-dark-300 flex items-center gap-2">
            <StickyNote className="w-4 h-4" />
            Notes
          </h4>
          <button
            onClick={() => setShowNoteInput(!showNoteInput)}
            className="p-1 hover:bg-dark-700 rounded transition-colors"
            data-testid="add-note-button"
          >
            <Plus className="w-4 h-4 text-gold-500" />
          </button>
        </div>

        {showNoteInput && (
          <div className="mb-3">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full bg-dark-700 border border-panel-border rounded-lg px-3 py-2 text-sm placeholder:text-dark-400 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors resize-none"
              rows={3}
              data-testid="note-input"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowNoteInput(false)}
                className="px-3 py-1.5 text-sm text-dark-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                className="px-3 py-1.5 bg-gold-500 text-black text-sm font-medium rounded-lg hover:bg-gold-400 transition-colors"
                data-testid="save-note-button"
              >
                Save
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {notes.length === 0 ? (
            <p className="text-sm text-dark-500 text-center py-4">
              No notes yet
            </p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-dark-700 rounded-lg p-3 text-sm"
                data-testid={`note-${note.id}`}
              >
                <p className="whitespace-pre-wrap mb-2">{note.body}</p>
                <p className="text-xs text-dark-500">
                  {formatRelativeTime(note.created_at)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
