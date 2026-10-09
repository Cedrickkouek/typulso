"use client";

import { configureRaceAudio, installRaceAudio } from "@/lib/client/race-audio";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { SessionData } from "@/types/game";
import { sessionDataSchema } from "@/lib/validation";
import { api } from "@/lib/client/api";
import { usePreferences } from "@/lib/client/preferences";

interface SessionState {
  session: SessionData | null;
  error: string | null;
}
const SessionContext = createContext<SessionState & { refresh: () => Promise<void> }>({
  session: null,
  error: null,
  refresh: async () => {},
});
export function Providers({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState: SessionState;
}) {
  const preferences = usePreferences();
  const [state, setState] = useState(initialState);
  const refresh = useCallback(async () => {
    try {
      const session = await api<SessionData>(
        "/api/session",
        undefined,
        undefined,
        sessionDataSchema,
      );
      setState({ session, error: null });
    } catch (error) {
      setState({ session: null, error: (error as Error).message });
    }
  }, []);
  useEffect(() => installRaceAudio(), []);
  useEffect(() => {
    configureRaceAudio({
      typing: preferences.sounds,
      events: preferences.raceSounds,
      volume: preferences.soundVolume,
    });
  }, [preferences.sounds, preferences.raceSounds, preferences.soundVolume]);
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
