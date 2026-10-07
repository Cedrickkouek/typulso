import { graphemes } from "./typing-engine";

/** Server progress counts normalized code points; displayed text uses grapheme clusters. */
export function peerCursorIndex(text: string, progress: number): number {
  const normalized = text.normalize("NFC");
  const points = Array.from(normalized).length;
  const offset = Math.round(
    (Math.max(0, Math.min(100, Number.isFinite(progress) ? progress : 0)) * points) / 100,
  );
  let consumed = 0;
  let index = 0;
  for (const cluster of graphemes(normalized)) {
    if (consumed >= offset) break;
    consumed += Array.from(cluster).length;
    index++;
  }
  return index;
}
