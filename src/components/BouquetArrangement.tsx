"use client";

/**
 * A hand-tied bouquet drawn in SVG: blooms in a dense dome, real curved
 * stems converging to a ribbon bow, cut stem ends below, and (optionally)
 * a kraft note hanging from the bow on twine — per Karmel's mockups.
 * Shared by Today's Bouquet (large, with tag) and the sidebar (small).
 */

const TIE: [number, number] = [160, 238];

// Bloom head positions (dome), filled center-out so any count looks composed.
const HEADS: { x: number; y: number; s: number }[] = [
  { x: 160, y: 148, s: 46 },
  { x: 124, y: 158, s: 41 },
  { x: 196, y: 158, s: 41 },
  { x: 140, y: 118, s: 38 },
  { x: 180, y: 118, s: 38 },
  { x: 96, y: 182, s: 36 },
  { x: 224, y: 182, s: 36 },
  { x: 160, y: 92, s: 36 },
  { x: 112, y: 128, s: 33 },
  { x: 208, y: 128, s: 33 },
  { x: 80, y: 152, s: 31 },
  { x: 240, y: 152, s: 31 },
  { x: 134, y: 82, s: 30 },
  { x: 186, y: 82, s: 30 },
  { x: 160, y: 188, s: 34 },
  { x: 154, y: 62, s: 26 },
];

const GREENS: { x: number; y: number; s: number; r: number; leaf: string }[] = [
  { x: 160, y: 118, s: 34, r: 0, leaf: "🌿" },
  { x: 112, y: 156, s: 34, r: -28, leaf: "🌿" },
  { x: 208, y: 156, s: 34, r: 28, leaf: "🌿" },
  { x: 138, y: 96, s: 30, r: -14, leaf: "🍃" },
  { x: 182, y: 96, s: 30, r: 14, leaf: "🍃" },
  { x: 72, y: 176, s: 30, r: -44, leaf: "🍃" },
  { x: 248, y: 176, s: 30, r: 44, leaf: "🍃" },
  { x: 160, y: 60, s: 30, r: 0, leaf: "🌿" },
  { x: 92, y: 136, s: 28, r: -34, leaf: "🌿" },
  { x: 228, y: 136, s: 28, r: 34, leaf: "🌿" },
  { x: 62, y: 200, s: 26, r: -56, leaf: "🌱" },
  { x: 258, y: 200, s: 26, r: 56, leaf: "🌱" },
  { x: 124, y: 70, s: 26, r: -20, leaf: "🌿" },
  { x: 196, y: 70, s: 26, r: 20, leaf: "🌿" },
  { x: 100, y: 104, s: 26, r: -38, leaf: "🍃" },
  { x: 220, y: 104, s: 26, r: 38, leaf: "🍃" },
  { x: 146, y: 174, s: 28, r: -8, leaf: "🌿" },
  { x: 174, y: 174, s: 28, r: 8, leaf: "🌿" },
];

/** Baby's-breath sprinkles that fill gaps as the bouquet grows. */
const SPRIGS: [number, number][] = [
  [104, 88], [216, 88], [86, 122], [234, 122], [130, 58], [190, 58],
  [76, 158], [244, 158], [150, 44], [170, 44], [112, 178], [208, 178],
  [140, 132], [180, 132], [96, 196], [224, 196],
];

/** Point + angle along a stem's quadratic curve, for leaves on the stems. */
function stemPoint(x: number, y: number, t: number): { px: number; py: number; angle: number } {
  const [tx, ty] = TIE;
  const startX = x, startY = y + 6;
  const cx = x + (tx - x) * 0.22;
  const cy = y + (ty - y) * 0.6;
  const inverse = 1 - t;
  const px = inverse * inverse * startX + 2 * inverse * t * cx + t * t * tx;
  const py = inverse * inverse * startY + 2 * inverse * t * cy + t * t * ty;
  const dx = 2 * inverse * (cx - startX) + 2 * t * (tx - cx);
  const dy = 2 * inverse * (cy - startY) + 2 * t * (ty - cy);
  return { px, py, angle: (Math.atan2(dy, dx) * 180) / Math.PI };
}

