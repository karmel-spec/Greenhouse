"use client";

/**
 * Quart Jar Hydroponics — kratky-style growing in quart mason jars: a net cup
 * in the lid, nutrient water below, no pump. Each jar tracks what's growing,
 * how long it's been in, and the water level (the one thing kratky asks you
 * to watch). Tap the jar to log the water level as it drops.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, GlassWater, Plus, X } from "lucide-react";
import type { HydroWaterLevel, StoredHydroJar } from "@/lib/store";

function askEve(prompt: string) {
  window.dispatchEvent(new CustomEvent("eve-ask", { detail: prompt }));
}

const NEXT_LEVEL: Record<HydroWaterLevel, HydroWaterLevel> = { full: "half", half: "low", low: "full" };

const LEVEL_LABELS: Record<HydroWaterLevel, string> = {
  full: "Water: full",
  half: "Water: about half",
  low: "Water: low — top up",
};

/** Windowsill favorites that actually thrive in a quart kratky jar. */
const QUICK_PICKS: { plant: string; days: number; emoji: string }[] = [
  { plant: "Lettuce", days: 30, emoji: "🥬" },
  { plant: "Basil", days: 28, emoji: "🌿" },
  { plant: "Spinach", days: 40, emoji: "🍃" },
  { plant: "Green Onion", days: 21, emoji: "🧅" },
  { plant: "Kale", days: 30, emoji: "🥗" },
  { plant: "Mint", days: 25, emoji: "🌱" },
];

function jarEmoji(plant: string) {
  const pick = QUICK_PICKS.find((candidate) => plant.toLowerCase().includes(candidate.plant.toLowerCase()));
  return pick?.emoji ?? "🌱";
}

