import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Contact labels based on business model
const LABEL_MAP: Record<string, string> = {
  prospect: "Prospecto SistecPOS",
  client: "- Cliente SistecPOS",
  partner: "Reseller SistecPOS",
  lead: "Lead SistecPOS",
  demo: "Demo SistecPOS",
  certificado: "Certificado SistecPOS",
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

    // Get Google tokens
    const accessToken = await getValidAccessToken(userId);
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "Google no conectado. Conecta tu cuenta primero." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get body params
    const body = await req.json().catch(() => ({}));
    const { contact, action = "upsert" } = body;

    if (action === "upsert" && contact) {
      const result = await upsertGoogleContact(accessToken, contact);
      return new Response(JSON.stringify({ ok: true, result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "sync_all") {
      // Sync all contacts from DB to Google
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      const { data: contacts } = await supabaseAdmin
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      let synced = 0;
      for (const c of contacts || []) {
        try {
          await upsertGoogleContact(accessToken, {
            name: c.full_name,
            email: c.email,
            phone: c.phone,
            company: c.business_name,
            label: LABEL_MAP[c.contact_type] || LABEL_MAP[c.pipeline_stage] || "Prospecto SistecPOS",
            city: c.city,
            notes: c.notes,
          });
          synced++;
          // Rate limit: small delay between requests
          await new Promise((r) => setTimeout(r, 200));
        } catch (e) {
          console.error(`Error syncing contact ${c.full_name}:`, e);
        }
      }

      return new Response(JSON.stringify({ ok: true, synced }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("sync-google-contacts error:", err);
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

  // If token is expired, refresh it
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
    if (!refreshRes.ok || !refreshData.access_token) {
      console.error("Token refresh failed:", refreshData);
      return null;
    }

    // Update stored tokens
    const newExpires = new Date(Date.now() + (refreshData.expires_in || 3600) * 1000).toISOString();
    await supabaseAdmin.rpc("upsert_google_tokens", {
      _user_id: userId,
      _access_token: refreshData.access_token,
      _refresh_token: row.refresh_token, // refresh_token stays the same
      _expires_at: newExpires,
      _scopes: row.scopes,
    });

    return refreshData.access_token;
  }

  return row.access_token;
}

async function upsertGoogleContact(
  accessToken: string,
  contact: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    label?: string;
    city?: string;
    notes?: string;
  }
) {
  // Search for existing contact by email
  let existingResourceName: string | null = null;

  if (contact.email) {
    const searchRes = await fetch(
      `https://people.googleapis.com/v1/people:searchContacts?query=${encodeURIComponent(contact.email)}&readMask=names,emailAddresses`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const searchData = await searchRes.json();
    if (searchData.results?.[0]?.person?.resourceName) {
      existingResourceName = searchData.results[0].person.resourceName;
    }
  }

  const personBody: Record<string, unknown> = {
    names: [{ givenName: contact.name }],
    emailAddresses: contact.email ? [{ value: contact.email, type: "work" }] : [],
    phoneNumbers: contact.phone ? [{ value: contact.phone, type: "mobile" }] : [],
    organizations: contact.company ? [{ name: contact.company }] : [],
    addresses: contact.city ? [{ city: contact.city, type: "work" }] : [],
    biographies: contact.notes ? [{ value: contact.notes }] : [],
    userDefined: contact.label ? [{ key: "Etiqueta SistecPOS", value: contact.label }] : [],
  };

  if (existingResourceName) {
    // Update existing contact
    const etag = await getContactEtag(accessToken, existingResourceName);
    const updateRes = await fetch(
      `https://people.googleapis.com/v1/${existingResourceName}:updateContact?updatePersonFields=names,emailAddresses,phoneNumbers,organizations,addresses,biographies,userDefined`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...personBody, etag }),
      }
    );
    return await updateRes.json();
  } else {
    // Create new contact
    const createRes = await fetch(
      "https://people.googleapis.com/v1/people:createContact",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(personBody),
      }
    );
    return await createRes.json();
  }
}

async function getContactEtag(accessToken: string, resourceName: string): Promise<string> {
  const res = await fetch(
    `https://people.googleapis.com/v1/${resourceName}?personFields=metadata`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();
  return data.etag || "";
}
