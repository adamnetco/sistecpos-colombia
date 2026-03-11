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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, serviceKey);

    // Find branches expiring in ~30 days (month 11) that haven't been reminded
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const twentyNineDays = new Date();
    twentyNineDays.setDate(twentyNineDays.getDate() + 29);

    const { data: expiringBranches, error: branchErr } = await supabase
      .from("license_branches")
      .select("*, licenses!inner(id, business_name, contact_name, contact_email, contact_phone, plan_type, license_key, expires_at)")
      .eq("is_active", true)
      .eq("expiry_reminder_sent", false)
      .lte("pos_expires_at", thirtyDaysFromNow.toISOString())
      .gte("pos_expires_at", twentyNineDays.toISOString());

    // Also check license-level expiration
    const { data: expiringLicenses, error: licErr } = await supabase
      .from("licenses")
      .select("id, business_name, contact_name, contact_email, contact_phone, plan_type, license_key, expires_at")
      .eq("status", "active")
      .lte("expires_at", thirtyDaysFromNow.toISOString().split("T")[0])
      .gte("expires_at", twentyNineDays.toISOString().split("T")[0]);

    const results: string[] = [];
    const adminEmail = "eduardotp77@gmail.com";

    // Process branch-level expirations
    if (expiringBranches && expiringBranches.length > 0) {
      for (const branch of expiringBranches) {
        const license = (branch as any).licenses;
        if (!license) continue;

        const daysLeft = Math.ceil(
          (new Date(branch.pos_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        // Email to client
        if (license.contact_email && resendKey) {
          await sendEmail(resendKey, {
            to: license.contact_email,
            subject: `⏰ Tu licencia ${branch.branch_name} vence en ${daysLeft} días — Renueva con 10% de descuento`,
            html: buildClientEmail(license, branch, daysLeft),
          });
        }

        // Email to admin
        if (resendKey) {
          await sendEmail(resendKey, {
            to: adminEmail,
            subject: `🔔 Licencia por vencer: ${license.business_name} — ${branch.branch_name} (${daysLeft}d)`,
            html: buildAdminEmail(license, branch, daysLeft),
          });
        }

        // Mark as reminded
        await supabase.from("license_branches").update({ expiry_reminder_sent: true }).eq("id", branch.id);

        results.push(`Branch ${branch.branch_name} of ${license.business_name}`);
      }
    }

    // Process license-level expirations (no branches)
    if (expiringLicenses && expiringLicenses.length > 0) {
      for (const license of expiringLicenses) {
        // Check if already has branches (if so, handled above)
        const { count } = await supabase
          .from("license_branches")
          .select("id", { count: "exact", head: true })
          .eq("license_id", license.id);

        if ((count ?? 0) > 0) continue;

        const daysLeft = Math.ceil(
          (new Date(license.expires_at!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        if (license.contact_email && resendKey) {
          await sendEmail(resendKey, {
            to: license.contact_email,
            subject: `⏰ Tu licencia vence en ${daysLeft} días — Renueva con 10% de descuento`,
            html: buildClientEmail(license, null, daysLeft),
          });
        }

        if (resendKey) {
          await sendEmail(resendKey, {
            to: adminEmail,
            subject: `🔔 Licencia por vencer: ${license.business_name} (${daysLeft}d)`,
            html: buildAdminEmail(license, null, daysLeft),
          });
        }

        results.push(`License ${license.business_name}`);
      }
    }

    return new Response(
      JSON.stringify({ ok: true, reminders_sent: results.length, details: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Expiry reminder error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function sendEmail(
  resendKey: string,
  opts: { to: string; subject: string; html: string }
) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "SistecPOS <notificaciones@sistecpos.com>",
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Email to ${opts.to} failed:`, body);
  }
}

function buildClientEmail(license: any, branch: any, daysLeft: number): string {
  const branchName = branch ? branch.branch_name : "tu licencia";
  const whatsappMsg = encodeURIComponent(
    `Hola, mi licencia de ${license.business_name}${branch ? ` (${branch.branch_name})` : ""} está próxima a vencer. Me gustaría reclamar mi cupón de renovación con 10% de descuento.`
  );
  const whatsappLink = `https://wa.me/573001234567?text=${whatsappMsg}`;

  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
  <body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
      <div style="text-align:center;margin-bottom:32px;">
        <img src="https://sistecpos.lovable.app/isologo-sistecpos.svg" alt="SistecPOS" style="height:48px;" />
      </div>

      <div style="background:linear-gradient(135deg,#FFF7ED,#FFEDD5);border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #FDBA74;">
        <h1 style="margin:0 0 8px;font-size:20px;color:#9A3412;">⏰ ${branchName} vence en ${daysLeft} días</h1>
        <p style="margin:0;font-size:14px;color:#C2410C;">
          Hola <strong>${license.contact_name}</strong>, tu licencia de <strong>${license.business_name}</strong> está próxima a vencer.
        </p>
      </div>

      <div style="background:#F0FDF4;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #86EFAC;text-align:center;">
        <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#166534;">🎉 ¡Renueva ahora con 10% de descuento!</p>
        <p style="margin:0 0 16px;font-size:13px;color:#15803D;">Contacta a tu asesor antes del vencimiento y recibe tu cupón exclusivo de pago anticipado.</p>
        <a href="${whatsappLink}" target="_blank" style="display:inline-block;background:#25D366;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
          💬 Reclamar cupón por WhatsApp
        </a>
      </div>

      <table style="width:100%;font-size:13px;color:#374151;border-collapse:collapse;">
        <tr><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;"><strong>Negocio</strong></td><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;">${license.business_name}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;"><strong>Plan</strong></td><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;">${license.plan_type}</td></tr>
        ${branch ? `<tr><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;"><strong>Sede</strong></td><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;">${branch.branch_name} — ${branch.pos_location || ""}</td></tr>` : ""}
        <tr><td style="padding:8px 0;"><strong>Días restantes</strong></td><td style="padding:8px 0;color:#DC2626;font-weight:700;">${daysLeft} días</td></tr>
      </table>

      <div style="margin-top:32px;text-align:center;font-size:11px;color:#9CA3AF;">
        <p>SistecPOS — Software POS para Colombia</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

function buildAdminEmail(license: any, branch: any, daysLeft: number): string {
  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
      <h2 style="margin:0 0 16px;color:#1F2937;">🔔 Licencia por vencer</h2>

      <table style="width:100%;font-size:13px;color:#374151;border-collapse:collapse;">
        <tr><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;width:40%;"><strong>Negocio</strong></td><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;">${license.business_name}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;"><strong>Contacto</strong></td><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;">${license.contact_name}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;"><strong>Email</strong></td><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;">${license.contact_email || "—"}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;"><strong>Teléfono</strong></td><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;">${license.contact_phone || "—"}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;"><strong>Plan</strong></td><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;">${license.plan_type}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;"><strong>Clave</strong></td><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;font-family:monospace;">${license.license_key}</td></tr>
        ${branch ? `
        <tr><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;"><strong>Sede</strong></td><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;">${branch.branch_name}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;"><strong>Ubicación POS</strong></td><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;">${branch.pos_location || "—"}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;"><strong>Hash</strong></td><td style="padding:8px 0;border-bottom:1px solid #E5E7EB;font-family:monospace;">${branch.pos_license_hash || "—"}</td></tr>
        ` : ""}
        <tr><td style="padding:8px 0;"><strong>Días restantes</strong></td><td style="padding:8px 0;color:#DC2626;font-weight:700;">${daysLeft} días</td></tr>
      </table>

      <div style="margin-top:16px;padding:12px;background:#FEF2F2;border-radius:8px;font-size:13px;color:#991B1B;">
        ⚡ Acción requerida: Contactar al cliente para renovación.
      </div>
    </div>
  </body>
  </html>
  `;
}
