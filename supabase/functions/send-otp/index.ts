const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const dbHeaders = {
    "Content-Type": "application/json",
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };

  try {
    const { email, type, code } = await req.json();
    console.log(`OTP request: email=${email}, type=${type}, hasCode=${!!code}`);

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // VERIFY MODE: if code is provided, verify it
    if (type === "verify" && code) {
      const verifyRes = await fetch(
        `${supabaseUrl}/rest/v1/otp_codes?email=eq.${encodeURIComponent(email)}&type=eq.2fa&code=eq.${encodeURIComponent(code)}&used=eq.false&select=id,expires_at`,
        { headers: dbHeaders }
      );

      const records = await verifyRes.json();
      
      if (!records || records.length === 0) {
        console.log("No matching OTP found");
        return new Response(
          JSON.stringify({ valid: false, error: "Invalid code" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const record = records[0];
      if (new Date(record.expires_at) < new Date()) {
        console.log("OTP expired");
        return new Response(
          JSON.stringify({ valid: false, error: "Code expired" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Mark as used
      await fetch(`${supabaseUrl}/rest/v1/otp_codes?id=eq.${record.id}`, {
        method: "PATCH",
        headers: { ...dbHeaders, Prefer: "return=minimal" },
        body: JSON.stringify({ used: true }),
      });

      console.log(`OTP verified for ${email}`);
      return new Response(
        JSON.stringify({ valid: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SEND MODE: generate and send OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Delete existing OTP for this email/type, then insert new one
    await fetch(
      `${supabaseUrl}/rest/v1/otp_codes?email=eq.${encodeURIComponent(email)}&type=eq.${encodeURIComponent(type || "2fa")}`,
      { method: "DELETE", headers: { ...dbHeaders, Prefer: "return=minimal" } }
    );

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/otp_codes`, {
      method: "POST",
      headers: { ...dbHeaders, Prefer: "return=minimal" },
      body: JSON.stringify({
        email,
        code: otp,
        type: type || "2fa",
        expires_at: expiresAt,
        used: false,
      }),
    });

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      console.error("DB insert error:", errText);
      return new Response(
        JSON.stringify({ error: "Failed to store OTP" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send OTP via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">SistecPOS</h1>
        </div>
        <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; text-align: center;">
          <h2 style="color: #333; font-size: 20px; margin: 0 0 8px;">Código de verificación</h2>
          <p style="color: #666; font-size: 14px; margin: 0 0 24px;">
            Ingresa este código para completar tu inicio de sesión.
          </p>
          <div style="background: #fff; border: 2px solid #e0e0e0; border-radius: 8px; padding: 16px; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a1a2e; font-family: monospace;">
            ${otp}
          </div>
          <p style="color: #999; font-size: 12px; margin: 24px 0 0;">
            Este código expira en 10 minutos. No compartas este código con nadie.
          </p>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 24px;">
          Si no solicitaste este código, alguien puede estar intentando acceder a tu cuenta. Cambia tu contraseña.
        </p>
      </div>
    `;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SistecPOS <notificaciones@sistecpos.com>",
        to: [email],
        subject: "Tu código de verificación - SistecPOS",
        html: htmlBody,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error("Resend error:", errText);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`OTP sent to ${email}`);

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error in send-otp:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
