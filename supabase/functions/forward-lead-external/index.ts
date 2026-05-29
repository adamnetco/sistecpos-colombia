import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// Panel del franquiciado (Prospectos) — Laravel con CSRF
const HASH = '890267cdf2986e0e0d89a6de48236599';
const TOKEN_PARAM = 'ODM=';
const FORM_PAGE = `https://licenciaspos.online/prospects/registerForm/${HASH}?token=${TOKEN_PARAM}`;
const SUBMIT_URL = FORM_PAGE; // mismo endpoint, POST

function parseCookies(setCookieHeaders: string[]): string {
  // Une las cookies devueltas para reenviarlas en el POST
  return setCookieHeaders
    .map((c) => c.split(';')[0])
    .filter(Boolean)
    .join('; ');
}

function extractCsrf(html: string): string | null {
  const m = html.match(/name="_token"\s+value="([^"]+)"/i);
  return m ? m[1] : null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = req.method === 'POST' ? await req.json().catch(() => ({})) : {};

    const fullName = payload.full_name || payload.name || payload.nombre || '';
    const businessName = payload.business_name || payload.business || payload.negocio || payload.empresa || '';
    const phone = (payload.phone || payload.whatsapp || payload.telefono || '').toString().replace(/\D/g, '');
    const email = (payload.email || payload.correo || '').toString().trim();
    const city = payload.city || payload.ciudad || '';
    const country = payload.country || payload.pais || 'Colombia';
    const description = payload.notes || payload.description ||
      `Lead capturado desde ${payload.origin_url || 'sistecpos.com'} (${payload.source || 'sistecpos_web_demo'})`;

    // Nombre de tienda: solo alfanuméricos, máx 20
    const storeSlug = (businessName || fullName || 'sistecpos')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, 20) || 'sistecpos';

    // 1) GET para obtener CSRF + cookie de sesión
    const getRes = await fetch(FORM_PAGE, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SistecPOS-Proxy/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    const html = await getRes.text();
    const csrf = extractCsrf(html);

    // Cookies (Set-Cookie puede venir como múltiples headers)
    const setCookies: string[] = [];
    // @ts-ignore - getSetCookie disponible en Deno
    if (typeof (getRes.headers as any).getSetCookie === 'function') {
      // @ts-ignore
      setCookies.push(...(getRes.headers as any).getSetCookie());
    } else {
      const sc = getRes.headers.get('set-cookie');
      if (sc) setCookies.push(sc);
    }
    const cookieHeader = parseCookies(setCookies);

    if (!csrf) {
      return new Response(
        JSON.stringify({ ok: false, error: 'csrf_not_found', status: getRes.status }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 2) POST con los campos REALES del formulario Laravel
    const form = new URLSearchParams({
      _token: csrf,
      token: TOKEN_PARAM,
      key: HASH,
      form_name: fullName,
      form_email: email,
      confirm_email: email,
      form_store: storeSlug,
      form_profile: '1',
      form_country: country,
      form_city: city,
      store_whatsapp_prefix: '+57',
      form_phone: phone,
      manage_software: 'No',
      change_software_description: description,
      know_inventory: 'No',
      form_description: description,
      software_ideal: 'POS para mi negocio',
      nom_sale: '1-30',
      how_employees: '1',
      in_time_systematize: '1 mes, no tengo prisa',
      business_time: '1',
      period_time: 'años',
      methodCheck: '0',
    });

    const postRes = await fetch(SUBMIT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; SistecPOS-Proxy/1.0)',
        'X-CSRF-TOKEN': csrf,
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': FORM_PAGE,
        'Origin': 'https://licenciaspos.online',
        'Cookie': cookieHeader,
      },
      body: form.toString(),
      redirect: 'manual',
    });

    const externalStatus = postRes.status;
    const externalBody = (await postRes.text()).slice(0, 800);

    const ok = externalStatus >= 200 && externalStatus < 400;

    return new Response(
      JSON.stringify({
        ok,
        status: externalStatus,
        location: postRes.headers.get('location') || null,
        body: externalBody,
      }),
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
