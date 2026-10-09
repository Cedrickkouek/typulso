import type { RoomSettings } from "../../types/game";
import { roomSettingsSchema, settingsPatchSchema } from "../validation";

export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export const defaultSettings: RoomSettings = {
  name: "Nouvelle course",
  visibility: "code",
  language: "fr",
  contentMode: "text",
  customText: "",
  length: 50,
  durationSeconds: 60,
  errorMode: "blocking",
  gameMode: "classic",
  botCount: 0,
  botLevel: "medium",
  excludedCharacters: "",
  targets: ["accents", "punctuation"],
  topic: "everyday",
  targetWpm: null,
};

export function codepoints(value: string): string[] {
  return Array.from(value.normalize("NFC"));
}

export function normalizeText(value: string): string {
  return value.normalize("NFC").replace(/\s+/gu, " ").trim();
}

/** Validate a partial update without coercing attacker-controlled input. Length is in words. */
export function validateSettings(
  input: unknown,
  base: RoomSettings = defaultSettings,
): RoomSettings {
  const patch = settingsPatchSchema.safeParse(input);
  if (!patch.success) throw new DomainError("INVALID_SETTINGS", patch.error.issues[0].message);
  const result = roomSettingsSchema.safeParse({ ...base, ...patch.data });
  if (!result.success) throw new DomainError("INVALID_SETTINGS", result.error.issues[0].message);
  return result.data;
}

export const validateRoomSettings = validateSettings;