const STEM_GREEN = "#5d7a45";
const RIBBON = "#8aa06b";
const RIBBON_DARK = "#66804c";

function stemPath(x: number, y: number): string {
  const [tx, ty] = TIE;
  const cx = x + (tx - x) * 0.22;
  const cy = y + (ty - y) * 0.6;
  return `M ${x} ${y + 6} Q ${cx} ${cy} ${tx} ${ty}`;
}

function wrapTagline(text: string, perLine = 16, maxLines = 3): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > perLine && current) {
      lines.push(current.trim());
      current = word;
    } else {
      current = `${current} ${word}`;
    }
  }
  if (current.trim()) lines.push(current.trim());
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\.*$/, "…");
  }
  return lines;
}

export function BouquetArrangement({
  flowers,
  width = 320,
  showTag = true,
  tagline = "",
}: {
  flowers: string[];
  width?: number;
  showTag?: boolean;
  tagline?: string;
}) {
  const blooms = flowers.slice(0, HEADS.length);
  const greenCount = blooms.length ? Math.min(6 + blooms.length, GREENS.length) : 2;
  const height = showTag ? 372 : 320;
  const tagLines = wrapTagline(tagline);

  return (
    <svg
      viewBox={`0 0 320 ${height}`}
      style={{ width, maxWidth: "100%", height: "auto", display: "block", margin: "0 auto", overflow: "visible" }}
      role="img"
      aria-label={blooms.length ? `A hand-tied bouquet of ${blooms.length} flowers` : "An empty bouquet waiting for its first flower"}
    >
      {/* stems — drawn first so blooms sit on top */}
      {blooms.map((_, index) => {
        const head = HEADS[index];
        return <path key={`stem-${index}`} d={stemPath(head.x, head.y)} fill="none" stroke={STEM_GREEN} strokeWidth={3} strokeLinecap="round" opacity={0.95} />;
      })}

      {/* small leaves growing off each stem */}
      {blooms.map((_, index) => {
        const head = HEADS[index];
        return [0.42, 0.68].map((t, leafIndex) => {
          const point = stemPoint(head.x, head.y, t);
          const side = (index + leafIndex) % 2 === 0 ? -1 : 1;
          return (
            <ellipse
              key={`leaf-${index}-${leafIndex}`}
              cx={point.px}
              cy={point.py}
              rx={7.5}
              ry={3.2}
              fill="#7c9463"
              stroke={STEM_GREEN}
              strokeWidth={0.8}
              opacity={0.95}
              transform={`rotate(${point.angle + side * 52} ${point.px} ${point.py})`}
            />
          );
        });
      })}
      {!blooms.length && <path d={stemPath(160, 128)} fill="none" stroke={STEM_GREEN} strokeWidth={3} strokeLinecap="round" opacity={0.6} />}

      {/* cut stem ends below the tie */}
      {[[-22, 62], [-11, 68], [0, 71], [11, 68], [22, 63]].map(([dx, dy], index) => (
        <path
          key={`cut-${index}`}
          d={`M ${TIE[0]} ${TIE[1]} Q ${TIE[0] + dx * 0.6} ${TIE[1] + dy * 0.6} ${TIE[0] + dx} ${TIE[1] + dy}`}
          fill="none"
          stroke={STEM_GREEN}
          strokeWidth={3.4}
          strokeLinecap="round"
          opacity={blooms.length ? 0.95 : 0.5}
        />
      ))}

      {/* greenery */}
      {GREENS.slice(0, greenCount).map((green, index) => (
        <text key={`green-${index}`} x={green.x} y={green.y} fontSize={green.s} textAnchor="middle" transform={`rotate(${green.r} ${green.x} ${green.y})`} opacity={blooms.length ? 0.95 : 0.55}>
          {green.leaf}
        </text>
      ))}

      {/* baby's-breath sprinkles filling the gaps */}
      {blooms.length > 0 &&
        SPRIGS.slice(0, Math.min(4 + blooms.length, SPRIGS.length)).map(([x, y], index) => (
          <g key={`sprig-${index}`} opacity={0.9}>
            <circle cx={x} cy={y} r={2.4} fill="#f7f2e4" stroke="#d8cfb4" strokeWidth={0.7} />
            <circle cx={x + 5} cy={y + 4} r={1.8} fill="#f7f2e4" stroke="#d8cfb4" strokeWidth={0.6} />
            <circle cx={x - 4} cy={y + 5} r={1.5} fill="#f7f2e4" stroke="#d8cfb4" strokeWidth={0.6} />
          </g>
        ))}

      {/* blooms */}
      {blooms.map((emoji, index) => {
        const head = HEADS[index];
        return (
          <text key={`bloom-${index}`} x={head.x} y={head.y + head.s * 0.34} fontSize={head.s} textAnchor="middle">
            {emoji}
          </text>
        );
      })}

      {/* ribbon bow at the tie point */}
      <g>
        <path d={`M ${TIE[0]} ${TIE[1]} C ${TIE[0] - 44} ${TIE[1] - 26}, ${TIE[0] - 46} ${TIE[1] + 18}, ${TIE[0]} ${TIE[1] + 2}`} fill={RIBBON} stroke={RIBBON_DARK} strokeWidth={1.5} />
        <path d={`M ${TIE[0]} ${TIE[1]} C ${TIE[0] + 44} ${TIE[1] - 26}, ${TIE[0] + 46} ${TIE[1] + 18}, ${TIE[0]} ${TIE[1] + 2}`} fill={RIBBON} stroke={RIBBON_DARK} strokeWidth={1.5} />
        <path d={`M ${TIE[0] - 4} ${TIE[1] + 2} C ${TIE[0] - 14} ${TIE[1] + 26}, ${TIE[0] - 20} ${TIE[1] + 38}, ${TIE[0] - 26} ${TIE[1] + 48} L ${TIE[0] - 16} ${TIE[1] + 44} Z`} fill={RIBBON} stroke={RIBBON_DARK} strokeWidth={1.2} />
        <path d={`M ${TIE[0] + 4} ${TIE[1] + 2} C ${TIE[0] + 14} ${TIE[1] + 26}, ${TIE[0] + 20} ${TIE[1] + 38}, ${TIE[0] + 26} ${TIE[1] + 48} L ${TIE[0] + 16} ${TIE[1] + 44} Z`} fill={RIBBON} stroke={RIBBON_DARK} strokeWidth={1.2} />
        <ellipse cx={TIE[0]} cy={TIE[1] + 1} rx={8} ry={7} fill={RIBBON_DARK} />
      </g>

      {/* the note, hanging from the bow on twine */}
      {showTag && (
        <g>
          <path d={`M ${TIE[0] + 6} ${TIE[1] + 4} Q 208 ${TIE[1] + 32} 224 ${TIE[1] + 58}`} fill="none" stroke="#a3906c" strokeWidth={1.6} strokeDasharray="1 3" strokeLinecap="round" />
          <g transform={`rotate(8 224 ${TIE[1] + 58})`}>
            <rect x={224 - 52} y={TIE[1] + 58} width={104} height={58} rx={7} fill="#f6efdd" stroke="#cbbfa0" strokeWidth={1.4} />
            <circle cx={224 - 42} cy={TIE[1] + 68} r={3.4} fill="#efe6cf" stroke="#a3906c" strokeWidth={1.3} />
            {tagLines.map((line, index) => (
              <text
                key={line + index}
                x={224 + 4}
                y={TIE[1] + 58 + 22 + index * 14 - (tagLines.length - 1) * 3}
                fontSize={11}
                textAnchor="middle"
                fill="#6b5f4b"
                fontStyle="italic"
                fontFamily="var(--font-display, Georgia, serif)"
              >
                {line}
              </text>
            ))}
          </g>
        </g>
      )}
    </svg>
  );
}
