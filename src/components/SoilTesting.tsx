"use client";

/**
 * Soil Testing — Karmel's 3-in-1 soil meter (moisture / light / pH, no
 * batteries) finally explained. Three mode cards show how to take a reading
 * and what the needle means, a 60-plant chart gives target ranges to test
 * against, and Eve is one tap away for interpreting a confusing reading.
 */

import { useMemo, useState } from "react";
import { Bot } from "lucide-react";
import {
  KEY_INSIGHTS,
  METER_MODES,
  SOIL_TEST_CHART,
  type PlantCategory,
  type SoilTestTarget,
} from "@/lib/soil-testing";

function askEve(prompt: string) {
  window.dispatchEvent(new CustomEvent("eve-ask", { detail: prompt }));
}

type SortKey = "plant" | "light" | "moisture" | "ph";

const CATEGORIES: PlantCategory[] = [
  "Houseplant",
  "Herb",
  "Vegetable",
  "Flower",
  "Succulent",
  "Outdoor perennial",
];

const SORT_VALUE: Record<Exclude<SortKey, "plant">, (row: SoilTestTarget) => number> = {
  light: (row) => row.lightLux.min,
  moisture: (row) => row.moisture.min,
  ph: (row) => row.ph.optimal,
};

export function SoilTesting() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PlantCategory | "All">("All");
  const [sortKey, setSortKey] = useState<SortKey>("plant");
  const [sortAsc, setSortAsc] = useState(true);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortAsc((value) => !value);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = SOIL_TEST_CHART.filter(
      (row) =>
        (category === "All" || row.category === category) &&
        (!needle || row.plant.toLowerCase().includes(needle) || row.category.toLowerCase().includes(needle)),
    );
    const direction = sortAsc ? 1 : -1;
    return filtered.slice().sort((a, b) => {
      if (sortKey === "plant") return a.plant.localeCompare(b.plant) * direction;
      return (SORT_VALUE[sortKey](a) - SORT_VALUE[sortKey](b)) * direction;
    });
  }, [query, category, sortKey, sortAsc]);

  const arrow = (key: SortKey) => (sortKey === key ? (sortAsc ? " ↑" : " ↓") : "");

  return (
    <div className="section-stack">
      <div className="section-intro">
        <h2>Soil Testing Lab</h2>
        <p>
          Your 3-in-1 meter — the one with two probes and no batteries — finally explained. Flip the switch,
          sink the probes, and compare what the needle says to what your plant actually wants. In Orem&apos;s
          alkaline high-desert soil, the pH mode earns its keep.
        </p>
      </div>

      <div className="ref-grid">
        {METER_MODES.map((mode) => (
          <article key={mode.key} className="gh-card">
            <h3>
              {mode.emoji} {mode.name}
            </h3>
            <p className="gh-hint">
              Reads in {mode.unit} — {mode.scale}.
            </p>
            <ol>
              {mode.howToUse.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            {mode.bands.map((band) => (
              <div key={band.range} className="ref-kv">
                <strong>{band.range}</strong>
                <span>
                  {band.meaning} {band.action}
                </span>
              </div>
            ))}
          </article>
        ))}
      </div>

      <div className="gh-card">
        <h3 className="apothecary-subhead">Worth remembering</h3>
        <ul>
          {KEY_INSIGHTS.map((insight) => (
            <li key={insight}>{insight}</li>
          ))}
        </ul>
      </div>

      <div className="gh-card">
        <h3 className="apothecary-subhead">What should the meter say? 60 plants, 3 readings each</h3>
        <input
          className="pest-search"
          type="search"
          placeholder="Search 60 plants…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div>
          {(["All", ...CATEGORIES] as const).map((chip) => (
            <button
              key={chip}
              type="button"
              className={category === chip ? "ref-chip active" : "ref-chip"}
              aria-pressed={category === chip}
              style={category === chip ? { fontWeight: 600, borderColor: "var(--forest)" } : undefined}
              onClick={() => setCategory(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
        <p className="gh-hint">
          Showing {rows.length} of {SOIL_TEST_CHART.length}
        </p>
        {rows.length > 0 ? (
          <div className="ref-table-wrap">
            <table className="ref-table">
              <thead>
                <tr>
                  <th onClick={() => toggleSort("plant")}>Plant{arrow("plant")}</th>
                  <th>Category</th>
                  <th onClick={() => toggleSort("light")}>Light (lux){arrow("light")}</th>
                  <th onClick={() => toggleSort("moisture")}>Moisture (1–10){arrow("moisture")}</th>
                  <th onClick={() => toggleSort("ph")}>pH (optimal){arrow("ph")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.plant}>
                    <td>
                      <strong>{row.plant}</strong>
                    </td>
                    <td>{row.category}</td>
                    <td>
                      {row.lightLux.min.toLocaleString()}–{row.lightLux.max.toLocaleString()}
                    </td>
                    <td>
                      {row.moisture.min}–{row.moisture.max}
                    </td>
                    <td>
                      {row.ph.min}–{row.ph.max} ({row.ph.optimal})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-note">No plants match — try a shorter search or clear the category chip.</p>
        )}
      </div>

      <button
        className="secondary-button"
        onClick={() => askEve("I just took a soil meter reading — help me interpret it: ")}
      >
        <Bot size={14} /> Ask Eve about a reading
      </button>
    </div>
  );
}
