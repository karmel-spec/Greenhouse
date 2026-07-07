"use client";

/**
 * Rotating garden inspiration shown at the top and bottom of every section.
 * The pick differs per section and slot, and gently advances every 45s.
 */

import { useEffect, useState } from "react";
import { INSPIRATIONS, inspirationIndex } from "@/lib/inspiration";

export function InspirationBanner({ section, slot }: { section: string; slot: "top" | "bottom" }) {
  const [offset, setOffset] = useState(() => Math.floor(Date.now() / (45 * 60_000)));
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setOffset((current) => current + 1);
        setFading(false);
      }, 400);
    }, 45_000);
    return () => clearInterval(timer);
  }, []);

  const entry = INSPIRATIONS[inspirationIndex(`${section}-${slot}`, offset)];

  return (
    <aside className={`inspiration-banner ${slot} ${fading ? "fading" : ""}`} aria-live="polite">
      <span className="inspiration-mark">{entry.kind === "scripture" ? "✦" : "❧"}</span>
      <p>
        “{entry.text}” <cite>— {entry.source}</cite>
      </p>
    </aside>
  );
}
