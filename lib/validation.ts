import { z } from "zod";
import type { CommandKind } from "../types/game";

const characters = (value: string) => Array.from(value.normalize("NFC"));
const normalizeText = (value: string) => value.normalize("NFC").replace(/\s+/gu, " ").trim();
const hasControls = (value: string) => /[\p{Cc}\p{Cf}\p{Cs}]/u.test(value);
const text = (label: string, maximum: number) =>
  z
    .string({ error: `${label} est invalide.` })
    .refine((value) => characters(value).length <= maximum, `${label} est trop long.`)
    .refine(
      (value) => !hasControls(value.replace(/[\t\r\n]/g, "")),
      `${label} contient un caractère de contrôle.`,
    )
    .transform((value) => value.normalize("NFC"));
const integer = (label: string, minimum: number, maximum: number) =>
  z
    .number({ error: `${label} doit être un nombre.` })
    .int({ error: `${label} doit être un entier.` })
    .min(minimum, `${label} doit être au moins ${minimum}.`)
    .max(maximum, `${label} doit être au plus ${maximum}.`);

export const jsonObjectSchema = z.record(z.string(), z.unknown());
export const uuidSchema = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
export const opaqueTokenSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9_-]+$/);
export const usernameSchema = z
  .string({ error: "invalid_username" })
  .transform((value) => value.trim().normalize("NFC"))
  .refine((value) => /^[\p{L}\p{N}_-]{3,24}$/u.test(value), "invalid_username");
export const passwordSchema = z
  .string({ error: "invalid_password" })
  .min(10, "invalid_password")
  .max(128, "invalid_password");
export const credentialsSchema = z.strictObject({
  username: usernameSchema,
  password: passwordSchema,
});
export const guestSchema = z.strictObject({ username: usernameSchema });
export function authenticationError(error: z.ZodError): string {
  const field = error.issues[0]?.path[0];
  return field === "username"
    ? "invalid_username"
    : field === "password"
      ? "invalid_password"
      : "invalid_json";
}

const settingsFields = {
  name: text("Le nom", 60)
    .transform(normalizeText)
    .refine(
      (value) => characters(value).length >= 2,
      "Le nom doit contenir au moins deux caractères.",
    ),
  visibility: z.enum(["public", "code", "private"], { error: "La visibilité est invalide." }),
  language: z.enum(["fr", "en"], { error: "La langue est invalide." }),
  contentMode: z.enum(["text", "words", "custom"], { error: "Le contenu est invalide." }),
  customText: text("Le texte personnalisé", 6000).transform(normalizeText),
  length: integer("La longueur", 10, 200),
  durationSeconds: integer("La durée", 15, 600).nullable(),
  errorMode: z.enum(["free", "blocking"], { error: "Le mode d’erreur est invalide." }),
  gameMode: z.enum(["classic", "arcade"], { error: "Le mode de jeu est invalide." }),
  botCount: integer("Le nombre de bots", 0, 29),
  botLevel: z.enum(["easy", "medium", "hard"], { error: "Le niveau des bots est invalide." }),
  excludedCharacters: text("Les caractères exclus", 64)
    .refine((value) => !/\s/u.test(value), "Les espaces ne peuvent pas être exclus.")
    .transform((value) => Array.from(new Set(characters(value))).join("")),
  targets: z
    .array(z.enum(["accents", "numbers", "punctuation"]))
    .max(3, "Les cibles sont invalides.")
    .transform((value) => Array.from(new Set(value))),
  topic: z.enum(["everyday", "science", "gaming"], { error: "Le thème est invalide." }),
  targetWpm: integer("L’objectif MPM (mots par minute)", 10, 250).nullable(),
};
export const settingsPatchSchema = z.strictObject(settingsFields).partial();
export const roomSettingsSchema = z
  .strictObject(settingsFields)
  .superRefine((settings, context) => {
    if (settings.contentMode !== "custom") return;
    const count = settings.customText ? settings.customText.split(" ").length : 0;
    if (count < 10 || count > 200)
      context.addIssue({
        code: "custom",
        path: ["customText"],
        message: "Le texte personnalisé doit contenir entre 10 et 200 mots.",
      });
    const excluded = new Set(characters(settings.excludedCharacters));
    if (characters(settings.customText).some((character) => excluded.has(character)))
      context.addIssue({
        code: "custom",
        path: ["customText"],
        message: "Le texte personnalisé contient un caractère exclu.",
      });
  })
  .transform((settings) => ({
    ...settings,
    length:
      settings.contentMode === "custom" ? settings.customText.split(" ").length : settings.length,
  }));
