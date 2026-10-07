import type { RoomSettings } from "../../types/game";

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

function invalid(message: string): never {
  throw new DomainError("INVALID_SETTINGS", message);
}

function integer(value: unknown, key: string, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    invalid(`${key} doit être un entier entre ${min} et ${max}.`);
  }
  return value;
}

function enumValue<T extends string>(value: unknown, values: readonly T[], key: string): T {
  if (typeof value !== "string" || !values.includes(value as T)) invalid(`${key} est invalide.`);
  return value as T;
}

function stringValue(value: unknown, key: string, maxLength: number): string {
  if (typeof value !== "string" || codepoints(value).length > maxLength) {
    invalid(`${key} est trop long ou invalide.`);
  }
  // NUL, invisible format controls and unpaired UTF-16 surrogates are not content.
  if (/[\p{Cc}\p{Cf}\p{Cs}]/u.test(value.replace(/[\t\r\n]/g, ""))) {
    invalid(`${key} contient un caractère de contrôle.`);
  }
  return value.normalize("NFC");
}

/** Validate a partial update without coercing attacker-controlled input. Length is in words. */
export function validateSettings(
  input: unknown,
  base: RoomSettings = defaultSettings,
): RoomSettings {
  if (!input || typeof input !== "object" || Array.isArray(input)) invalid("Réglages invalides.");
  const record = input as Record<string, unknown>;
  const allowed = Object.keys(defaultSettings);
  for (const key of Object.keys(record)) {
    if (!allowed.includes(key)) invalid(`Réglage inconnu : ${key}.`);
  }
  const values: Record<string, unknown> = { ...base, ...record };
  const name = normalizeText(stringValue(values.name, "Le nom", 60));
  if (codepoints(name).length < 2) invalid("Le nom doit contenir au moins deux caractères.");
  const language = enumValue(values.language, ["fr", "en"], "La langue");
  const contentMode = enumValue(values.contentMode, ["text", "words", "custom"], "Le contenu");
  const customText = normalizeText(stringValue(values.customText, "Le texte personnalisé", 6000));
  let length = integer(values.length, "La longueur", 10, 200);
  const excludedRaw = stringValue(values.excludedCharacters, "Les caractères exclus", 64);
  if (/\s/u.test(excludedRaw)) invalid("Les espaces ne peuvent pas être exclus.");
  const excludedCharacters = Array.from(new Set(codepoints(excludedRaw))).join("");
  const durationSeconds =
    values.durationSeconds === null ? null : integer(values.durationSeconds, "La durée", 15, 600);
  const targetWpm =
    values.targetWpm === null
      ? null
      : integer(values.targetWpm, "L'objectif MPM (mots par minute)", 10, 250);
  if (!Array.isArray(values.targets) || values.targets.length > 3)
    invalid("Les cibles sont invalides.");
  const targets = Array.from(
    new Set(
      values.targets.map((target) =>
        enumValue<RoomSettings["targets"][number]>(
          target,
          ["accents", "numbers", "punctuation"],
          "La cible",
        ),
      ),
    ),
  );
  if (contentMode === "custom") {
    if (!customText) invalid("Ajoute un texte personnalisé.");
    length = customText.split(" ").length;
    integer(length, "La longueur du texte personnalisé", 10, 200);
    const excluded = new Set(codepoints(excludedCharacters));
    if (codepoints(customText).some((character) => excluded.has(character))) {
      invalid("Le texte personnalisé contient un caractère exclu.");
    }
  }
  return {
    name,
    visibility: enumValue(values.visibility, ["public", "code", "private"], "La visibilité"),
    language,
    contentMode,
    customText,
    length,
    durationSeconds,
    errorMode: enumValue(values.errorMode, ["free", "blocking"], "Le mode d'erreur"),
    gameMode: enumValue(values.gameMode, ["classic", "arcade"], "Le mode de jeu"),
    botCount: integer(values.botCount, "Le nombre de bots", 0, 29),
    botLevel: enumValue(values.botLevel, ["easy", "medium", "hard"], "Le niveau des bots"),
    excludedCharacters,
    targets,
    topic: enumValue(values.topic, ["everyday", "science", "gaming"], "Le thème"),
    targetWpm,
  };
}

export const validateRoomSettings = validateSettings;
