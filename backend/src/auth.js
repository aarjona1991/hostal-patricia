import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "hp_admin";

function getJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("Missing JWT_SECRET");
  return s;
}

export function issueAuthCookie(res, payload, req) {
  const token = jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
  const https =
    process.env.NODE_ENV === "production" ||
    (req?.secure ?? false) ||
    (typeof req?.get === "function" && req.get("x-forwarded-proto") === "https");
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: !!https,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

/** Sesión opcional (sin 401): para GET /api/auth/me desde el navegador. */
export function getOptionalAuthUser(req) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return null;
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    const payload = jwt.verify(token, secret);
    return { sub: payload.sub, role: payload.role || "admin" };
  } catch {
    return null;
  }
}

export function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: "unauthorized" });
    req.user = jwt.verify(token, getJwtSecret());
    return next();
  } catch {
    return res.status(401).json({ error: "unauthorized" });
  }
}

export async function verifyLogin({ username, password }) {
  const expectedUser = process.env.ADMIN_USERNAME || "admin";
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) throw new Error("Missing ADMIN_PASSWORD_HASH");
  if (username !== expectedUser) return false;
  return bcrypt.compare(password, hash);
}