export const previewSchema = z.strictObject({ settings: settingsPatchSchema });

export const inputOperationsSchema = z
  .array(
    z.discriminatedUnion("kind", [
      z.strictObject({ kind: z.literal("delete") }),
      z.strictObject({
        kind: z.literal("insert"),
        text: z
          .string()
          .transform((value) => value.normalize("NFC"))
          .refine(
            (value) =>
              characters(value).length >= 1 && characters(value).length <= 4 && !hasControls(value),
            "Le collage ou un lot de frappe trop long est refusé.",
          ),
      }),
    ]),
  )
  .min(1)
  .max(8)
  .refine(
    (operations) =>
      operations.reduce(
        (total, operation) =>
          total + (operation.kind === "insert" ? characters(operation.text).length : 0),
        0,
      ) <= 8,
    "Le collage ou un lot de frappe trop long est refusé.",
  );

const empty = z.strictObject({});
export const commandPayloadSchemas = {
  create: settingsPatchSchema,
  configure: settingsPatchSchema,
  join: z
    .strictObject({
      roomId: uuidSchema.optional(),
      code: z
        .string()
        .trim()
        .regex(/^[A-Z2-9]{6}$/i)
        .transform((value) => value.toUpperCase())
        .optional(),
      invitation: opaqueTokenSchema.optional(),
      role: z.enum(["participant", "spectator"]).optional(),
    })
    .refine(
      (payload) =>
        [payload.roomId, payload.code, payload.invitation].filter((value) => value !== undefined)
          .length === 1,
    ),
  sync: empty,
  ready: z.strictObject({ ready: z.boolean() }),
  start: empty,
  input: z.strictObject({
    raceId: uuidSchema,
    sequence: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
    operations: inputOperationsSchema,
  }),
  leave: z.strictObject({ successorId: uuidSchema.optional() }),
  kick: z.strictObject({ memberId: uuidSchema }),
  role: z.strictObject({ memberId: uuidSchema, role: z.enum(["participant", "spectator"]) }),
  invite: empty,
  rematch: empty,
  close: empty,
  ability: z.discriminatedUnion("ability", [
    z.strictObject({ raceId: uuidSchema, ability: z.literal("boost") }),
    z.strictObject({ raceId: uuidSchema, ability: z.literal("shield") }),
    z.strictObject({ raceId: uuidSchema, ability: z.literal("trap"), targetId: uuidSchema }),
  ]),
  quick: empty,
} satisfies Record<CommandKind, z.ZodType>;
export const commandSchema = z.strictObject({
  commandId: uuidSchema,
  kind: z.enum([
    "create",
    "join",
    "sync",
    "ready",
    "configure",
    "start",
    "input",
    "leave",
    "kick",
    "role",
    "invite",
    "rematch",
    "close",
    "ability",
    "quick",
  ]),
  roomId: uuidSchema.optional(),
  expectedVersion: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER).optional(),
  payload: jsonObjectSchema.optional(),
});

export const sessionDataSchema = z.object({
  user: z
    .object({ id: uuidSchema, username: usernameSchema, kind: z.enum(["account", "guest"]) })
    .nullable(),
  oauth: z.object({ github: z.boolean(), discord: z.boolean() }),
});
export const preferencesSchema = z.object({
  locale: z.enum(["fr", "en"]).catch("fr"),
  theme: z.enum(["light", "dark"]).catch("light"),
  reducedMotion: z.boolean().catch(false),
  sounds: z.boolean().catch(false),
  effects: z.boolean().catch(true),
  raceSounds: z.boolean().catch(false),
  soundVolume: z
    .number()
    .finite()
    .transform((value) => Math.max(0, Math.min(100, value)))
    .catch(35),
});
