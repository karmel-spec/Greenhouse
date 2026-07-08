"use client";

/**
 * Grow Lights — Karmel's multi-spectrum LED companion. Which mode to flip
 * to, how close to hang the light for what's on the bench, when Orem's
 * desert sun makes the panel redundant, and two timer recipes so the
 * whole thing runs itself.
 */

import { useState } from "react";
import { Bot, Lightbulb, Ruler, Sun, Timer } from "lucide-react";
import {
  DISTANCE_CHART,
  GROW_LIGHT_MODES,
  LIGHT_DECISION_GUIDE,
  SEASONAL_PHOTOPERIOD,
  TIMER_SETUP,
} from "@/lib/grow-lights";

function askEve(prompt: string) {
  window.dispatchEvent(new CustomEvent("eve-ask", { detail: prompt }));
}

const SPECTRUM_COLORS = {
  blue: "#6b8fd4",
  red: "#d47a6b",
  warmWhite: "#f0e6c8",
} as const;

const INTENSITY_LABEL: Record<"low" | "medium" | "high", string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const MODE_NAME: Record<string, string> = Object.fromEntries(
  GROW_LIGHT_MODES.map((mode) => [mode.key, `${mode.emoji} ${mode.name}`]),
);

export function GrowLights() {
  const [selectedPlant, setSelectedPlant] = useState("Seedlings (general)");

  const selectedGuide = DISTANCE_CHART.find((guide) => guide.plantType === selectedPlant) ?? DISTANCE_CHART[0];

  return (
    <div className="section-stack">
      <div className="section-intro">
        <h2>Grow Lights</h2>
        <p>
          Your multi-spectrum LED has three personalities — blue for sturdy leaves, red for flowers and fruit, and a
          balanced blend for everything else. Here&apos;s how to pick the mode, hang the light at the right height, and
          know when Orem&apos;s generous desert sun means you can leave the switch alone.
        </p>
      </div>

      <div className="ref-grid">
        {GROW_LIGHT_MODES.map((mode) => (
          <article key={mode.key} className="gh-card">
            <h3>
              {mode.emoji} {mode.name}
            </h3>
            <div className="spectrum-bar">
              <span
                style={{ width: `${mode.spectrum.bluePct}%`, background: SPECTRUM_COLORS.blue }}
                title={`Blue ${mode.spectrum.bluePct}%`}
              />
              <span
                style={{ width: `${mode.spectrum.redPct}%`, background: SPECTRUM_COLORS.red }}
                title={`Red ${mode.spectrum.redPct}%`}
              />
              <span
                style={{ width: `${mode.spectrum.warmWhitePct}%`, background: SPECTRUM_COLORS.warmWhite }}
                title={`Warm white ${mode.spectrum.warmWhitePct}%`}
              />
            </div>
            <p>{mode.description}</p>
            <div>
              {mode.bestFor.map((item) => (
                <span key={item} className="ref-chip">
                  {item}
                </span>
              ))}
            </div>
            <div className="ref-kv">
              <strong>Daily hours</strong>
              <span>{mode.dailyHours}</span>
            </div>
            <div className="ref-kv">
              <strong>Utah note</strong>
              <span>{mode.utahNote}</span>
            </div>
          </article>
        ))}
      </div>

      <article className="gh-card">
        <h3>
          <Ruler size={18} /> How close should the light hang?
        </h3>
        <p className="gh-hint">
          Pick what&apos;s on the bench and get distance, intensity, mode, and hours for each stage of its life.
        </p>
        <select
          className="pest-search"
          value={selectedPlant}
          onChange={(event) => setSelectedPlant(event.target.value)}
          aria-label="Choose a plant type for distance guidance"
        >
          {DISTANCE_CHART.map((guide) => (
            <option key={guide.plantType} value={guide.plantType}>
              {guide.plantType}
            </option>
          ))}
        </select>
        <div className="ref-table-wrap">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Distance</th>
                <th>Intensity</th>
                <th>Mode</th>
                <th>Hours/day</th>
              </tr>
            </thead>
            <tbody>
              {selectedGuide.stages.map((stage) => (
                <tr key={stage.stage}>
                  <td>{stage.stage}</td>
                  <td>
                    {stage.distanceInches.min}-{stage.distanceInches.max}&quot;
                  </td>
                  <td>{INTENSITY_LABEL[stage.intensity]}</td>
                  <td>{MODE_NAME[stage.mode]}</td>
                  <td>{stage.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedGuide.stages.map((stage) => (
          <div key={stage.stage} className="ref-kv">
            <strong>{stage.stage}</strong>
            <span>{stage.note}</span>
          </div>
        ))}
      </article>

      <article className="gh-card">
        <h3>
          <Sun size={18} /> Light through the Orem year
        </h3>
        <p className="gh-hint">
          Daylight in zone 6b swings from 9 winter hours to 15 in June — your lights fill the gaps, not the whole year.
        </p>
        <div className="ref-table-wrap">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Season</th>
                <th>Natural light</th>
                <th>What to do</th>
                <th>Example schedule</th>
              </tr>
            </thead>
            <tbody>
              {SEASONAL_PHOTOPERIOD.map((entry) => (
                <tr key={entry.season}>
                  <td>{entry.season}</td>
                  <td>{entry.naturalHours}</td>
                  <td>{entry.recommendation}</td>
                  <td>
                    {entry.schedule.onTime === "—" ? "Lights off" : `${entry.schedule.onTime} – ${entry.schedule.offTime}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="gh-card">
        <h3>
          <Lightbulb size={18} /> Sunshine or switch?
        </h3>
        <p className="gh-hint">
          You live under some of the best growing light in the country — here&apos;s when to use it and when to plug in.
        </p>
        <div className="ref-table-wrap">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Situation</th>
                <th>Verdict</th>
                <th>Why</th>
              </tr>
            </thead>
            <tbody>
              {LIGHT_DECISION_GUIDE.map((decision) => (
                <tr key={decision.situation}>
                  <td>{decision.situation}</td>
                  <td>{decision.useNatural ? "☀️ Natural" : "💡 Lights"}</td>
                  <td>{decision.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="gh-card">
        <h3>
          <Timer size={18} /> Set it and forget it
        </h3>
        <p className="gh-hint">
          Two outlet timers, five minutes of setup, and your lights keep perfect hours even when you sleep in.
        </p>
        {TIMER_SETUP.map((recipe) => (
          <div key={recipe.name}>
            <h4 className="apothecary-subhead">{recipe.name}</h4>
            <div className="ref-kv">
              <strong>Schedule</strong>
              <span>
                {MODE_NAME[recipe.mode]} · on {recipe.onTime}, off {recipe.offTime} · {recipe.totalHours} hours
              </span>
            </div>
            <ol>
              {recipe.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        ))}
      </article>

      <div className="toolbar">
        <button
          className="secondary-button"
          onClick={() => askEve("Which grow light mode and distance should I use right now for what's growing in the greenhouse?")}
        >
          <Bot size={14} /> Ask Eve
        </button>
      </div>
    </div>
  );
}
