import nodemailer from "nodemailer";

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

  const subject = `[Contacto web] ${nombre}`;
  const text = [
    `Nueva consulta desde la web (id #${id}).`,
    "",
    `Nombre: ${nombre}`,
    `Email: ${email}`,
    ip ? `IP: ${ip}` : null,
    "",
    "Mensaje:",
    mensaje,
    "",
    "— Responder con “Responder” llegará al correo del visitante si tu cliente respeta Reply-To.",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <p>Nueva consulta desde la web <strong>#${escapeHtml(id)}</strong>.</p>
    <p><strong>Nombre:</strong> ${escapeHtml(nombre)}<br/>
    <strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a><br/>
    ${ip ? `<strong>IP:</strong> ${escapeHtml(ip)}<br/>` : ""}
    </p>
    <p><strong>Mensaje:</strong></p>
    <pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(mensaje)}</pre>
  `.trim();

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
