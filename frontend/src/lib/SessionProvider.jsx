import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api.js";

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [status, setStatus] = useState("loading"); // loading | authenticated | anonymous
  const [features, setFeatures] = useState(null);

  async function refreshSession() {
    try {
      const data = await apiFetch("/api/auth/me");
      setStatus(data?.user ? "authenticated" : "anonymous");
      setFeatures(data?.user && data?.features ? data.features : null);
    } catch {
      setStatus("anonymous");
      setFeatures(null);
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiFetch("/api/auth/me");
        if (!mounted) return;
        setStatus(data?.user ? "authenticated" : "anonymous");
        setFeatures(data?.user && data?.features ? data.features : null);
      } catch {
        if (!mounted) return;
        setStatus("anonymous");
        setFeatures(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({ status, features, setStatus, refreshSession }),
    [status, features]
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}

