"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { SessionUser } from "@/types/game";
import { api } from "@/lib/client/api";
import { usePreferences } from "@/lib/client/preferences";

interface Session {
  user: SessionUser | null;
  oauth: { github: boolean; discord: boolean };
}
const SessionContext = createContext<{
  session: Session | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}>({ session: null, loading: true, error: null, refresh: async () => {} });
export function Providers({ children }: { children: React.ReactNode }) {
  const preferences = usePreferences();
  const [state, setState] = useState<{
    session: Session | null;
    loading: boolean;
    error: string | null;
  }>({ session: null, loading: true, error: null });
  const refresh = useCallback(async () => {
    try {
      const session = await api<Session>("/api/session");
      setState({ session, loading: false, error: null });
    } catch (error) {
      setState({ session: null, loading: false, error: (error as Error).message });
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    api<Session>("/api/session", undefined, controller.signal)
      .then((session) => setState({ session, loading: false, error: null }))
      .catch((error) => {
        if (error.name !== "AbortError")
          setState({ session: null, loading: false, error: error.message });
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.lang = preferences.locale;
    document.documentElement.dataset.motion = preferences.reducedMotion ? "reduced" : "full";
    document.documentElement.dataset.effects = preferences.effects ? "on" : "off";
  }, [preferences]);
  return <SessionContext value={{ ...state, refresh }}>{children}</SessionContext>;
}
export const useSession = () => useContext(SessionContext);
export function useTranslation() {
  const preferences = usePreferences();
  return { ...preferences, t: (fr: string, en: string) => (preferences.locale === "en" ? en : fr) };
}
