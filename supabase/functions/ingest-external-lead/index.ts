import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-franchise-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const token = req.headers.get('x-franchise-token')
    const expected = Deno.env.get('FRANCHISE_INGEST_TOKEN')
    if (!expected || token !== expected) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json().catch(() => null)
    if (!body) {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Acepta un único payload o array (compatible con bookmarklet en batch)
    const payloads: any[] = Array.isArray(body) ? body : Array.isArray(body?.payloads) ? body.payloads : [body]

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    )

    const results: any[] = []
    for (const p of payloads) {
      // Llamamos a la RPC pero con service_role: bypass al check has_role
      // La función exige admin; usamos un INSERT/UPDATE manual replicando su lógica simplificada
      const { data, error } = await admin.rpc('upsert_lead_from_external_json_srv', { _payload: p })
      if (error) {
        results.push({ ok: false, error: error.message, ext_id: p?.id })
      } else {
        results.push({ ok: true, ...data })
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
