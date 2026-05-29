import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// Endpoint del panel del franquiciado (Prospectos)
const EXTERNAL_URL = 'https://licenciaspos.online/prospects/register/890267cdf2986e0e0d89a6de48236599?token=ODM=';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    // Normaliza datos del prospecto a múltiples alias de campos que suelen
    // esperar los backends PHP del panel (es / en) para asegurar ingesta correcta
    // en https://panel.accesopos.com/prospects
    const fullName = payload.full_name || payload.name || payload.nombre || '';
    const businessName = payload.business_name || payload.business || payload.negocio || payload.empresa || '';
    const phone = payload.phone || payload.whatsapp || payload.telefono || payload.celular || '';
    const email = payload.email || payload.correo || '';
    const city = payload.city || payload.ciudad || '';
    const businessType = payload.business_type || payload.tipo_negocio || '';
    const country = payload.country || payload.pais || 'Colombia';

    const normalized: Record<string, string> = {
      // Alias en español
      nombre: fullName,
      nombre_completo: fullName,
      negocio: businessName,
      empresa: businessName,
      razon_social: businessName,
      telefono: phone,
      celular: phone,
      whatsapp: phone,
      correo: email,
      email,
      ciudad: city,
      pais: country,
      tipo_negocio: businessType,
      // Alias en inglés
      name: fullName,
      full_name: fullName,
      business: businessName,
      business_name: businessName,
      phone,
      city,
      country,
      business_type: businessType,
      // Metadatos de origen
      source: payload.source || 'sistecpos_web_demo',
      origin: payload.source || 'sistecpos_web_demo',
      origin_url: payload.origin_url || '',
      utm_source: payload.utm_source || 'sistecpos.com',
      utm_medium: payload.utm_medium || 'web_form',
      utm_campaign: payload.utm_campaign || 'demo_request',
    };

    // Limpia vacíos para no ensuciar el panel
    Object.keys(normalized).forEach((k) => {
      if (!normalized[k]) delete normalized[k];
    });

    const form = new URLSearchParams();
    Object.entries(normalized).forEach(([k, v]) => form.append(k, v));

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

      if (externalStatus >= 400) {
        mode = 'json';
        const res2 = await fetch(EXTERNAL_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': 'SistecPOS-Proxy/1.0',
          },
          body: JSON.stringify(normalized),
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