export function QuartJars() {
  const [jars, setJars] = useState<StoredHydroJar[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [plant, setPlant] = useState("");
  const [variety, setVariety] = useState("");
  const [days, setDays] = useState("");
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const noteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    fetch("/api/hydrojars")
      .then((r) => r.json())
      .then((data) => setJars(Array.isArray(data.jars) ? data.jars : []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const startJar = async (pickedPlant: string, pickedDays?: number) => {
    const name = pickedPlant.trim();
    if (!name) return;
    const response = await fetch("/api/hydrojars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plant: name,
        variety: variety.trim() || undefined,
        daysToHarvest: pickedDays ?? (days ? Number(days) : undefined),
      }),
    }).catch(() => null);
    const data = await response?.json();
    if (data?.jars) {
      setJars(data.jars);
      setShowNew(false);
      setPlant("");
      setVariety("");
      setDays("");
    }
  };

  const patchJar = (id: string, payload: object, optimistic: (jar: StoredHydroJar) => StoredHydroJar) => {
    setJars((current) => current.map((jar) => (jar.id === id ? optimistic(jar) : jar)));
    fetch("/api/hydrojars", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...payload }),
    }).catch(() => {});
  };

  const cycleWater = (jar: StoredHydroJar) => {
    // Functional-style: compute from the latest copy in state (fast taps stay in sync).
    setJars((current) =>
      current.map((candidate) => {
        if (candidate.id !== jar.id) return candidate;
        const waterLevel = NEXT_LEVEL[candidate.waterLevel];
        fetch("/api/hydrojars", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: candidate.id, waterLevel }),
        }).catch(() => {});
        return { ...candidate, waterLevel };
      }),
    );
  };

  const setNotes = (id: string, value: string) => {
    setNoteDrafts((current) => ({ ...current, [id]: value }));
    if (noteTimers.current[id]) clearTimeout(noteTimers.current[id]);
    noteTimers.current[id] = setTimeout(() => {
      fetch("/api/hydrojars", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, notes: value }),
      }).catch(() => {});
    }, 600);
  };

  const removeJar = async (id: string) => {
    setJars((current) => current.filter((jar) => jar.id !== id));
    await fetch(`/api/hydrojars?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
  };

  const growing = useMemo(() => jars.filter((jar) => jar.status === "growing"), [jars]);
  const harvested = useMemo(() => jars.filter((jar) => jar.status === "harvested"), [jars]);

  const renderJar = (jar: StoredHydroJar) => {
    const label = `${jar.plant}${jar.variety ? ` '${jar.variety}'` : ""}`;
    const day = Math.max(1, Math.ceil((Date.now() - Date.parse(jar.startedAt)) / 86_400_000));
    const remaining = jar.daysToHarvest ? jar.daysToHarvest - day : null;
    const isDone = jar.status === "harvested";
    return (
      <article key={jar.id} className={`hydrojar-card ${isDone ? "done" : ""}`}>
        <div className="seedtest-head">
          <div>
            <strong>{label}</strong>
            <span className="seedtest-meta">
              {isDone
                ? `Harvested ${jar.harvestedAt ? new Date(jar.harvestedAt).toLocaleDateString() : ""}`
                : `Day ${day} · started ${new Date(jar.startedAt).toLocaleDateString()}`}
              {!isDone && remaining !== null
                ? remaining > 0
                  ? ` · ~${remaining}d to harvest`
                  : " · ready to harvest!"
                : ""}
            </span>
          </div>
          <button className="plant-remove" onClick={() => removeJar(jar.id)} aria-label={`Remove jar of ${label}`}>
            <X size={14} />
          </button>
        </div>

        {/* The jar itself — tap to log the water level as it drops */}
        <button
          className={`hydrojar level-${jar.waterLevel}`}
          onClick={() => !isDone && cycleWater(jar)}
          disabled={isDone}
          title={isDone ? label : `${LEVEL_LABELS[jar.waterLevel]} — tap when the level changes`}
        >
          <span className="hydrojar-plant" aria-hidden>{jarEmoji(jar.plant)}</span>
          <span className="hydrojar-lid" aria-hidden><em className="hydrojar-netcup" /></span>
          <span className="hydrojar-glass" aria-hidden>
            <em className="hydrojar-water" />
            <em className="hydrojar-roots" />
          </span>
          <span className={`hydrojar-level ${jar.waterLevel === "low" && !isDone ? "warn" : ""}`}>
            {isDone ? "Done — jar's free" : LEVEL_LABELS[jar.waterLevel]}
          </span>
        </button>
        {!isDone && jar.waterLevel === "low" && (
          <p className="seedtest-overdue">
            Kratky rule: once roots reach the air gap, top up to just below the net cup with half-strength nutrient water.
          </p>
        )}

        <textarea
          className="seedtest-notes"
          placeholder="Jar notes — nutrient mix, window, root progress…"
          value={noteDrafts[jar.id] ?? jar.notes}
          onChange={(event) => setNotes(jar.id, event.target.value)}
          rows={2}
          readOnly={isDone}
        />

        <div className="seedtest-actions">
          {!isDone ? (
            <>
              <button
                className="primary-button"
                onClick={() => patchJar(jar.id, { status: "harvested" }, (current) => ({ ...current, status: "harvested", harvestedAt: new Date().toISOString() }))}
              >
                Harvest
              </button>
              <button
                className="secondary-button"
                onClick={() =>
                  askEve(
                    `My quart jar kratky ${label} is on day ${day}${jar.daysToHarvest ? ` of ~${jar.daysToHarvest}` : ""}, water level ${jar.waterLevel}. How does it look on schedule, and anything I should adjust this week?`,
                  )
                }
              >
                <Bot size={14} /> Ask Eve
              </button>
            </>
          ) : (
            <span className="seedtest-final">Rinse the jar and net cup, mix fresh nutrients, and start the next one 🌱</span>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="section-stack">
      <div className="section-intro">
        <h2>Quart Jar Hydroponics</h2>
        <p>
          Kratky in a quart mason jar: net cup in the lid, nutrient water below, no pump, no fuss. The water level does
          the work — as it drops, the roots follow it down and breathe in the gap. Tap each jar when the level changes,
          and the shelf keeps your windowsill garden honest.
        </p>
      </div>

      <div className="toolbar">
        <button className="primary-button" onClick={() => setShowNew((value) => !value)}>
          <Plus size={16} /> Start a jar
        </button>
      </div>

      {showNew && (
        <div className="seedtest-new">
          <div className="hydrojar-picks">
            {QUICK_PICKS.map((pick) => (
              <button key={pick.plant} onClick={() => startJar(pick.plant, pick.days)}>
                <span aria-hidden>{pick.emoji}</span> {pick.plant} <em>~{pick.days}d</em>
              </button>
            ))}
          </div>
          <form
            className="hydrojar-form"
            onSubmit={(event) => {
              event.preventDefault();
              startJar(plant);
            }}
          >
            <input
              className="pest-search"
              placeholder="Or type what's going in the jar…"
              value={plant}
              onChange={(event) => setPlant(event.target.value)}
            />
            <input
              className="pest-search"
              placeholder="Variety (optional)"
              value={variety}
              onChange={(event) => setVariety(event.target.value)}
            />
            <input
              className="pest-search"
              type="number"
              min={1}
              max={365}
              placeholder="~days to harvest"
              value={days}
              onChange={(event) => setDays(event.target.value)}
            />
            <button className="primary-button" type="submit" disabled={!plant.trim()}>
              Start
            </button>
          </form>
        </div>
      )}

      {loaded && !jars.length && !showNew && (
        <div className="empty-library">
          <GlassWater size={30} />
          <h3>The shelf is empty</h3>
          <p>
            Tap <strong>Start a jar</strong>, drop a seedling into the net cup, and fill with nutrient water to just
            below the cup. Lettuce and basil are the classic first jars.
          </p>
        </div>
      )}

      <div className="hydrojar-shelf">{growing.map(renderJar)}</div>

      {harvested.length > 0 && (
        <>
          <h3 className="apothecary-subhead">Harvest log</h3>
          <div className="hydrojar-shelf">{harvested.map(renderJar)}</div>
        </>
      )}

      {/* The reference shelf — Eve's complete quart-jar method */}
      <h3 className="apothecary-subhead">The quart jar method</h3>
      <article className="gh-card">
        <h3>Jar setup, start to salad</h3>
        <ol className="gh-hint" style={{ paddingLeft: "1.2rem", fontSize: "0.86rem" }}>
          <li>Fill the jar about ⅔ with water and stir in nutrient solution.</li>
          <li>Set the net basket in the lid; line it with rockwool or fill with clay balls.</li>
          <li>Add seeds or a seedling; slip a sleeve cover on for germination (dark = roots).</li>
          <li>Under grow lights: 14–16 hours on the vegetative (blue) setting.</li>
          <li>Glance at the water daily and top off as the level drops.</li>
          <li>Harvest continuously — cut outer leaves, the center keeps producing.</li>
        </ol>
      </article>
      <div className="ref-grid">
        <article className="gh-card">
          <h3>🧱 Rockwool</h3>
          <div className="ref-kv"><strong>Best for</strong><span>Herbs & lettuce starts</span></div>
          <div className="ref-kv"><strong>Prep</strong><span>Pre-soak in pH-balanced water</span></div>
          <div className="ref-kv"><strong>Reuse</strong><span>A few cycles · ~$1–2 per use</span></div>
          <p className="gh-hint">Excellent drainage and a snug seed bed — the classic starter cube.</p>
        </article>
        <article className="gh-card">
          <h3>🟤 Clay balls (LECA)</h3>
          <div className="ref-kv"><strong>Best for</strong><span>Longer crops that stay in the jar</span></div>
          <div className="ref-kv"><strong>Prep</strong><span>None — rinse and go</span></div>
          <div className="ref-kv"><strong>Reuse</strong><span>Indefinitely · ~$0.10–0.25 per use</span></div>
          <p className="gh-hint">The aeration champion — roots weave through and breathe between the balls.</p>
        </article>
        <article className="gh-card">
          <h3>🥥 Coconut coir</h3>
          <div className="ref-kv"><strong>Best for</strong><span>Moisture-loving plants</span></div>
          <div className="ref-kv"><strong>Prep</strong><span>Fluff and moisten</span></div>
          <div className="ref-kv"><strong>Reuse</strong><span>1–2 times · ~$1–1.50 per use</span></div>
          <p className="gh-hint">Holds water evenly and it&apos;s compostable when it&apos;s done.</p>
        </article>
      </div>
      <div className="ref-grid">
        <article className="gh-card">
          <h3>🌿 Basil, by the numbers</h3>
          <div className="ref-kv"><strong>Seed to harvest</strong><span>21–28 days</span></div>
          <div className="ref-kv"><strong>Water changes</strong><span>Every 7 days</span></div>
          <div className="ref-kv"><strong>Light</strong><span>14–16 h vegetative (blue)</span></div>
          <div className="ref-kv"><strong>Yield</strong><span>6–8 oz fresh basil per jar</span></div>
          <p className="gh-hint">Keep cutting above a leaf pair — one jar gives 3+ full cycles.</p>
        </article>
        <article className="gh-card">
          <h3>🥬 Lettuce, by the numbers</h3>
          <div className="ref-kv"><strong>Seed to harvest</strong><span>28–35 days</span></div>
          <div className="ref-kv"><strong>Water changes</strong><span>Every 7–10 days</span></div>
          <div className="ref-kv"><strong>Light</strong><span>14–16 h vegetative</span></div>
          <div className="ref-kv"><strong>Yield</strong><span>4–6 oz per jar</span></div>
          <p className="gh-hint">Cut outer leaves only and it regrows 2+ times before getting bitter.</p>
        </article>
      </div>
    </div>
  );
}
