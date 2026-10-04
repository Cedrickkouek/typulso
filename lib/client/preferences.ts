"use client";

import { useSyncExternalStore } from "react";
import type { Locale } from "@/types/game";

export interface Preferences {
  locale: Locale;
  theme: "light" | "dark";
  reducedMotion: boolean;
  sounds: boolean;
  effects: boolean;
}
const initial: Preferences = {
  locale: "fr",
  theme: "light",
  reducedMotion: false,
  sounds: false,
  effects: true,
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
      if (stored)
        current = {
          locale: stored.locale === "en" ? "en" : "fr",
          theme: stored.theme === "dark" ? "dark" : "light",
          reducedMotion: stored.reducedMotion === true,
          sounds: stored.sounds === true,
          effects: stored.effects !== false,
        };
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
  current = { ...getSnapshot(), ...value };
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

export function playFeedback(enabled: boolean) {
  if (!enabled || typeof window === "undefined") return;
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = 520;
  gain.gain.value = 0.035;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.09);
  oscillator.stop(context.currentTime + 0.1);
  oscillator.onended = () => {
    void context.close();
  };
}
