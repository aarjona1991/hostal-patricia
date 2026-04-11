import nodemailer from "nodemailer";

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function subjectSnippet(s, max = 72) {
  let t = String(s).replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
  if (t.length > max) t = `${t.slice(0, max - 1)}…`;
  return t;
}

/** Nombre visible en el correo (cabecera). Opcional: MAIL_BRAND_NAME; si no, se intenta desde MAIL_FROM. */
function getMailBrandName() {
  const explicit = process.env.MAIL_BRAND_NAME?.trim();
  if (explicit) return explicit;
  const from = process.env.MAIL_FROM?.trim() || "";
  const lt = from.indexOf("<");
  if (lt > 0) {
    return from
      .slice(0, lt)
      .replace(/^["'\s]+|["'\s]+$/g, "")
      .trim();
  }
  return "Tu alojamiento";
}

function buildContactNotificationHtml({ id, nombre, email, mensaje, ip }) {
  const brand = escapeHtml(getMailBrandName());
  const siteUrl = (process.env.MAIL_SITE_URL || process.env.SITE_URL || "").trim();
  const safeSite = siteUrl ? escapeHtml(siteUrl) : "";
  const ipRow =
    ip != null && String(ip).trim() !== ""
      ? `<tr>
  <td style="padding:10px 0;border-bottom:1px solid #e8eeeb;">
    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#7a8c85;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">IP</p>
    <p style="margin:6px 0 0;font-size:14px;color:#2d3d38;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${escapeHtml(String(ip))}</p>
  </td>
</tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nueva consulta web</title>
</head>
<body style="margin:0;padding:0;background-color:#e5eae7;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#e5eae7;">
<tr>
<td align="center" style="padding:28px 16px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #d8e0dc;">
<tr>
<td style="background:linear-gradient(135deg,#0f3d36 0%,#1a5c52 45%,#14a3a3 100%);padding:28px 32px 26px;">
<p style="margin:0 0 6px;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.75);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${brand}</p>
<h1 style="margin:0;font-size:22px;font-weight:700;line-height:1.25;color:#ffffff;font-family:Georgia,'Times New Roman',serif;">Nueva consulta desde la web</h1>
<p style="margin:12px 0 0;font-size:13px;color:rgba(255,255,255,0.88);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Referencia <strong style="color:#fff;">#${escapeHtml(String(id))}</strong></p>
</td>
</tr>
<tr>
<td style="padding:28px 32px 8px;">
<p style="margin:0 0 20px;font-size:15px;line-height:1.55;color:#3d4f49;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Alguien ha enviado el formulario de contacto. Puedes responder directamente a este correo para escribirle al visitante.</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td style="padding:10px 0;border-bottom:1px solid #e8eeeb;">
<p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#7a8c85;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Nombre</p>
<p style="margin:6px 0 0;font-size:16px;font-weight:600;color:#1a2e28;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${escapeHtml(nombre)}</p>
</td>
</tr>
<tr>
<td style="padding:10px 0;border-bottom:1px solid #e8eeeb;">
<p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#7a8c85;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Correo</p>
<p style="margin:6px 0 0;font-size:15px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;"><a href="mailto:${escapeHtml(email)}" style="color:#0c6b6b;text-decoration:none;font-weight:600;">${escapeHtml(email)}</a></p>
</td>
</tr>
${ipRow}
<tr>
<td style="padding:18px 0 0;">
<p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#7a8c85;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Mensaje</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f7faf8;border:1px solid #e0ebe6;border-radius:10px;">
<tr>
<td style="padding:18px 20px;font-size:15px;line-height:1.6;color:#2d3d38;font-family:Georgia,'Times New Roman',serif;white-space:pre-wrap;">${escapeHtml(mensaje)}</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding:0 32px 28px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:linear-gradient(90deg,rgba(20,163,163,0.12) 0%,rgba(232,93,76,0.08) 100%);border-radius:12px;border:1px solid rgba(20,163,163,0.25);">
<tr>
<td style="padding:16px 20px;">
<p style="margin:0;font-size:13px;line-height:1.5;color:#3d5a52;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;"><strong style="color:#0f3d36;">Responder</strong> — Usa “Responder” en tu cliente de correo; la respuesta debería ir al visitante gracias a la cabecera Reply-To.</p>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding:0 32px 32px;border-top:1px solid #eef2f0;">
<p style="margin:20px 0 0;font-size:12px;line-height:1.5;color:#8a9a94;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Este mensaje se generó automáticamente al enviar el formulario de contacto.${safeSite ? ` <a href="${safeSite}" style="color:#0c6b6b;text-decoration:underline;">Visitar sitio web</a>` : ""}</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;
}

function readContactMailEnv() {
  const host = process.env.SMTP_HOST?.trim();
  const notifyTo =
    process.env.CONTACT_NOTIFY_TO?.trim() || process.env.MAIL_TO?.trim();
  const user = process.env.SMTP_USER?.trim();
  const rawPass = process.env.SMTP_PASS;
  const pass =
    typeof rawPass === "string" ? rawPass.trim() : rawPass;
  const allowNoPass = process.env.SMTP_ALLOW_NO_PASS === "1";
  return { host, notifyTo, user, pass, allowNoPass };
}

/** Motivo por el que no se envía correo (para logs); null si la config es válida. */
export function getContactMailConfigIssue() {
  const { host, notifyTo, user, pass, allowNoPass } = readContactMailEnv();
  if (!host) return "falta SMTP_HOST";
  if (!notifyTo) return "falta CONTACT_NOTIFY_TO (o MAIL_TO)";
  if (!user && !allowNoPass) return "falta SMTP_USER (o SMTP_ALLOW_NO_PASS=1)";
  if ((pass === undefined || pass === "") && !allowNoPass)
    return "falta SMTP_PASS (contraseña del buzón noreply / SMTP)";
  return null;
}

export function getContactMailSettings() {
  if (getContactMailConfigIssue()) return null;
  const { host, notifyTo, user, pass, allowNoPass } = readContactMailEnv();
  return {
    host,
    notifyTo,
    user: user || "",
    pass: pass ?? "",
  };
}

export function isContactMailConfigured() {
  return getContactMailSettings() != null;
}

export function logContactMailStatus() {
  const issue = getContactMailConfigIssue();
  if (!issue) {
    console.log("Contact form: avisos por correo activos (SMTP)");
  } else {
    console.log("Contact form: avisos por correo desactivados — %s", issue);
  }
}

function buildContactTransporter(base) {
  const port = Number(process.env.SMTP_PORT || 587);
  const secureFlag = String(process.env.SMTP_SECURE ?? "").toLowerCase();
  const secure =
    process.env.SMTP_SECURE === "1" ||
    process.env.SMTP_SECURE === "true" ||
    secureFlag === "yes" ||
    port === 465;

  const requireTlsExplicit = process.env.SMTP_REQUIRE_TLS;
  const requireTLS =
    requireTlsExplicit === "0" || requireTlsExplicit === "false"
      ? false
      : !secure && port === 587;

  return nodemailer.createTransport({
    host: base.host,
    port,
    secure,
    requireTLS,
    auth: base.user ? { user: base.user, pass: base.pass } : undefined,
  });
}

/**
 * Comprueba usuario/contraseña/puerto contra el servidor SMTP (logs en consola).
 * No bloquea el arranque si falla.
 */
export async function verifyContactSmtpIfConfigured() {
  const base = getContactMailSettings();
  if (!base) return;
  try {
    const t = buildContactTransporter(base);
    await t.verify();
    console.log("[mail] SMTP: verificación OK (auth y puerto correctos)");
  } catch (err) {
    console.error(
      "[mail] SMTP verify falló — el formulario guardará mensajes pero no enviará correo:",
      err?.message || err
    );
    if (err?.code) console.error("[mail] código:", err.code);
    if (err?.responseCode != null)
      console.error("[mail] responseCode:", err.responseCode);
    if (err?.response) console.error("[mail] respuesta servidor:", err.response);
  }
}

/**
 * Envía aviso por correo. Si SMTP no está configurado, no hace nada.
 * @returns {Promise<{ sent?: boolean, skipped?: boolean }>}
 */
export async function sendContactFormNotification({ id, nombre, email, mensaje, ip }) {
  const base = getContactMailSettings();
  if (!base) return { skipped: true, reason: getContactMailConfigIssue() || "unknown" };

  const transporter = buildContactTransporter(base);

  const from =
    process.env.MAIL_FROM?.trim() ||
    (base.user ? `Casa Trinidad Viva <${base.user}>` : "Casa Trinidad Viva");

  const brandShort = getMailBrandName();
  const subject = `[${subjectSnippet(brandShort, 40)}] Consulta: ${subjectSnippet(nombre, 50)}`;
  const text = [
    `${brandShort} — Nueva consulta desde la web (ref. #${id}).`,
    "",
    `Nombre: ${nombre}`,
    `Email: ${email}`,
    ip ? `IP: ${ip}` : null,
    "",
    "Mensaje:",
    mensaje,
    "",
    "— Responde desde tu cliente de correo para contactar al visitante (Reply-To).",
  ]
    .filter(Boolean)
    .join("\n");

  const html = buildContactNotificationHtml({ id, nombre, email, mensaje, ip });

  const info = await transporter.sendMail({
    from,
    to: base.notifyTo,
    replyTo: email,
    subject,
    text,
    html,
  });

  return { sent: true, messageId: info?.messageId };
}
