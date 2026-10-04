import type { RoomSettings } from "@/types/game";
export const defaultSettings: RoomSettings = {
  name: "Le sprint des mots",
  visibility: "code",
  language: "fr",
  contentMode: "text",
  customText: "",
  length: 60,
  durationSeconds: 60,
  errorMode: "free",
  gameMode: "classic",
  botCount: 0,
  botLevel: "medium",
  excludedCharacters: "",
  targets: [],
  topic: "everyday",
  targetWpm: null,
};
