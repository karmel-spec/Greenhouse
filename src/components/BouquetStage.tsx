"use client";

/**
 * The bouquet renderer, ported faithfully from Codex's design handoff
 * (Desktop/bouquet design/bouquet-design-handoff.md): flowers on thin stems
 * with deterministic natural variation, watercolor washes behind each bloom,
 * a translucent glass vase, and a soft sun-glow. Every bouquet is beautiful,
 * whether it has 3 flowers or 20 — the empty state shows gentle ghosts.
 */

export type StageFlower = { emoji: string; title?: string };

/** Watercolor wash per bloom, from the handoff's flower mapping. */
const WASHES: Record<string, string> = {
  "🌻": "rgba(231, 189, 79, 0.42)",
  "🌷": "rgba(233, 137, 126, 0.38)",
  "🌼": "rgba(252, 232, 142, 0.36)",
  "🌿": "rgba(133, 181, 204, 0.38)",
  "🌱": "rgba(118, 153, 89, 0.34)",
  "🌸": "rgba(247, 168, 188, 0.35)",
  "🪻": "rgba(163, 132, 203, 0.34)",
  "🌹": "rgba(221, 90, 100, 0.32)",
  "🌺": "rgba(226, 126, 136, 0.34)",
  "🏵️": "rgba(226, 126, 136, 0.34)",
  "💐": "rgba(190, 158, 79, 0.26)",
  "💮": "rgba(244, 184, 205, 0.34)",
  "🪷": "rgba(244, 184, 205, 0.34)",
  "🍀": "rgba(118, 153, 89, 0.34)",
  "🍁": "rgba(190, 158, 79, 0.3)",
};
const DEFAULT_WASH = "rgba(223, 232, 216, 0.4)";

const GHOSTS: StageFlower[] = [{ emoji: "🌼" }, { emoji: "🪻" }, { emoji: "🌿" }];

export function BouquetStage({
  flowers,
  count,
  tagline,
  scale = 1,
  showMeta = true,
}: {
  flowers: StageFlower[];
  count?: number;
  tagline?: string;
  scale?: number;
  showMeta?: boolean;
}) {
  const ghost = flowers.length === 0;
  const blooms = ghost ? GHOSTS : flowers;

  // Deterministic natural variation — designed, not random (per the handoff).
  const spread = Math.min(150, 36 + blooms.length * 8) * scale;

  return (
    <div className="bqd-stage" style={{ minHeight: 330 * scale }}>
      <div className="bqd-glow" aria-hidden />
      <div
        className="bqd-bouquet"
        style={{ width: `min(92%, ${390 * scale}px)`, height: 250 * scale }}
        aria-label={ghost ? "An empty bouquet, waiting for today's first flower" : `Watercolor-style bouquet made from ${blooms.length} flowers`}
      >
        {blooms.map((flower, index) => {
          const offset = blooms.length === 1 ? 0 : -spread / 2 + (spread / (blooms.length - 1)) * index;
          const angle = offset / (4 * scale || 4) + (index % 2 ? 5 : -5);
          const size = (38 + ((index * 11) % 24)) * scale;
          const stemH = (150 + ((index * 17) % 74)) * scale;
          return (
            <div
              key={index}
              className="bqd-stem"
              style={{
                left: `calc(50% + ${offset}px)`,
                height: stemH,
                width: Math.max(1.4, 2 * scale),
                transform: `translateX(-50%) rotate(${angle}deg)`,
                opacity: ghost ? 0.22 : 0.72,
              }}
            >
              <div
                className="bqd-flower"
                title={flower.title}
                style={{
                  bottom: stemH - 4 * scale,
                  width: size,
                  height: size,
                  fontSize: size * 0.72,
                  transform: `translateX(-50%) rotate(${-angle}deg)`,
                  opacity: ghost ? 0.2 : 1,
                  ["--wash" as string]: WASHES[flower.emoji] ?? DEFAULT_WASH,
                }}
              >
                {flower.emoji}
              </div>
            </div>
          );
        })}
      </div>
      <div
        className="bqd-vase"
        aria-hidden
        style={{ width: 116 * scale, height: 106 * scale, borderRadius: `${18 * scale}px ${18 * scale}px ${28 * scale}px ${28 * scale}px` }}
      >
        <span style={{ left: 18 * scale, right: 18 * scale, top: -8 * scale, height: 16 * scale }} />
      </div>
      {showMeta && count !== undefined && (
        <div className="bqd-count">
          <strong>{count}</strong>
          <span>Flowers<br />Earned</span>
        </div>
      )}
      {showMeta && tagline && (
        <div className="bqd-tagline">
          <span>{tagline}</span>
        </div>
      )}
    </div>
  );
}
