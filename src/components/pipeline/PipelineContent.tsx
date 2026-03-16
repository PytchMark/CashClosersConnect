"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, GripVertical } from "lucide-react";
import { formatPhoneDisplay } from "@/lib/utils";
import type { Contact, LeadStage, Profile } from "@/types/database";

interface ContactWithRelations extends Contact {
  lead_stages: LeadStage | null;
  owner: Profile | null;
}

interface PipelineContentProps {
  workspaceId: string;
  leadStages: LeadStage[];
  contacts: ContactWithRelations[];
}

export function PipelineContent({
  workspaceId,
  leadStages,
  contacts: initialContacts,
}: PipelineContentProps) {
  const supabase = createClient();
  const [contacts, setContacts] = useState(initialContacts);
  const [draggedContact, setDraggedContact] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const getContactsByStage = (stageId: string) => {
    return contacts.filter((c) => c.lead_stage_id === stageId);
  };

  const getContactName = (contact: Contact) => {
    return (
      contact.full_name ||
      `${contact.first_name || ""} ${contact.last_name || ""}`.trim() ||
      contact.phone_e164
    );
  };

  const handleDragStart = (contactId: string) => {
    setDraggedContact(contactId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (stageId: string) => {
    if (!draggedContact) return;

    // Update locally first (optimistic)
    setContacts((prev) =>
      prev.map((c) =>
        c.id === draggedContact
          ? {
              ...c,
              lead_stage_id: stageId,
              lead_stages: leadStages.find((s) => s.id === stageId) || null,
            }
          : c
      )
    );

    // Update in database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    await db
      .from("contacts")
      .update({ lead_stage_id: stageId })
      .eq("id", draggedContact);

    // Log audit
    await db.from("audit_logs").insert({
      workspace_id: workspaceId,
      action: "lead_stage_changed",
      entity_type: "contact",
      entity_id: draggedContact,
      metadata: { new_stage_id: stageId },
    });

    setDraggedContact(null);
    setDragOverStage(null);
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Pipeline</h2>
          <p className="text-sm text-dark-400">
            {contacts.length} contacts in pipeline
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg font-medium hover:bg-gold-400 transition-colors"
          data-testid="add-stage-button"
        >
          <Plus className="w-4 h-4" />
          Add Stage
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {leadStages.map((stage) => {
            const stageContacts = getContactsByStage(stage.id);
            return (
              <div
                key={stage.id}
                className={`kanban-column w-72 flex flex-col ${
                  dragOverStage === stage.id ? "ring-2 ring-gold-500" : ""
                }`}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(stage.id)}
                data-testid={`stage-column-${stage.id}`}
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color || "#D4AF37" }}
                    />
                    <h3 className="font-medium">{stage.name}</h3>
                    <span className="text-xs text-dark-400 bg-dark-700 px-2 py-0.5 rounded-full">
                      {stageContacts.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {stageContacts.map((contact) => (
                    <div
                      key={contact.id}
                      draggable
                      onDragStart={() => handleDragStart(contact.id)}
                      className={`kanban-card ${
                        draggedContact === contact.id ? "opacity-50" : ""
                      }`}
                      data-testid={`pipeline-card-${contact.id}`}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-4 h-4 text-dark-500 shrink-0 mt-0.5 cursor-grab" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {getContactName(contact)}
                          </p>
                          <p className="text-xs text-dark-400 truncate">
                            {formatPhoneDisplay(contact.phone_e164)}
                          </p>
                          {contact.owner && (
                            <p className="text-xs text-dark-500 mt-1">
                              {contact.owner.full_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {stageContacts.length === 0 && (
                    <div className="text-center py-8 text-dark-500 text-sm">
                      No contacts
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add Stage Column */}
          <div className="w-72 border-2 border-dashed border-panel-border rounded-xl flex items-center justify-center">
            <button className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors">
              <Plus className="w-5 h-5" />
              <span>Add Stage</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
