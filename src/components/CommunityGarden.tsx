"use client";

/**
 * Community Garden planner for the vacant lot next door (138 W 1880 S).
 * Lot dimensions come from real Utah County parcel boundaries — the plan
 * below is drawn to scale at 83 ft x 105 ft.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Compass, Droplets, ExternalLink, MapPin, Ruler, Users, X } from "lucide-react";
import { COMMUNITY_CHECKLIST, LOT, PLOT_OPTIONS, layoutLot } from "@/lib/community";
import type { StoredCommunityGarden, StoredPlotClaim } from "@/lib/store";

const DEFAULT_GARDEN: StoredCommunityGarden = { plotSize: "4x8", pathFt: 3, claims: {}, checklist: {} };

function askEve(prompt: string) {
  window.dispatchEvent(new CustomEvent("eve-ask", { detail: prompt }));
}

export function CommunityGarden() {
  const [garden, setGarden] = useState<StoredCommunityGarden>(DEFAULT_GARDEN);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState<StoredPlotClaim>({ name: "", crop: "", note: "" });
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/community")
      .then((r) => r.json())
      .then((data) => {
        if (data.garden) setGarden({ ...DEFAULT_GARDEN, ...data.garden });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const persist = (next: StoredCommunityGarden) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch("/api/community", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      }).catch(() => {});
    }, 400);
  };

  const update = (mutate: (g: StoredCommunityGarden) => StoredCommunityGarden) => {
    setGarden((current) => {
      const next = mutate(current);
      persist(next);
      return next;
    });
  };

  const option = PLOT_OPTIONS.find((o) => o.key === garden.plotSize) ?? PLOT_OPTIONS[0];
  const layout = useMemo(() => layoutLot(option, garden.pathFt), [option, garden.pathFt]);

  const claimed = Object.keys(garden.claims).filter((id) => layout.plots.some((p) => p.id === id));
  const weeklyGallons = Math.round(layout.growingSqFt * 0.62); // ~1 inch of water per week
  const donePct = Math.round(
    (COMMUNITY_CHECKLIST.filter((item) => garden.checklist[item.key]).length / COMMUNITY_CHECKLIST.length) * 100,
  );

  const openPlot = (id: string) => {
    setSelected(id);
    const claim = garden.claims[id];
    setForm(claim ? { name: claim.name, crop: claim.crop ?? "", note: claim.note ?? "" } : { name: "", crop: "", note: "" });
  };

  const saveClaim = () => {
    if (!selected) return;
    const name = form.name.trim();
    update((g) => {
      const claims = { ...g.claims };
      if (name) claims[selected] = { name, crop: form.crop?.trim() || undefined, note: form.note?.trim() || undefined };
      else delete claims[selected];
      return { ...g, claims };
    });
    setSelected(null);
  };

  const releasePlot = () => {
    if (!selected) return;
    update((g) => {
      const claims = { ...g.claims };
      delete claims[selected];
      return { ...g, claims };
    });
    setSelected(null);
  };

  const selectedIndex = selected ? layout.plots.findIndex((p) => p.id === selected) : -1;

  return (
    <div className="section-stack">
      <div className="section-intro">
        <h2>Community Garden — the lot next door</h2>
        <p>
          A to-scale plan for the vacant lot at {LOT.address}, measured from real {LOT.source.replace(" (Utah SGID)", "")} —
          claim plots for neighbors, size the beds, and work the startup checklist to make it real.
        </p>
      </div>

      <div className="community-hero">
        <figure className="community-photo">
          <img src="/community/lot-aerial-outline.jpg" alt={`Aerial photo of the vacant lot at ${LOT.address} with its parcel boundary outlined`} />
          <figcaption>The lot today — parcel boundary in red</figcaption>
        </figure>
        <div className="community-facts">
          <h3>The lot, measured</h3>
          <div className="community-fact"><Ruler size={16} /> <strong>{LOT.widthFt} ft × {LOT.depthFt} ft</strong> — {LOT.areaSqFt.toLocaleString()} sq ft ({LOT.acres} acres)</div>
          <div className="community-fact"><MapPin size={16} /> {LOT.address} · parcel {LOT.parcelId} · {LOT.ownership}</div>
          <div className="community-fact"><Compass size={16} /> Street on the south edge; long axis runs north–south</div>
          <div className="community-fact"><Droplets size={16} /> ~{weeklyGallons.toLocaleString()} gallons/week to give current beds 1&quot; of water</div>
          <p className="community-source">
            Dimensions from {LOT.source}.{" "}
            <a href={LOT.parcelUrl} target="_blank" rel="noreferrer">County parcel map <ExternalLink size={12} /></a>
          </p>
          <button
            className="secondary-button"
            onClick={() =>
              askEve(
                `Help me plan a community garden on the vacant ${LOT.widthFt}x${LOT.depthFt} ft lot next door (${LOT.areaSqFt} sq ft, Orem, zone 6b). ` +
                  `The current plan fits ${layout.plots.length} ${layout.plotW}x${layout.plotH} ft plots plus a gathering area, shed, water station, and compost bays. ` +
                  `Suggest what to plant across the plots for a first season, how to organize neighbors, and the biggest risks to plan for.`,
              )
            }
          >
            <Bot size={16} /> Ask Eve for a first-season plan
          </button>
        </div>
      </div>

      <div className="community-toolbar">
        <label>
          Plot size
          <select
            value={option.key}
            onChange={(e) => update((g) => ({ ...g, plotSize: e.target.value }))}
          >
            {PLOT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </label>
        <label>
          Path width
          <select value={garden.pathFt} onChange={(e) => update((g) => ({ ...g, pathFt: Number(e.target.value) }))}>
            <option value={2}>2 ft paths</option>
            <option value={3}>3 ft paths</option>
            <option value={4}>4 ft paths</option>
          </select>
        </label>
        <div className="community-stats">
          <span><strong>{layout.plots.length}</strong> plots</span>
          <span><strong>{layout.growingSqFt.toLocaleString()}</strong> sq ft growing</span>
          <span><strong>{claimed.length}</strong> claimed</span>
          <span><Users size={14} /> {Math.max(layout.plots.length - claimed.length, 0)} open</span>
        </div>
      </div>

      <div className="community-map-card">
        <svg
          className="community-map"
          viewBox={`-6 -8 ${LOT.widthFt + 12} ${LOT.depthFt + 22}`}
          role="img"
          aria-label={`Scale plan of the ${LOT.widthFt} by ${LOT.depthFt} foot lot with ${layout.plots.length} garden plots`}
        >
          {/* lot */}
          <rect x={0} y={0} width={LOT.widthFt} height={LOT.depthFt} className="cg-lot" rx={1} />
          {/* north arrow + dimensions */}
          <text x={LOT.widthFt / 2} y={-3} className="cg-dim">{LOT.widthFt} ft — N ↑</text>
          <text x={-3} y={LOT.depthFt / 2} className="cg-dim" transform={`rotate(-90 -3 ${LOT.depthFt / 2})`}>{LOT.depthFt} ft</text>
          {/* common areas */}
          {layout.common.map((area) => (
            <g key={area.id}>
              <rect x={area.x} y={area.y} width={area.w} height={area.h} className={`cg-common cg-${area.id}`} rx={0.8} />
              <text x={area.x + area.w / 2} y={area.y + area.h / 2 + 1} className="cg-common-label">{area.label}</text>
            </g>
          ))}
          {/* plots */}
          {layout.plots.map((plot, index) => {
            const claim = garden.claims[plot.id];
            return (
              <g key={plot.id} className={`cg-plot ${claim ? "claimed" : ""} ${selected === plot.id ? "selected" : ""}`} onClick={() => openPlot(plot.id)}>
                <rect x={plot.x} y={plot.y} width={plot.w} height={plot.h} rx={0.6} />
                <text x={plot.x + plot.w / 2} y={plot.y + plot.h / 2 + 1.1} className="cg-plot-label">
                  {claim ? claim.name.split(" ")[0].slice(0, 8) : index + 1}
                </text>
              </g>
            );
          })}
          {/* street */}
          <text x={LOT.widthFt / 2} y={LOT.depthFt + 8} className="cg-street">1880 South — street &amp; entrance</text>
        </svg>
        <p className="community-hint">
          Drawn to scale from the parcel boundary. Tap a plot to claim it for a neighbor — {layout.plotW}×{layout.plotH} ft each,{" "}
          {garden.pathFt} ft paths, wood-chip walkways, common area by the street.
        </p>
      </div>

      {selected && selectedIndex >= 0 && (
        <div className="community-claim">
          <div className="community-claim-head">
            <h3>Plot {selectedIndex + 1} · {layout.plotW}×{layout.plotH} ft</h3>
            <button className="icon-button" onClick={() => setSelected(null)} aria-label="Close"><X size={16} /></button>
          </div>
          <div className="community-claim-fields">
            <label>
              Gardener / family
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. The Larsons"
                autoFocus
              />
            </label>
            <label>
              What they&apos;ll grow
              <input
                value={form.crop ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, crop: e.target.value }))}
                placeholder="e.g. tomatoes + basil"
              />
            </label>
            <label>
              Note
              <input
                value={form.note ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="e.g. paid season fee, wants a trellis"
              />
            </label>
          </div>
          <div className="community-claim-actions">
            <button className="primary-button" onClick={saveClaim}>{form.name.trim() ? "Save plot" : "Leave open"}</button>
            {garden.claims[selected] && (
              <button className="secondary-button" onClick={releasePlot}>Release plot</button>
            )}
          </div>
        </div>
      )}

      {claimed.length > 0 && (
        <div className="community-roster">
          <h3>Plot roster</h3>
          <ul>
            {layout.plots.map((plot, index) => {
              const claim = garden.claims[plot.id];
              if (!claim) return null;
              return (
                <li key={plot.id}>
                  <button onClick={() => openPlot(plot.id)}>
                    <strong>Plot {index + 1}</strong> — {claim.name}
                    {claim.crop ? <span className="roster-crop"> · {claim.crop}</span> : null}
                    {claim.note ? <span className="roster-note"> · {claim.note}</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="community-checklist">
        <div className="community-checklist-head">
          <h3>Make it real — startup checklist</h3>
          <span className="community-progress">{donePct}% done</span>
        </div>
        <ul>
          {COMMUNITY_CHECKLIST.map((item, index) => {
            const done = Boolean(garden.checklist[item.key]);
            return (
              <li key={item.key} className={done ? "done" : ""}>
                <label className="community-check">
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() =>
                      update((g) => ({ ...g, checklist: { ...g.checklist, [item.key]: !done } }))
                    }
                  />
                  <span className="community-check-title">{index + 1}. {item.title}</span>
                </label>
                <p>
                  {item.detail}{" "}
                  {item.link && (
                    <a href={item.link.href} target="_blank" rel="noreferrer">
                      {item.link.label} <ExternalLink size={11} />
                    </a>
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      <figure className="community-context">
        <img src="/community/neighborhood-parcels.png" alt="Aerial view of the neighborhood with parcel boundaries; the vacant lot is outlined in red next to Karmel's house (blue dot)" />
        <figcaption>The neighborhood with county parcel lines — the lot (red) sits right off the Westview Circle cul-de-sac (blue dot).</figcaption>
      </figure>

      {!loaded && <p className="community-hint">Loading saved plan…</p>}
    </div>
  );
}
