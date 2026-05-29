import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const EXTERNAL_URL = 'https://licenciaspos.online/prospects/register/890267cdf2986e0e0d89a6de48236599?token=ODM=';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    // Build both JSON and form-urlencoded variants; many legacy PHP endpoints expect form data.
    const form = new URLSearchParams();
    Object.entries(payload || {}).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      form.append(k, typeof v === 'string' ? v : JSON.stringify(v));
    });

    let externalStatus = 0;
    let externalBody = '';
    let mode = 'form';

    try {
      const res = await fetch(EXTERNAL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'SistecPOS-Proxy/1.0',
        },
        body: form.toString(),
      });
      externalStatus = res.status;
      externalBody = (await res.text()).slice(0, 500);

      // Fallback to JSON if the endpoint rejected the form payload
      if (externalStatus >= 400) {
        mode = 'json';
        const res2 = await fetch(EXTERNAL_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': 'SistecPOS-Proxy/1.0',
          },
          body: JSON.stringify(payload),
        });
        externalStatus = res2.status;
        externalBody = (await res2.text()).slice(0, 500);
      }
    } catch (err) {
      console.error('forward-lead-external fetch error:', err);
      return new Response(
        JSON.stringify({ ok: false, error: String(err) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ ok: externalStatus < 400, status: externalStatus, mode, body: externalBody }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('forward-lead-external error:', err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
