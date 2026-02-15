import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages, session_id, source_page, user_role, user_email } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Load knowledge base entries
    const { data: kbEntries } = await supabase
      .from("ai_knowledge_base")
      .select("title, content, entry_type, category")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    let knowledgeContext = "";
    if (kbEntries && kbEntries.length > 0) {
      const faqs = kbEntries.filter((e) => e.entry_type === "faq");
      const docs = kbEntries.filter((e) => e.entry_type === "document");
      const custom = kbEntries.filter((e) => e.entry_type === "custom_text");

      if (faqs.length > 0) {
        knowledgeContext += "\n\n## Preguntas Frecuentes:\n";
        faqs.forEach((f) => {
          knowledgeContext += `\n**P: ${f.title}**\nR: ${f.content}\n`;
        });
      }
      if (docs.length > 0) {
        knowledgeContext += "\n\n## Documentación:\n";
        docs.forEach((d) => {
          knowledgeContext += `\n### ${d.title}\n${d.content}\n`;
        });
      }
      if (custom.length > 0) {
        knowledgeContext += "\n\n## Información Adicional:\n";
        custom.forEach((c) => {
          knowledgeContext += `\n${c.content}\n`;
        });
      }
    }

    // Load admin corrections with their preceding user questions for better few-shot context
    const { data: corrections } = await supabase
      .from("ai_messages")
      .select("id, content, corrected_content, conversation_id, created_at")
      .not("corrected_content", "is", null)
      .order("corrected_at", { ascending: false })
      .limit(20);

    let correctionContext = "";
    if (corrections && corrections.length > 0) {
      // Load preceding user messages for each correction
      const enriched: { question: string; original: string; corrected: string }[] = [];
      for (const c of corrections) {
        const { data: prevMsg } = await supabase
          .from("ai_messages")
          .select("content")
          .eq("conversation_id", c.conversation_id)
          .eq("role", "user")
          .lt("created_at", c.created_at)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        enriched.push({
          question: prevMsg?.content || "(pregunta desconocida)",
          original: c.content.slice(0, 200),
          corrected: c.corrected_content!,
        });
      }

      correctionContext = "\n\n## Correcciones del administrador (respuestas corregidas que debes usar como guía):\n";
      enriched.forEach((e, i) => {
        correctionContext += `\n### Ejemplo ${i + 1}:\nPregunta: "${e.question}"\nRespuesta incorrecta: "${e.original}"\n✅ Respuesta correcta: "${e.corrected}"\n`;
      });
    }

    // Load custom system prompt and temperature from app_settings
    const { data: settings } = await supabase
      .from("app_settings")
      .select("key, value")
      .in("key", ["chatbot_system_prompt", "chatbot_temperature"]);

    const promptSetting = settings?.find((s: any) => s.key === "chatbot_system_prompt");
    const tempSetting = settings?.find((s: any) => s.key === "chatbot_temperature");
    const temperature = tempSetting ? parseFloat(tempSetting.value) : 0;

    const basePrompt = promptSetting?.value || `Eres el asistente virtual de SistecPOS, un software POS y de facturación electrónica DIAN para Colombia.

Tu objetivo es:
1. Responder preguntas sobre SistecPOS, sus productos, planes y funcionalidades
2. Ayudar a prospectos a entender cómo SistecPOS puede resolver sus necesidades
3. Capturar datos de contacto de personas interesadas de forma natural

Reglas:
- Responde siempre en español colombiano, de forma amigable y profesional
- Sé conciso pero útil (máximo 3 párrafos por respuesta)
- Si no tienes información específica, sugiere contactar al equipo comercial por WhatsApp
- Cuando detectes que el usuario está interesado, pide amablemente su nombre, email o teléfono
- Si el usuario proporciona datos de contacto (nombre, email, teléfono), inclúyelos en tu respuesta con el formato exacto: [LEAD_DATA:nombre|email|teléfono]
- Nunca inventes precios o datos que no estén en tu base de conocimiento
- La web oficial es sistecpos.com y el WhatsApp comercial es el que aparezca en la base de conocimiento`;

    // Build role-specific context
    let roleContext = "";
    if (user_role === "reseller") {
      roleContext = `\n\n## Contexto del usuario:
El usuario es un SOCIO/REPRESENTANTE de SistecPOS (email: ${user_email || "desconocido"}).
- NO intentes venderle productos, él ya es parte del equipo comercial.
- Ayúdalo con: gestión de licencias, comisiones, dudas técnicas para sus clientes, materiales de venta, resolución de problemas.
- Si no puedes resolver su inquietud, escálalo a soporte técnico interno.
- Trátalo como un aliado comercial.`;
    } else if (user_role === "customer") {
      roleContext = `\n\n## Contexto del usuario:
El usuario es un CLIENTE activo de SistecPOS (email: ${user_email || "desconocido"}).
- Ayúdalo a resolver dudas sobre el uso del software POS.
- Sugiere upgrades o productos complementarios cuando sea relevante.
- Si el problema es técnico y complejo, escálalo a soporte: sugiere crear un ticket en /clientes o contactar WhatsApp.
- Bríndale información sobre capacitaciones disponibles.`;
    } else if (user_role === "admin") {
      roleContext = `\n\n## Contexto del usuario:
El usuario es un ADMINISTRADOR de SistecPOS (email: ${user_email || "desconocido"}).
- Puedes dar respuestas más técnicas y detalladas.
- Tiene acceso completo a todas las funcionalidades.`;
    }

    const systemPrompt = `${basePrompt}
${roleContext}
${knowledgeContext}
${correctionContext}`;

    // Save/update conversation
    if (session_id) {
      const { data: existing } = await supabase
        .from("ai_conversations")
        .select("id")
        .eq("session_id", session_id)
        .maybeSingle();

      if (!existing) {
        await supabase.from("ai_conversations").insert({
          session_id,
          source_page: source_page || null,
        });
      }

      // Save user message
      const lastUserMsg = messages[messages.length - 1];
      if (lastUserMsg?.role === "user") {
        const { data: conv } = await supabase
          .from("ai_conversations")
          .select("id")
          .eq("session_id", session_id)
          .maybeSingle();

        if (conv) {
          await supabase.from("ai_messages").insert({
            conversation_id: conv.id,
            role: "user",
            content: lastUserMsg.content,
          });
        }
      }
    }

    // Call Lovable AI Gateway with streaming
    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.slice(-10),
          ],
          stream: true,
          temperature,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Demasiadas solicitudes, intenta de nuevo en unos segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Servicio temporalmente no disponible." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "Error del servicio de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a transform stream to capture the full response for saving
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullAssistantResponse = "";

    // Process in background
    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          await writer.write(value);

          // Parse SSE to capture full response
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) fullAssistantResponse += content;
            } catch { /* partial JSON */ }
          }
        }
      } catch (e) {
        console.error("Stream processing error:", e);
      } finally {
        await writer.close();

        // Save assistant response and check for lead data
        if (session_id && fullAssistantResponse) {
          try {
            const { data: conv } = await supabase
              .from("ai_conversations")
              .select("id")
              .eq("session_id", session_id)
              .maybeSingle();

            if (conv) {
              await supabase.from("ai_messages").insert({
                conversation_id: conv.id,
                role: "assistant",
                content: fullAssistantResponse,
              });

              // Update message count
              const { count } = await supabase
                .from("ai_messages")
                .select("id", { count: "exact" })
                .eq("conversation_id", conv.id);

              await supabase
                .from("ai_conversations")
                .update({ message_count: count || 0 })
                .eq("id", conv.id);

              // Check for lead capture with deduplication
              const leadMatch = fullAssistantResponse.match(
                /\[LEAD_DATA:([^|]*)\|([^|]*)\|([^\]]*)\]/
              );
              if (leadMatch) {
                const [, name, email, phone] = leadMatch;
                if (name || email || phone) {
                  let contactId: string | null = null;
                  const trimEmail = email?.trim() || null;
                  const trimPhone = phone?.trim() || null;
                  const trimName = name?.trim() || "Visitante chatbot";

                  // 1. Search existing contact by email (priority) or phone
                  if (trimEmail) {
                    const { data: existing } = await supabase
                      .from("contacts")
                      .select("id")
                      .eq("email", trimEmail)
                      .maybeSingle();
                    if (existing) {
                      contactId = existing.id;
                      // Update missing fields
                      const updates: Record<string, string> = {};
                      if (trimPhone) updates.phone = trimPhone;
                      if (trimName && trimName !== "Visitante chatbot") updates.full_name = trimName;
                      if (Object.keys(updates).length > 0) {
                        await supabase.from("contacts").update(updates).eq("id", contactId);
                      }
                    }
                  }
                  if (!contactId && trimPhone) {
                    const { data: existing } = await supabase
                      .from("contacts")
                      .select("id")
                      .eq("phone", trimPhone)
                      .maybeSingle();
                    if (existing) {
                      contactId = existing.id;
                      const updates: Record<string, string> = {};
                      if (trimEmail) updates.email = trimEmail;
                      if (trimName && trimName !== "Visitante chatbot") updates.full_name = trimName;
                      if (Object.keys(updates).length > 0) {
                        await supabase.from("contacts").update(updates).eq("id", contactId);
                      }
                    }
                  }

                  // 2. Create new contact if not found
                  if (!contactId) {
                    const { data: newContact } = await supabase
                      .from("contacts")
                      .insert({
                        full_name: trimName,
                        email: trimEmail,
                        phone: trimPhone,
                        source: "chatbot_ai",
                        contact_type: "prospect",
                        captured_by_ai: true,
                      })
                      .select("id")
                      .maybeSingle();
                    if (newContact) contactId = newContact.id;
                  }

                  // 3. Link conversation to contact
                  if (contactId) {
                    await supabase
                      .from("ai_conversations")
                      .update({
                        is_lead_captured: true,
                        contact_id: contactId,
                        visitor_name: trimName || null,
                        visitor_email: trimEmail,
                        visitor_phone: trimPhone,
                      })
                      .eq("id", conv.id);

                    // 4. Auto-register activity
                    await supabase.from("contact_activities").insert({
                      contact_id: contactId,
                      activity_type: "note",
                      description: `Interacción con chatbot IA (sesión: ${session_id})`,
                    });

                    // 5. Increment lead score
                    const { data: currentContact } = await supabase
                      .from("contacts")
                      .select("lead_score")
                      .eq("id", contactId)
                      .maybeSingle();
                    if (currentContact) {
                      await supabase
                        .from("contacts")
                        .update({ lead_score: (currentContact.lead_score || 0) + 1 })
                        .eq("id", contactId);
                    }
                  }
                }
              }
            }
          } catch (e) {
            console.error("Error saving conversation:", e);
          }
        }
      }
    })();

    return new Response(readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
