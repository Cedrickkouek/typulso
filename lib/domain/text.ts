import type { RoomSettings } from "../../types/game";
import { codepoints, DomainError, normalizeText, validateSettings } from "./settings";

// Original short passages; generation only uses these local banks and explicit rules.
const passages = {
  fr: {
    everyday: [
      "Le matin, Nora ouvre la fenêtre et écoute les oiseaux du quartier.",
      "Après le repas, ses amis préparent une promenade près de la rivière.",
      "Une petite librairie accueille les lecteurs avec un fauteuil et du thé.",
      "Le jardin pousse tranquillement pendant que la ville retrouve son énergie.",
      "Une nouvelle recette transforme les légumes du marché en dîner délicieux.",
      "Dans le train, Malik observe les paysages et raconte son dernier voyage.",
    ],
    science: [
      "La lumière traverse le prisme et révèle une série de couleurs différentes.",
      "Une équipe observe les étoiles pour mieux comprendre le mouvement des planètes.",
      "Le laboratoire compare les résultats puis vérifie chaque mesure avec précision.",
      "Les racines absorbent de l'eau et nourrissent les feuilles de la plante.",
      "Un robot explore le terrain pendant que ses capteurs enregistrent la température.",
      "La curiosité nous invite à poser des questions et à tester nos idées.",
    ],
    gaming: [
      "Notre équipe traverse la forêt puis cherche une clé derrière le château.",
      "La joueuse protège son équipier et prépare une stratégie pour le prochain tour.",
      "Un nouveau niveau propose des chemins secrets et une énigme à résoudre.",
      "Le groupe partage ses ressources pour réparer le véhicule avant la course.",
      "Chaque défi demande de la patience, de la précision et un peu de créativité.",
      "La victoire arrive après plusieurs essais et une dernière action bien coordonnée.",
    ],
  },
  en: {
    everyday: [
      "Nora opens the window and listens to the birds across the quiet street.",
      "After lunch, her friends plan a walk beside the river near their school.",
      "A small bookshop welcomes readers with a soft chair and a warm drink.",
      "The garden grows slowly while the city begins another bright and busy day.",
      "A new recipe turns fresh vegetables from the market into a delicious meal.",
      "On the train, Malik watches the landscape and tells a story about his trip.",
    ],
    science: [
      "Light passes through a prism and reveals a clear pattern of different colours.",
      "A team studies the stars to understand how distant planets move through space.",
      "The laboratory compares its results and checks every measurement with careful attention.",
      "Roots absorb water from the soil and provide food for the growing leaves.",
      "A robot explores the ground while its sensors record the changing temperature.",
      "Curiosity encourages us to ask useful questions and test our ideas with evidence.",
    ],
    gaming: [
      "Our team crosses the forest and searches for a key behind the castle.",
      "The player protects a teammate and prepares a strategy for the next round.",
      "A new level offers hidden paths and a puzzle that takes teamwork to solve.",
      "The group shares its resources to repair the vehicle before the race begins.",
      "Each challenge requires patience, careful timing and a little bit of creative thinking.",
      "Victory comes after several attempts and one final action planned by the entire team.",
    ],
  },
} as const;

const words = {
  fr: {
    everyday:
      "maison ami chemin jardin livre tasse fenêtre matin soleil marche sourire cuisine rivière vélo famille musique école marché couleur voyage",
    science:
      "atome plante lumière planète étoile mesure force énergie cristal méthode nature matière signal racine liquide robot circuit idée résultat expérience",
    gaming:
      "joueur équipe niveau quête coffre victoire stratégie forêt château défi écran course clé potion tournoi groupe carte véhicule royaume aventure",
  },
  en: {
    everyday:
      "house friend path garden book cup window morning sunshine walk smile kitchen river bicycle family music school market colour journey",
    science:
      "atom plant light planet star measure force energy crystal method nature matter signal root liquid robot circuit idea result experiment",
    gaming:
      "player team level quest chest victory strategy forest castle challenge screen race key potion tournament group map vehicle kingdom adventure",
  },
} as const;

const accented = {
  fr: ["équipe", "rivière", "forêt", "énergie", "créativité", "école", "été", "vélo"],
  en: ["café", "résumé", "naïve", "déjà"],
};
const numbers = ["12", "24", "37", "56", "80", "90", "2026", "314"];
const punctuation = [".", ",", "!", "?", ":", ";"];

