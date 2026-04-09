import nodemailer from "nodemailer";

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getContactMailSettings() {
  const host = process.env.SMTP_HOST?.trim();
  const notifyTo = process.env.CONTACT_NOTIFY_TO?.trim() || process.env.MAIL_TO?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  const allowNoPass = process.env.SMTP_ALLOW_NO_PASS === "1";
  if (!host || !notifyTo) return null;
  if (!user && !allowNoPass) return null;
  if ((pass === undefined || pass === "") && !allowNoPass) return null;
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
  if (isContactMailConfigured()) {
    console.log("Contact form: email notifications enabled (SMTP)");
  } else {
    console.log(
      "Contact form: email notifications disabled — set SMTP_HOST, SMTP_USER, SMTP_PASS, CONTACT_NOTIFY_TO"
    );
  }
}

/**
 * Envía aviso por correo. Si SMTP no está configurado, no hace nada.
 * @returns {Promise<{ sent?: boolean, skipped?: boolean }>}
 */
export async function sendContactFormNotification({ id, nombre, email, mensaje, ip }) {
  const base = getContactMailSettings();
  if (!base) return { skipped: true };

  const port = Number(process.env.SMTP_PORT || 587);
  const secureFlag = String(process.env.SMTP_SECURE ?? "").toLowerCase();
  const secure =
    process.env.SMTP_SECURE === "1" ||
    process.env.SMTP_SECURE === "true" ||
    secureFlag === "yes" ||
    port === 465;

  const transporter = nodemailer.createTransport({
    host: base.host,
    port,
    secure,
    auth: base.user ? { user: base.user, pass: base.pass } : undefined,
  });

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

  await transporter.sendMail({
    from,
    to: base.notifyTo,
    replyTo: email,
    subject,
    text,
    html,
  });

  return { sent: true };
}
