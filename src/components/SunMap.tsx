"use client";

/**
 * Sun & shade map of the property, traced over real Esri aerial imagery of
 * parcel 55:878:0001 (the house at the Westview Circle cul-de-sac). Zones are
 * estimated from the house footprint, tree canopy, and solar geometry for
 * latitude 40.26°N — morning sun rises in the east, the midday arc leans
 * south, and afternoon sun sets west over the empty lot.
 */

import { useState } from "react";
import { Sunrise, Sun, Sunset, MapPin } from "lucide-react";

type Period = "all" | "morning" | "midday" | "afternoon";

type SunZone = {
  id: string;
  label: string;
  kind: "full" | "morning" | "afternoon" | "shade";
  points: string; // SVG polygon points in image pixel space (1096x792)
  labelAt: [number, number];
  /** periods during which this zone is meaningfully lit */
  litDuring: Exclude<Period, "all">[];
  planting: string;
};

const ZONES: SunZone[] = [
  {
    id: "front-lawn",
    label: "Front lawn",
    kind: "full",
    points: "35,485 295,468 425,575 425,742 45,608",
    labelAt: [180, 640],
    litDuring: ["morning", "midday", "afternoon"],
    planting: "Full sun 6+ hours — the tomato, pepper, squash, and sunflower real estate.",
  },
  {
    id: "west-edge",
    label: "West edge (by the empty lot)",
    kind: "full",
    points: "35,190 88,193 88,470 35,478",
    labelAt: [62, 330],
    litDuring: ["midday", "afternoon"],
    planting: "Open west sun off the vacant lot — great for berries and drought-tough natives; afternoon heat builds here.",
  },
  {
    id: "drive-apron",
    label: "Driveway & south apron",
    kind: "afternoon",
    points: "425,575 648,470 855,608 640,722 425,742",
    labelAt: [620, 640],
    litDuring: ["midday", "afternoon"],
    planting: "Reflected heat off concrete — pots of rosemary, lavender, and heat-lovers thrive; lettuce cooks.",
  },
  {
    id: "east-yard",
    label: "East yard",
    kind: "morning",
    points: "648,250 880,300 1020,530 830,595 648,468",
    labelAt: [800, 450],
    litDuring: ["morning", "midday"],
    planting: "Gentle morning sun, tree-shaded afternoons — perfect for greens, herbs, and anything that bolts in heat.",
  },
  {
    id: "north-yard",
    label: "North yard & canopy",
    kind: "shade",
    points: "35,35 570,35 570,120 648,160 648,245 400,205 200,215 35,182",
    labelAt: [300, 110],
    litDuring: ["midday"],
    planting: "House shadow plus mature trees — dappled at best. Shade greens, sorrel, alpine strawberries, hostas.",
  },
  {
    id: "ne-canopy",
    label: "North-east trees",
    kind: "shade",
    points: "570,35 1050,35 1055,540 1020,530 880,300 648,245 648,160 570,120",
    labelAt: [860, 150],
    litDuring: [],
    planting: "The deepest shade on the property — woodland corner, mulch paths, and the coolest summer seating.",
  },
];

const KIND_LABEL = {
  full: "Full sun (6+ hrs)",
  morning: "Morning sun, afternoon shade",
  afternoon: "Afternoon sun & reflected heat",
  shade: "Shade / dappled",
} as const;

const PERIODS: { key: Period; label: string; icon: React.ReactNode; blurb: string }[] = [
  { key: "all", label: "Full day", icon: <Sun size={15} />, blurb: "Every zone colored by its overall light character." },
  { key: "morning", label: "Morning", icon: <Sunrise size={15} />, blurb: "6–10 am: sun low in the east — the east yard glows first while everything west of the house and trees waits in shadow." },
  { key: "midday", label: "Midday", icon: <Sun size={15} />, blurb: "10 am–3 pm: the sun arcs high across the southern sky — only the north side of the house and the deep canopy stay shaded." },
  { key: "afternoon", label: "Afternoon", icon: <Sunset size={15} />, blurb: "3 pm–sunset: sun swings west over the empty lot — the west edge and driveway bake while the east yard cools into shade." },
];

export function SunMap() {
  const [period, setPeriod] = useState<Period>("all");
  const [openZone, setOpenZone] = useState<string | null>(null);

  const active = PERIODS.find((entry) => entry.key === period)!;
  const zoneOpacity = (zone: SunZone) => {
    if (period === "all") return 0.42;
    return zone.litDuring.includes(period) ? 0.5 : 0.06;
  };

  return (
    <div className="sunmap-card">
      <h3>Light cycle of the property</h3>
      <p className="sunmap-sub">
        Sun and shade zones traced on the real aerial — from the house footprint, the tree canopy, and the sun&apos;s
        path at Orem&apos;s latitude. Tap a zone for planting guidance, or step through the day.
      </p>

      <div className="sunmap-periods">
        {PERIODS.map((entry) => (
          <button
            key={entry.key}
            className={`pest-filter ${period === entry.key ? "active" : ""}`}
            onClick={() => setPeriod(entry.key)}
          >
            {entry.icon} {entry.label}
          </button>
        ))}
      </div>
      <p className="sunmap-blurb">{active.blurb}</p>

      <div className="sunmap-stage">
        <img src="/sunmap/home.jpg" alt="Aerial view of the property with sun and shade zones" />
        <svg viewBox="0 0 1096 792" preserveAspectRatio="none">
          {ZONES.map((zone) => (
            <polygon
              key={zone.id}
              points={zone.points}
              className={`sunzone sunzone-${zone.kind} ${openZone === zone.id ? "selected" : ""}`}
              style={{ fillOpacity: zoneOpacity(zone) }}
              onClick={() => setOpenZone((current) => (current === zone.id ? null : zone.id))}
            />
          ))}
          {/* house footprint for reference */}
          <rect x={90} y={195} width={555} height={275} className="sunmap-house" />
          <text x={368} y={345} className="sunmap-house-label">House</text>
          {ZONES.map((zone) => (
            <text key={`${zone.id}-label`} x={zone.labelAt[0]} y={zone.labelAt[1]} className="sunmap-zone-label">
              {zone.label}
            </text>
          ))}
          {/* sun path arc: east → south → west */}
          <path d="M 1060 400 Q 548 -60 36 400" className="sunmap-arc" />
          <text x={1042} y={380} className="sunmap-arc-label">☀ 6 am</text>
          <text x={548} y={40} className="sunmap-arc-label" textAnchor="middle">noon (south sky)</text>
          <text x={54} y={380} className="sunmap-arc-label" textAnchor="end">9 pm ☀</text>
        </svg>
      </div>

      <div className="sunmap-legend">
        {(Object.keys(KIND_LABEL) as (keyof typeof KIND_LABEL)[]).map((kind) => (
          <span key={kind} className="sunmap-key"><i className={`sunzone-${kind}`} /> {KIND_LABEL[kind]}</span>
        ))}
      </div>

      {openZone && (
        <div className="sunmap-zoneinfo">
          {(() => {
            const zone = ZONES.find((candidate) => candidate.id === openZone)!;
            return (
              <>
                <strong><MapPin size={14} /> {zone.label} — {KIND_LABEL[zone.kind]}</strong>
                <p>{zone.planting}</p>
              </>
            );
          })()}
        </div>
      )}

      <p className="sunmap-note">
        Estimates for the growing season (April–October). In winter the noon sun sits just 26° above the southern
        horizon, so every shadow — house and trees — stretches about twice as far north. Zones are traced from the
        aerial; if the greenhouse or a new tree changes a corner, say the word and I&apos;ll redraw it.
      </p>
    </div>
  );
}
