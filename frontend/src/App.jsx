import React, { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import RoomsPage from "./pages/RoomsPage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import TravelGuidePage from "./pages/TravelGuidePage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import LegalPrivacyPage from "./pages/LegalPrivacyPage.jsx";
import LegalTermsPage from "./pages/LegalTermsPage.jsx";
import LegalCookiesPage from "./pages/LegalCookiesPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import AdminEditorPage from "./pages/AdminEditorPage.jsx";
import { useSession } from "./lib/SessionProvider.jsx";
import i18n from "./i18n/config.js";

const DEFAULT_ROBOTS =
  "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

function SeoRouteEffects() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  const pathNorm = pathname.replace(/\/$/, "") || "/";
  const isLandingOnly = pathNorm === "/" || pathNorm === "/en";

  useEffect(() => {
    if (isAdmin) return;
    const wantsEn = pathname === "/en" || pathname.startsWith("/en/");
    const lng = wantsEn ? "en" : "es";
    document.documentElement.lang = lng;
    if (i18n.language !== lng) void i18n.changeLanguage(lng);
  }, [pathname, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      document.title = "Admin · Casa Trinidad Viva";
      return;
    }
    if (!isLandingOnly) return;
    const syncTitle = () => {
      document.title = i18n.t("seo.title");
    };
    syncTitle();
    i18n.on("languageChanged", syncTitle);
    return () => i18n.off("languageChanged", syncTitle);
  }, [isAdmin, isLandingOnly]);

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
      <Route path="/en" element={<LandingPage lang="en" />} />
      <Route path="/en/rooms" element={<RoomsPage lang="en" />} />
      <Route path="/en/services" element={<ServicesPage lang="en" />} />
      <Route path="/en/about" element={<AboutPage lang="en" />} />
      <Route path="/en/travel-guide" element={<TravelGuidePage lang="en" />} />
      <Route path="/en/contact" element={<ContactPage lang="en" />} />
      <Route path="/en/privacy" element={<LegalPrivacyPage lang="en" />} />
      <Route path="/en/terms" element={<LegalTermsPage lang="en" />} />
      <Route path="/en/cookies" element={<LegalCookiesPage lang="en" />} />
      <Route path="/" element={<LandingPage lang="es" />} />
      <Route path="/habitaciones" element={<RoomsPage lang="es" />} />
      <Route path="/servicios" element={<ServicesPage lang="es" />} />
      <Route path="/sobre-nosotros" element={<AboutPage lang="es" />} />
      <Route path="/guia-del-viajero" element={<TravelGuidePage lang="es" />} />
      <Route path="/contacto" element={<ContactPage lang="es" />} />
      <Route path="/privacidad" element={<LegalPrivacyPage lang="es" />} />
      <Route path="/terminos" element={<LegalTermsPage lang="es" />} />
      <Route path="/cookies" element={<LegalCookiesPage lang="es" />} />
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

