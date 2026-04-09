const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export function parseContactPayload(body) {
  if (!body || typeof body !== "object") return { error: "invalid_body" };
  const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";
  const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
  const mensaje = typeof body.mensaje === "string" ? body.mensaje.trim() : "";
  const email = emailRaw.toLowerCase();
  if (!nombre || nombre.length > 200) return { error: "invalid_nombre" };
  if (!email || email.length > 320 || !EMAIL_RE.test(email)) return { error: "invalid_email" };
  if (!mensaje || mensaje.length > 8000) return { error: "invalid_mensaje" };
  return { nombre, email, mensaje };
}
