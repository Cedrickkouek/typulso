"use client";

import { useSyncExternalStore } from "react";
import type { Locale } from "@/types/game";
import { preferencesSchema } from "../validation";

export interface Preferences {
  locale: Locale;
  theme: "light" | "dark";
  reducedMotion: boolean;
  sounds: boolean;
  effects: boolean;
  raceSounds: boolean;
  soundVolume: number;
}
const initial: Preferences = {
  locale: "fr",
  theme: "light",
  reducedMotion: false,
  sounds: false,
  effects: true,
  raceSounds: false,
  soundVolume: 35,
};
const key = "typulso.preferences.v1";
let current = initial;
let loaded = false;
const listeners = new Set<() => void>();
function getSnapshot() {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    try {
      const stored = JSON.parse(localStorage.getItem(key) || "null");
      const parsed = preferencesSchema.safeParse(stored);
      if (parsed.success) current = parsed.data;
    } catch {
      /* Preferences are optional when storage is unavailable. */
    }
  }
  return current;
}
const getServerSnapshot = () => initial;
function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === key) {
      loaded = false;
      getSnapshot();
      listeners.forEach((callback) => callback());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
export function updatePreferences(value: Partial<Preferences>) {
  current = preferencesSchema.parse({ ...getSnapshot(), ...value });
  try {
    localStorage.setItem(key, JSON.stringify(current));
  } catch {
    /* Keep the current tab usable. */
  }
  listeners.forEach((callback) => callback());
}
export function usePreferences() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
