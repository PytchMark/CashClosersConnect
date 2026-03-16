import { NextRequest, NextResponse } from "next/server";

/**
 * WhatsApp Webhook Verification (GET)
 * Meta sends a GET request to verify webhook endpoint
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[WhatsApp Webhook] Verification successful");
    return new NextResponse(challenge, { status: 200 });
  }

  console.log("[WhatsApp Webhook] Verification failed", { mode, token });
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/**
 * WhatsApp Webhook Handler (POST)
 * Receives inbound messages and status updates
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Acknowledge receipt immediately (Meta requires 200 within 20 seconds)
    // Process asynchronously after acknowledging
    processWebhookAsync(payload).catch(console.error);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[WhatsApp Webhook] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * Process webhook payload asynchronously
 */
async function processWebhookAsync(payload: Record<string, unknown>) {
  const { createServerClient } = await import("@supabase/ssr");
  
  // Create service client directly to bypass RLS
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );

  // Validate payload structure
  if (payload.object !== "whatsapp_business_account") {
    console.log("[WhatsApp Webhook] Ignoring non-WhatsApp event");
    return;
  }

  const entries = payload.entry as Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: { phone_number_id: string; display_phone_number: string };
        messages?: Array<Record<string, unknown>>;
        statuses?: Array<Record<string, unknown>>;
        contacts?: Array<{ wa_id: string; profile: { name: string } }>;
      };
      field: string;
    }>;
  }>;

  if (!entries?.length) return;

  for (const entry of entries) {
    for (const change of entry.changes) {
      if (change.field !== "messages") continue;

      const value = change.value;
      const phoneNumberId = value.metadata?.phone_number_id;

      if (!phoneNumberId) {
        console.log("[WhatsApp Webhook] No phone_number_id in payload");
        continue;
      }

      // Generate event key for idempotency
      const eventKey = generateEventKey(payload);

      // Check if event already processed
      const { data: existingEvent } = await supabase
        .from("webhook_events")
        .select("id")
        .eq("event_key", eventKey)
        .single();

      if (existingEvent) {
        console.log("[WhatsApp Webhook] Duplicate event, skipping:", eventKey);
        continue;
      }

      // Find workspace by phone_number_id
      const { data: phoneNumber } = await supabase
        .from("whatsapp_phone_numbers")
        .select("*, workspaces(*), workspace_settings:workspace_settings(*)")
        .eq("phone_number_id", phoneNumberId)
        .single();

      if (!phoneNumber) {
        console.log("[WhatsApp Webhook] Unknown phone_number_id:", phoneNumberId);
        // Store event anyway for debugging
        await supabase.from("webhook_events").insert({
          event_key: eventKey,
          phone_number_id: phoneNumberId,
          event_type: "unknown_phone",
          payload,
          processing_status: "ignored",
        });
        continue;
      }

      const workspaceId = phoneNumber.workspace_id;

      // Store event
      const { data: webhookEvent } = await supabase
        .from("webhook_events")
        .insert({
          event_key: eventKey,
          workspace_id: workspaceId,
          phone_number_id: phoneNumberId,
          event_type: value.messages ? "message" : "status",
          payload,
          processing_status: "pending",
        })
        .select()
        .single();

      try {
        // Process messages
        if (value.messages) {
          for (const message of value.messages) {
            await processInboundMessage(
              supabase,
              workspaceId,
              phoneNumber,
              message as Record<string, unknown>,
              value.contacts?.[0]
            );
          }
        }

        // Process status updates
        if (value.statuses) {
          for (const status of value.statuses) {
            await processStatusUpdate(supabase, workspaceId, status as Record<string, unknown>);
          }
        }

        // Mark as processed
        await supabase
          .from("webhook_events")
          .update({
            processing_status: "processed",
            processed_at: new Date().toISOString(),
          })
          .eq("id", webhookEvent?.id);
      } catch (error) {
        console.error("[WhatsApp Webhook] Processing error:", error);
        await supabase
          .from("webhook_events")
          .update({
            processing_status: "failed",
            error_message: String(error),
          })
          .eq("id", webhookEvent?.id);
      }
    }
  }
}

