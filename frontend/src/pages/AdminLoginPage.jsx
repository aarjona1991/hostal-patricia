import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { useSession } from "../lib/SessionProvider.jsx";
import "../styles/admin.css";

export default function AdminLoginPage() {
  const nav = useNavigate();
  const { refreshSession } = useSession();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      await refreshSession();
      nav("/admin", { replace: true });
    } catch (e2) {
      setErr(e2.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="adm-root adm-login-page">
      <div className="adm-login-card">
        <div className="adm-login-brand">
          <div className="adm-login-logo" aria-hidden>
            ✦
          </div>
          <div>
            <h1>Acceso al panel</h1>
            <p>Casa Trinidad Viva · administración</p>
          </div>
        </div>

        <form onSubmit={onSubmit}>
          {err ? <div className="adm-alert-error">{err}</div> : null}

          <div className="adm-field">
            <label htmlFor="adm-user">Usuario</label>
            <input id="adm-user" className="adm-input" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="adm-field">
            <label htmlFor="adm-pass">Contraseña</label>
            <input
              id="adm-pass"
              type="password"
              className="adm-input"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button disabled={loading} type="submit" className="adm-btn adm-btn-primary">
            {loading ? "Entrando…" : "Entrar al panel"}
          </button>
        </form>

        <p style={{ marginTop: "1.5rem", marginBottom: 0, textAlign: "center" }}>
          <Link to="/" className="adm-link-preview" style={{ display: "inline-flex", border: "none", background: "rgba(255,255,255,0.06)" }}>
            ← Volver al sitio
          </Link>
        </p>
      </div>
    </div>
  );
}