// Each targeted opening has ten words. Accent/number targets stay inside a complete sentence.
const openings = {
  fr: {
    everyday: "Au café, Léa regarde {quantity} étoiles avec sa meilleure amie.",
    science: "Une équipe note {quantity} idées avant une nouvelle expérience scientifique.",
    gaming: "Notre équipe découvre {quantity} trésors dans une forêt encore inexplorée.",
  },
  en: {
    everyday: "The café serves {quantity} meals while our friends plan adventures.",
    science: "A naïve robot counts {quantity} stars beyond our quiet garden.",
    gaming: "Our team explores {quantity} cafés while seeking the hidden treasure.",
  },
} as const;

function hasAccent(value: string): boolean {
  return /\p{M}/u.test(value.normalize("NFD"));
}

function permitted(value: string, excluded: Set<string>): boolean {
  return !codepoints(value).some((character) => excluded.has(character));
}

function prepare(value: string, settings: RoomSettings): string {
  let result = value;
  if (!settings.targets.includes("accents"))
    result = result.normalize("NFD").replace(/\p{M}/gu, "");
  if (!settings.targets.includes("punctuation")) result = result.replace(/\p{P}/gu, "");
  return normalizeText(result);
}

/** A seeded PRNG lets the server vary exercises without any implicit randomness or IO. */
export function seededRandom(seed: number): () => number {
  let state = Number.isFinite(seed) ? seed >>> 0 : 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function impossible(): never {
  throw new DomainError(
    "IMPOSSIBLE_CONTENT",
    "Les exclusions empêchent de produire ce contenu et ses cibles.",
  );
}

/** Returns one immutable NFC exercise of exactly `length` words, except custom text kept intact. */
export function generateText(input: RoomSettings, seed = 1): string {
  const settings = validateSettings(input);
  if (settings.contentMode === "custom") return settings.customText;
  const excluded = new Set(codepoints(settings.excludedCharacters));
  const random = seededRandom(seed);
  const pick = <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)]!;
  const numberCandidates = numbers.filter((number) => permitted(number, excluded));
  if (settings.targets.includes("numbers") && !numberCandidates.length) impossible();
  let tokens: string[];
  if (settings.contentMode === "text") {
    // Drop whole passages to keep language coherent; never silently remove a prohibited letter.
    const candidates = passages[settings.language][settings.topic]
      .map((passage) => prepare(passage, settings))
      .filter((passage) => permitted(passage, excluded));
    if (!candidates.length) impossible();
    const quantity = settings.targets.includes("numbers")
      ? pick(numberCandidates)
      : settings.language === "fr"
        ? "plusieurs"
        : settings.topic === "everyday"
          ? "fresh"
          : "many";
    const opening = prepare(
      openings[settings.language][settings.topic].replace("{quantity}", quantity),
      settings,
    );
    tokens = permitted(opening, excluded) ? opening.split(" ") : [];
    // Do not destroy sentence grammar by replacing arbitrary words with numeric targets.
    if (settings.targets.includes("numbers") && !tokens.length) impossible();
    while (tokens.length < settings.length) tokens.push(...pick(candidates).split(" "));
    tokens = tokens.slice(0, settings.length);
  } else {
    const candidates = words[settings.language][settings.topic]
      .split(" ")
      .map((word) => prepare(word, settings))
      .filter((word) => permitted(word, excluded));
    if (!candidates.length) impossible();
    tokens = Array.from({ length: settings.length }, () => pick(candidates));
  }
  if (settings.targets.includes("numbers") && !tokens.some((token) => /\d/u.test(token))) {
    tokens[tokens.length - 2] = pick(numberCandidates);
  }
  if (settings.targets.includes("accents") && !tokens.some(hasAccent)) {
    if (settings.contentMode === "text") impossible();
    const candidates = accented[settings.language].filter((word) => permitted(word, excluded));
    if (!candidates.length) impossible();
    // English accented loan words are explicit practice targets, not an automatic translation.
    tokens[1] = pick(candidates);
  }
  if (settings.targets.includes("punctuation")) {
    const candidates = punctuation.filter((mark) => permitted(mark, excluded));
    if (!candidates.length) impossible();
    if (!/\p{P}/u.test(tokens.join(" "))) tokens[tokens.length - 1] += pick(candidates);
  }
  const text = normalizeText(tokens.join(" "));
  if (!permitted(text, excluded)) impossible();
  return text;
}