/**
 * Process inbound message
 */
async function processInboundMessage(
  supabase: ReturnType<typeof import("@supabase/ssr").createServerClient>,
  workspaceId: string,
  phoneNumber: Record<string, unknown>,
  message: Record<string, unknown>,
  contactProfile?: { wa_id: string; profile: { name: string } }
) {
  const from = message.from as string;
  const messageId = message.id as string;
  const timestamp = message.timestamp as string;
  const messageType = message.type as string;

  // Format phone number
  const phoneE164 = from.startsWith("+") ? from : `+${from}`;

  // Upsert contact
  let contact;
  const { data: existingContact } = await supabase
    .from("contacts")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("phone_e164", phoneE164)
    .single();

  if (existingContact) {
    contact = existingContact;
    // Update last inbound time
    await supabase
      .from("contacts")
      .update({
        last_inbound_at: new Date(parseInt(timestamp) * 1000).toISOString(),
        last_message_at: new Date(parseInt(timestamp) * 1000).toISOString(),
        raw_profile: contactProfile?.profile || {},
      })
      .eq("id", contact.id);
  } else {
    // Create new contact
    const { data: newContact } = await supabase
      .from("contacts")
      .insert({
        workspace_id: workspaceId,
        phone_e164: phoneE164,
        full_name: contactProfile?.profile?.name || null,
        source: "whatsapp_inbound",
        last_inbound_at: new Date(parseInt(timestamp) * 1000).toISOString(),
        last_message_at: new Date(parseInt(timestamp) * 1000).toISOString(),
        raw_profile: contactProfile?.profile || {},
      })
      .select()
      .single();
    contact = newContact;
  }

  if (!contact) {
    console.error("[WhatsApp Webhook] Failed to upsert contact");
    return;
  }

  // Find or create conversation
  let conversation;
  const { data: existingConv } = await supabase
    .from("conversations")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("contact_id", contact.id)
    .eq("whatsapp_phone_number_id", phoneNumber.id as string)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Calculate service window expiry (24 hours from inbound message)
  const serviceWindowExpiry = new Date(
    parseInt(timestamp) * 1000 + 24 * 60 * 60 * 1000
  ).toISOString();

  if (existingConv) {
    conversation = existingConv;
    // Update conversation
    await supabase
      .from("conversations")
      .update({
        customer_service_window_expires_at: serviceWindowExpiry,
        template_required: false,
        status: existingConv.status === "closed" ? "open" : existingConv.status,
      })
      .eq("id", conversation.id);
  } else {
    // Create new conversation
    const { data: newConv } = await supabase
      .from("conversations")
      .insert({
        workspace_id: workspaceId,
        contact_id: contact.id,
        whatsapp_phone_number_id: phoneNumber.id as string,
        status: "open",
        customer_service_window_expires_at: serviceWindowExpiry,
        template_required: false,
      })
      .select()
      .single();
    conversation = newConv;
  }

  if (!conversation) {
    console.error("[WhatsApp Webhook] Failed to upsert conversation");
    return;
  }

  // Determine message content
  let textBody = null;
  let caption = null;
  let mediaFileId = null;
  let normalizedType = messageType;

  if (messageType === "text") {
    textBody = (message.text as { body: string })?.body;
  } else if (["image", "audio", "video", "document", "voice"].includes(messageType)) {
    const mediaData = message[messageType] as {
      id: string;
      mime_type?: string;
      caption?: string;
    };
    caption = mediaData?.caption;
    // Create media file record (download will happen asynchronously)
    const { data: mediaFile } = await supabase
      .from("media_files")
      .insert({
        workspace_id: workspaceId,
        conversation_id: conversation.id,
        contact_id: contact.id,
        direction: "inbound",
        storage_bucket: "whatsapp-media",
        storage_path: `${workspaceId}/${conversation.id}/${mediaData.id}`,
        mime_type: mediaData.mime_type || "application/octet-stream",
        media_type: messageType as "image" | "audio" | "video" | "document" | "voice",
        meta_media_id: mediaData.id,
        is_downloaded: false,
        download_status: "pending",
        raw_payload: mediaData,
      })
      .select()
      .single();
    mediaFileId = mediaFile?.id;
    normalizedType = messageType === "voice" ? "voice" : messageType;
  } else if (messageType === "reaction") {
    normalizedType = "reaction";
    textBody = (message.reaction as { emoji: string })?.emoji;
  }

  // Create message record
  const { data: newMessage } = await supabase
    .from("messages")
    .insert({
      workspace_id: workspaceId,
      conversation_id: conversation.id,
      contact_id: contact.id,
      whatsapp_phone_number_id: phoneNumber.id as string,
      direction: "inbound",
      sender_type: "contact",
      meta_message_id: messageId,
      type: normalizedType as "text" | "image" | "audio" | "video" | "document" | "voice" | "reaction" | "interactive" | "template" | "system",
      text_body: textBody,
      caption,
      media_file_id: mediaFileId,
      status: "received",
      received_at: new Date(parseInt(timestamp) * 1000).toISOString(),
      raw_payload: message,
    })
    .select()
    .single();

  // Update conversation with last message info
  await supabase
    .from("conversations")
    .update({
      last_message_id: newMessage?.id,
      last_message_preview: textBody || caption || `[${normalizedType}]`,
      last_message_at: new Date(parseInt(timestamp) * 1000).toISOString(),
      unread_count: (conversation.unread_count || 0) + 1,
    })
    .eq("id", conversation.id);

  console.log("[WhatsApp Webhook] Processed inbound message:", messageId);
}

