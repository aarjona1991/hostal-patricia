import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api.js";

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [status, setStatus] = useState("loading"); // loading | authenticated | anonymous

  useEffect(() => {
    let mounted = true;
    apiFetch("/api/auth/me")
      .then((data) => {
        if (mounted) setStatus(data?.user ? "authenticated" : "anonymous");
      })
      .catch(() => {
        if (mounted) setStatus("anonymous");
      });
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(() => ({ status, setStatus }), [status]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}

