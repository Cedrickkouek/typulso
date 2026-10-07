"use client";

import type { PointerEventHandler } from "react";
import { graphemes } from "@/lib/client/typing-engine";
import { peerCursorIndex } from "@/lib/client/peer-cursor";
import type { PlayerSnapshot } from "@/types/game";
import { useTranslation } from "./providers";

const colors = ["var(--accent)", "var(--pink)", "var(--lavender)", "var(--sky)", "var(--coral)"];

export function TypingPassage({
  text,
  value,
  players = [],
  selfId,
  onPointerDown,
}: {
  text: string;
  value?: string;
  players?: PlayerSnapshot[];
  selfId?: string;
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
}) {
  const { t } = useTranslation();
  const typed = graphemes(value ?? "");
  const sample = graphemes(text);
  const peers = players
    .filter((player) => player.role === "participant" && player.status !== "left")
    .sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id))
    .map((player, index) => ({
      player,
      color: colors[index % colors.length],
      cursor: peerCursorIndex(text, player.progress),
    }))
    .filter(({ player }) => player.id !== selfId);
  const positions = new Map<number, typeof peers>();
  for (const peer of peers) {
    const anchor = peer.cursor;
    const group = positions.get(anchor) ?? [];
    group.push(peer);
    positions.set(anchor, group);
  }
  function renderMarkers(group: typeof peers, end = false) {
    if (!group.length) return null;
    return (
      <span className="peer-cursor" data-end={end || undefined}>
        <span className="peer-cursor-labels">
          {group.slice(0, 2).map(({ player, color }) => (
            <span
              className="peer-cursor-initial"
              key={player.id}
              style={{ background: color }}
              title={player.username}
            >
              {graphemes(player.username)[0]?.toUpperCase() || "?"}
            </span>
          ))}
          {group.length > 2 && <span className="peer-cursor-extra">+{group.length - 2}</span>}
        </span>
        <span className="peer-cursor-stem" style={{ background: group[0].color }} />
      </span>
    );
  }
  let index = 0;
  const words = (text.match(/\S+\s*|\s+/g) || []).map((word) =>
    graphemes(word).map((char) => ({ char, index: index++ })),
  );
  return (
    <>
      <div
        className={`typing-text ${peers.length ? "typing-text-with-peers" : ""}`}
        aria-hidden="true"
        onPointerDown={onPointerDown}
      >
        {words.map((word, wordIndex) => (
          <span className="typing-word" key={wordIndex}>
            {word.map(({ char, index }) => {
              const group = positions.get(index) ?? [];
              return (
                <span
                  key={index}
                  className={`typing-character ${value !== undefined && index < typed.length ? (typed[index] === char ? "correct" : "error") : ""} ${value !== undefined && index === typed.length ? "cursor" : ""} ${value !== undefined && typed.length >= sample.length && index === sample.length - 1 ? "end-cursor" : ""}`}
                >
                  {renderMarkers(group)}
                  {index === sample.length - 1 &&
                    renderMarkers(positions.get(sample.length) ?? [], true)}
                  {char}
                </span>
              );
            })}
          </span>
        ))}
      </div>
      {peers.length > 0 && (
        <div
          className="peer-cursor-legend"
          aria-label={t(
            "Position des autres joueurs dans le texte",
            "Other players’ positions in the text",
          )}
        >
          {peers.map(({ player, color }) => (
            <span className="peer-player" key={player.id}>
              <span
                className="peer-player-initial"
                style={{ background: color }}
                aria-hidden="true"
              >
                {graphemes(player.username)[0]?.toUpperCase() || "?"}
              </span>
              <span>{player.username}</span>
              <span className="peer-player-progress">
                {Math.round(player.progress)} %
                {!player.connected ? t(" · hors ligne", " · offline") : ""}
              </span>
            </span>
          ))}
        </div>
      )}
    </>
  );
}