/**
 * Process status update
 */
async function processStatusUpdate(
  supabase: ReturnType<typeof import("@supabase/ssr").createServerClient>,
  workspaceId: string,
  status: Record<string, unknown>
) {
  const messageId = status.id as string;
  const statusValue = status.status as string;
  const timestamp = status.timestamp as string;

  // Store status event
  await supabase.from("message_status_events").insert({
    workspace_id: workspaceId,
    meta_message_id: messageId,
    status: statusValue,
    event_time: new Date(parseInt(timestamp) * 1000).toISOString(),
    raw_payload: status,
  });

  // Find message by meta_message_id
  const { data: message } = await supabase
    .from("messages")
    .select("id, status")
    .eq("meta_message_id", messageId)
    .single();

  if (message) {
    // Update message status (only if it's a progression)
    const statusOrder: Record<string, number> = {
      queued: 0,
      sent: 1,
      delivered: 2,
      read: 3,
      played: 4,
      failed: -1,
    };

    const currentOrder = statusOrder[message.status] ?? -2;
    const newOrder = statusOrder[statusValue] ?? -2;

    if (newOrder > currentOrder || statusValue === "failed") {
      const updateData: Record<string, string> = {
        status: statusValue,
      };

      if (statusValue === "sent") {
        updateData.sent_at = new Date(parseInt(timestamp) * 1000).toISOString();
      } else if (statusValue === "delivered") {
        updateData.delivered_at = new Date(parseInt(timestamp) * 1000).toISOString();
      } else if (statusValue === "read") {
        updateData.read_at = new Date(parseInt(timestamp) * 1000).toISOString();
      } else if (statusValue === "played") {
        updateData.played_at = new Date(parseInt(timestamp) * 1000).toISOString();
      } else if (statusValue === "failed") {
        updateData.failed_at = new Date(parseInt(timestamp) * 1000).toISOString();
        updateData.error_code = (status.errors as Array<{ code: string }>)?.[0]?.code || "";
        updateData.error_message = (status.errors as Array<{ title: string }>)?.[0]?.title || "";
      }

      await supabase.from("messages").update(updateData).eq("id", message.id);

      // Link status event to message
      await supabase
        .from("message_status_events")
        .update({ message_id: message.id })
        .eq("meta_message_id", messageId)
        .is("message_id", null);
    }
  }

  console.log("[WhatsApp Webhook] Processed status update:", messageId, statusValue);
}

/**
 * Generate unique event key for idempotency
 */
function generateEventKey(payload: Record<string, unknown>): string {
  const str = JSON.stringify(payload);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `wa_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
}
