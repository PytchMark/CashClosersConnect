import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const sendMessageSchema = z.object({
  workspace_id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  type: z.enum(["text", "template", "image", "audio", "document"]),
  text: z.string().optional(),
  template_id: z.string().uuid().optional(),
  media_file_id: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    // Use any to bypass strict typing issues with Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate body
    const body = await request.json();
    const validation = sendMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { workspace_id, conversation_id, type, text, template_id } =
      validation.data;

    // Verify user has access to workspace
    const { data: membership } = await db
      .from("workspace_members")
      .select("*")
      .eq("workspace_id", workspace_id)
      .eq("profile_id", user.id)
      .eq("is_active", true)
      .single();

    // Also check for super_admin
    const { data: profile } = await db
      .from("profiles")
      .select("global_role")
      .eq("id", user.id)
      .single();

    if (!membership && profile?.global_role !== "super_admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch conversation with contact info
    const { data: conversation } = await db
      .from("conversations")
      .select(
        `
        *,
        contacts (*),
        whatsapp_phone_numbers (*)
      `
      )
      .eq("id", conversation_id)
      .eq("workspace_id", workspace_id)
      .single();

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Check if template is required
    const templateRequired =
      conversation.template_required ||
      (conversation.customer_service_window_expires_at &&
        new Date(conversation.customer_service_window_expires_at) < new Date());

    if (templateRequired && type !== "template") {
      return NextResponse.json(
        {
          error: "Template required",
          message:
            "Customer service window has expired. Only approved templates can be sent.",
        },
        { status: 400 }
      );
    }

    // Get WhatsApp credentials
    const { data: waba } = await db
      .from("whatsapp_business_accounts")
      .select("*")
      .eq("workspace_id", workspace_id)
      .single();

    if (!waba) {
      return NextResponse.json(
        { error: "WhatsApp not configured for this workspace" },
        { status: 400 }
      );
    }

    // Build WhatsApp API payload
    const phoneNumberId = conversation.whatsapp_phone_numbers.phone_number_id;
    const recipientPhone = conversation.contacts.phone_e164;

    let waPayload: Record<string, unknown>;
    let messageText = text;

    if (type === "template" && template_id) {
      // Fetch template
      const { data: template } = await db
        .from("templates")
        .select("*")
        .eq("id", template_id)
        .eq("status", "approved")
        .single();

      if (!template) {
        return NextResponse.json(
          { error: "Template not found or not approved" },
          { status: 400 }
        );
      }

      waPayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientPhone.replace("+", ""),
        type: "template",
        template: {
          name: template.name,
          language: { code: template.language_code },
        },
      };
      messageText = template.body_text;
    } else {
      waPayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientPhone.replace("+", ""),
        type: "text",
        text: {
          body: text,
          preview_url: false,
        },
      };
    }

    // Create message record first (queued status)
    const { data: message, error: insertError } = await db
      .from("messages")
      .insert({
        workspace_id,
        conversation_id,
        contact_id: conversation.contacts.id,
        whatsapp_phone_number_id: conversation.whatsapp_phone_numbers.id,
        direction: "outbound",
        sender_type: "agent",
        profile_id: user.id,
        type: type === "template" ? "template" : "text",
        text_body: messageText || null,
        template_id: template_id || null,
        status: "queued",
        raw_payload: waPayload,
      })
      .select()
      .single();

    if (insertError || !message) {
      console.error("[WhatsApp Send] Failed to create message:", insertError);
      return NextResponse.json(
        { error: "Failed to create message" },
        { status: 500 }
      );
    }

    // Send to WhatsApp API
    const accessToken = process.env.WHATSAPP_SYSTEM_USER_TOKEN;
    const apiVersion = process.env.META_GRAPH_API_VERSION || "v23.0";
    const apiUrl = `${process.env.WHATSAPP_API_BASE_URL || "https://graph.facebook.com"}/${apiVersion}/${phoneNumberId}/messages`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(waPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        // Update message as failed
        await db
          .from("messages")
          .update({
            status: "failed",
            error_code: result.error?.code?.toString() || "unknown",
            error_message: result.error?.message || "Unknown error",
            failed_at: new Date().toISOString(),
            raw_payload: { ...waPayload, response: result },
          })
          .eq("id", message.id);

        return NextResponse.json(
          { error: "WhatsApp API error", details: result.error },
          { status: 400 }
        );
      }

      // Update message with meta_message_id
      const metaMessageId = result.messages?.[0]?.id;
      await db
        .from("messages")
        .update({
          meta_message_id: metaMessageId,
          status: "sent",
          sent_at: new Date().toISOString(),
          raw_payload: { ...waPayload, response: result },
        })
        .eq("id", message.id);

      // Update conversation
      await db
        .from("conversations")
        .update({
          last_message_id: message.id,
          last_message_preview: messageText?.substring(0, 100) || "[Message]",
          last_message_at: new Date().toISOString(),
        })
        .eq("id", conversation_id);

      // Update contact last_outbound_at
      await db
        .from("contacts")
        .update({
          last_outbound_at: new Date().toISOString(),
          last_message_at: new Date().toISOString(),
        })
        .eq("id", conversation.contacts.id);

      // Log audit event
      await db.from("audit_logs").insert({
        workspace_id,
        profile_id: user.id,
        action: "message_sent",
        entity_type: "message",
        entity_id: message.id,
        metadata: {
          conversation_id,
          type,
          meta_message_id: metaMessageId,
        },
      });

      return NextResponse.json({
        success: true,
        message_id: message.id,
        meta_message_id: metaMessageId,
      });
    } catch (error) {
      console.error("[WhatsApp Send] API error:", error);

      // Update message as failed
      await db
        .from("messages")
        .update({
          status: "failed",
          error_message: String(error),
          failed_at: new Date().toISOString(),
        })
        .eq("id", message.id);

      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[WhatsApp Send] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
