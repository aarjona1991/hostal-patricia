import React, { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import AdminEditorPage from "./pages/AdminEditorPage.jsx";
import { useSession } from "./lib/SessionProvider.jsx";

const DEFAULT_TITLE = "Casa Trinidad Viva | Hostal en Trinidad, Cuba — Reserva";
const DEFAULT_ROBOTS =
  "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

function SeoRouteEffects() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    document.title = isAdmin ? "Admin · Casa Trinidad Viva" : DEFAULT_TITLE;
  }, [isAdmin]);

  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]');
    if (!meta) return;
    if (!meta.hasAttribute("data-default-robots")) {
      meta.setAttribute("data-default-robots", meta.getAttribute("content") || DEFAULT_ROBOTS);
    }
    const restore = meta.getAttribute("data-default-robots") || DEFAULT_ROBOTS;
    meta.setAttribute("content", isAdmin ? "noindex, nofollow" : restore);
  }, [isAdmin]);

  return null;
}

export default function App() {
  const { status } = useSession();

  return (
    <>
      <SeoRouteEffects />
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          status === "authenticated" ? (
            <AdminEditorPage />
          ) : status === "loading" ? (
            <div style={{ padding: 24 }}>Cargando…</div>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

