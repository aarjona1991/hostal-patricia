import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "hp_admin";

function getJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("Missing JWT_SECRET");
  return s;
}

export function issueAuthCookie(res, payload) {
  const token = jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
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

