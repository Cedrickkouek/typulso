"use client";
import { useState } from "react";
import { TypingZone } from "@/components/typing-zone";
import type { PlayerSnapshot } from "@/types/game";
export default function Page() {
  const [position, setPosition] = useState(25);
  const players: PlayerSnapshot[] = [0, position, 70, 100].map((progress, index) => ({
    id: `demo-${index}`, username: ["Moi", "Lina", "Noé", "Zoé"][index], kind: "bot", role: "participant",
    ready: true, connected: true, joinedAt: index, progress, correct: 0, errors: 0,
    corrections: 0, wpm: 0, accuracy: 100, finished: progress === 100,
    energy: 100, abilityUsed: false, status: progress === 100 ? "finished" : "active",
  }));
  return <div className="race-interface"><p>Démonstration temporaire — données fictives</p><div className="actions"><button className="subtle" onClick={() => setPosition(50)}>Avancer Lina</button><button className="subtle" onClick={() => setPosition(10)}>Reculer Lina</button></div><section className="panel"><TypingZone text="Bonjour la bande ! Chaque touche ouvre une nouvelle possibilité. Trouve ton rythme et garde les yeux sur les mots." blocking={false} players={players} selfId="demo-0" /></section></div>;
}
