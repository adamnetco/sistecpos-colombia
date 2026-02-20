import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claims.claims.sub as string;
    const accessToken = await getValidAccessToken(userId);
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "Google no conectado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { action = "list_events" } = body;

    if (action === "list_events") {
      const calendarId = body.calendar_id || "primary";
      const timeMin = body.time_min || new Date().toISOString();
      const timeMax = body.time_max || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const maxResults = body.max_results || 50;

      const params = new URLSearchParams({
        timeMin,
        timeMax,
        maxResults: String(maxResults),
        singleEvents: "true",
        orderBy: "startTime",
      });

      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();

      if (!res.ok) {
        return new Response(JSON.stringify({ error: data.error?.message || "Error fetching events" }), {
          status: res.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Map to a clean format
      const events = (data.items || []).map((e: any) => ({
        id: e.id,
        title: e.summary || "(Sin título)",
        description: e.description || "",
        start: e.start?.dateTime || e.start?.date,
        end: e.end?.dateTime || e.end?.date,
        location: e.location || "",
        attendees: (e.attendees || []).map((a: any) => a.email),
        htmlLink: e.htmlLink,
        status: e.status,
        colorId: e.colorId,
      }));

      return new Response(JSON.stringify({ ok: true, events }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create_event") {
      const { title, description, start, end, location, attendees, calendar_id } = body;
      const calendarId = calendar_id || "primary";

      if (!title || !start || !end) {
        return new Response(JSON.stringify({ error: "title, start, end son requeridos" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const event: Record<string, unknown> = {
        summary: title,
        description: description || "",
        start: { dateTime: start, timeZone: "America/Bogota" },
        end: { dateTime: end, timeZone: "America/Bogota" },
        location: location || "",
        attendees: (attendees || []).map((email: string) => ({ email })),
        reminders: { useDefault: true },
      };

      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        return new Response(JSON.stringify({ error: data.error?.message || "Error creating event" }), {
          status: res.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ ok: true, event: { id: data.id, htmlLink: data.htmlLink } }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list_calendars") {
      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/users/me/calendarList",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();

      const calendars = (data.items || []).map((c: any) => ({
        id: c.id,
        summary: c.summary,
        description: c.description || "",
        primary: c.primary || false,
        backgroundColor: c.backgroundColor,
        accessRole: c.accessRole,
      }));

      return new Response(JSON.stringify({ ok: true, calendars }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("sync-google-calendar error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function getValidAccessToken(userId: string): Promise<string | null> {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabaseAdmin.rpc("get_google_tokens", { _user_id: userId });
  if (error || !data?.[0]) return null;

  const row = data[0];
  const expiresAt = new Date(row.token_expires_at);

  if (expiresAt < new Date()) {
    if (!row.refresh_token) return null;

    const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
        client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
        refresh_token: row.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    const refreshData = await refreshRes.json();
    if (!refreshRes.ok || !refreshData.access_token) return null;

    const newExpires = new Date(Date.now() + (refreshData.expires_in || 3600) * 1000).toISOString();
    await supabaseAdmin.rpc("upsert_google_tokens", {
      _user_id: userId,
      _access_token: refreshData.access_token,
      _refresh_token: row.refresh_token,
      _expires_at: newExpires,
      _scopes: row.scopes,
    });

    return refreshData.access_token;
  }

  return row.access_token;
}
