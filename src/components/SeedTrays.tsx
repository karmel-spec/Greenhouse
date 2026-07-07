"use client";

/**
 * Seed Trays — design a seed-starting tray cell by cell from the real seed
 * vault, then track germination: sown → sprouted (or failed) → transplanted.
 * Germination expectations come from each packet's daysToGermination and
 * germinationRate in the seed database.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Check, Pencil, Plus, Sprout, X } from "lucide-react";
import { completeSeedVaultDatabase } from "@/lib/seed-vault-complete-database";
import type { SeedTrayCell, StoredSeedTray } from "@/lib/store";

function askEve(prompt: string) {
  window.dispatchEvent(new CustomEvent("eve-ask", { detail: prompt }));
}

const TRAY_SIZES = [
  { label: "72-cell (6 × 12)", rows: 6, cols: 12 },
  { label: "50-cell (5 × 10)", rows: 5, cols: 10 },
  { label: "32-cell (4 × 8)", rows: 4, cols: 8 },
  { label: "18-cell (3 × 6)", rows: 3, cols: 6 },
];

type Brush =
  | { mode: "sow"; seed: string; variety?: string }
  | { mode: "sprouted" }
  | { mode: "failed" }
  | { mode: "transplanted" }
  | { mode: "erase" };

const STATE_GLYPH: Record<string, string> = { sown: "·", sprouted: "🌱", failed: "✕", transplanted: "✓" };

// unique seed entries, alphabetized
const SEED_CHOICES = [...completeSeedVaultDatabase]
  .sort((a, b) => a.commonName.localeCompare(b.commonName) || (a.variety ?? "").localeCompare(b.variety ?? ""))
  .map((packet) => ({
    key: `${packet.commonName}|${packet.variety ?? ""}`,
    seed: packet.commonName,
    variety: packet.variety,
    daysToGermination: packet.daysToGermination,
    germinationRate: packet.germinationRate,
    startIndoors: packet.startIndoors,
  }));

export function SeedTraysSection() {
  const [trays, setTrays] = useState<StoredSeedTray[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("Spring starts #1");
  const [newSize, setNewSize] = useState(0);
  const [brush, setBrush] = useState<Brush>({ mode: "sprouted" });
  const [seedQuery, setSeedQuery] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/seedtrays")
      .then((r) => r.json())
      .then((data) => {
        const list: StoredSeedTray[] = Array.isArray(data.trays) ? data.trays : [];
        setTrays(list);
        if (list.length) setActiveId(list[0].id);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const active = trays.find((tray) => tray.id === activeId) ?? null;

  const persist = (tray: StoredSeedTray) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch("/api/seedtrays", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tray.id, cells: tray.cells, name: tray.name }),
      }).catch(() => {});
    }, 500);
  };

  const updateActive = (mutate: (tray: StoredSeedTray) => StoredSeedTray) => {
    if (!activeId) return;
    // Functional update so rapid cell taps never work from stale state.
    setTrays((current) => {
      const tray = current.find((candidate) => candidate.id === activeId);
      if (!tray) return current;
      const next = mutate(tray);
      persist(next);
      return current.map((candidate) => (candidate.id === next.id ? next : candidate));
    });
  };

  const newTray = async (event: React.FormEvent) => {
    event.preventDefault();
    const size = TRAY_SIZES[newSize];
    const response = await fetch("/api/seedtrays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() || "New tray", rows: size.rows, cols: size.cols }),
    }).catch(() => null);
    const data = await response?.json();
    if (data?.tray) {
      setTrays(data.trays);
      setActiveId(data.tray.id);
      setShowNew(false);
    }
  };

  const removeTray = async (id: string) => {
    setTrays((current) => current.filter((tray) => tray.id !== id));
    if (activeId === id) setActiveId(trays.find((tray) => tray.id !== id)?.id ?? null);
    await fetch(`/api/seedtrays?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
  };

  const paintCell = (index: number) => {
    updateActive((tray) => {
      const cells = tray.cells.slice();
      const current = cells[index];
      if (brush.mode === "erase") cells[index] = null;
      else if (brush.mode === "sow") cells[index] = { seed: brush.seed, variety: brush.variety, state: "sown" };
      else if (current) cells[index] = { ...current, state: brush.mode };
      return { ...tray, cells };
    });
  };

  const stats = useMemo(() => {
    if (!active) return null;
    const filled = active.cells.filter(Boolean) as NonNullable<SeedTrayCell>[];
    const sprouted = filled.filter((cell) => cell.state === "sprouted" || cell.state === "transplanted").length;
    const failed = filled.filter((cell) => cell.state === "failed").length;
    const resolved = sprouted + failed;
    const dayNumber = Math.max(1, Math.ceil((Date.now() - Date.parse(active.sownAt)) / 86_400_000));
    return {
      filled: filled.length,
      open: active.cells.length - filled.length,
      sprouted,
      failed,
      germination: resolved ? Math.round((sprouted / resolved) * 100) : null,
      dayNumber,
    };
  }, [active]);

  const expectations = useMemo(() => {
    if (!active) return [];
    const seedNames = new Set(
      (active.cells.filter(Boolean) as NonNullable<SeedTrayCell>[]).map((cell) => `${cell.seed}|${cell.variety ?? ""}`),
    );
    return SEED_CHOICES.filter((choice) => seedNames.has(choice.key));
  }, [active]);

  const filteredSeeds = seedQuery.trim()
    ? SEED_CHOICES.filter((choice) =>
        `${choice.seed} ${choice.variety ?? ""}`.toLowerCase().includes(seedQuery.trim().toLowerCase()),
      )
    : SEED_CHOICES;

  const seedInitials = (cell: NonNullable<SeedTrayCell>) =>
    cell.seed
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="section-stack">
      <div className="section-intro">
        <h2>Seed Trays</h2>
        <p>
          Design a starting tray cell by cell from your real seed vault, then track it to transplant day — mark cells as
          they sprout and the tray keeps a live germination score.
        </p>
      </div>

      <div className="toolbar">
        <button className="primary-button" onClick={() => setShowNew((value) => !value)}>
          <Plus size={16} /> New seed tray
        </button>
      </div>

      {showNew && (
        <form className="compost-new" onSubmit={newTray}>
          <label>
            Tray name
            <input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="e.g. Tomatoes & peppers, March" autoFocus />
          </label>
          <label>
            Size
            <select value={newSize} onChange={(event) => setNewSize(Number(event.target.value))}>
              {TRAY_SIZES.map((size, index) => (
                <option key={size.label} value={index}>{size.label}</option>
              ))}
            </select>
          </label>
          <button className="primary-button" type="submit">Create tray</button>
        </form>
      )}

      {loaded && !trays.length && !showNew && (
        <div className="empty-library">
          <Sprout size={30} />
          <h3>Start your first seed tray</h3>
          <p>
            Tap <strong>New seed tray</strong>, pick a cell count, then choose seeds from your vault and tap cells to sow
            them. When green tips appear, switch to the 🌱 brush and tap the winners.
          </p>
        </div>
      )}

      {trays.length > 0 && (
        <div className="bed-tabs">
          {trays.map((tray) => (
            <button key={tray.id} className={`bed-tab ${tray.id === activeId ? "active" : ""}`} onClick={() => setActiveId(tray.id)}>
              {tray.name}
            </button>
          ))}
          <button className="bed-tab ghost" onClick={() => setShowNew(true)} title="Add another tray"><Plus size={14} /></button>
        </div>
      )}

      {active && stats && (
        <>
          <label className="bed-name-field">
            <Pencil size={14} />
            <input
              value={active.name}
              onChange={(event) => updateActive((tray) => ({ ...tray, name: event.target.value }))}
              placeholder="Name this tray"
            />
            <button className="tray-btn" onClick={() => removeTray(active.id)} title="Delete tray"><X size={14} /></button>
          </label>

          <div className="community-stats seedtray-stats">
            <span>Day <strong>{stats.dayNumber}</strong></span>
            <span><strong>{stats.filled}</strong> sown · <strong>{stats.open}</strong> open cells</span>
            <span><strong>{stats.sprouted}</strong> sprouted</span>
            {stats.failed > 0 && <span><strong>{stats.failed}</strong> no-shows</span>}
            {stats.germination !== null && <span><strong>{stats.germination}%</strong> germination so far</span>}
          </div>

          <div className="seedtray-layout">
            <div className="seedtray-grid-wrap">
              <div className="seedtray-grid" style={{ gridTemplateColumns: `repeat(${active.cols}, 1fr)` }}>
                {active.cells.map((cell, index) => (
                  <button
                    key={index}
                    className={`seedtray-cell ${cell ? `st-${cell.state}` : "st-empty"}`}
                    title={cell ? `${cell.seed}${cell.variety ? ` '${cell.variety}'` : ""} — ${cell.state}` : "Empty cell"}
                    onClick={() => paintCell(index)}
                  >
                    {cell ? (cell.state === "sown" ? seedInitials(cell) : STATE_GLYPH[cell.state]) : ""}
                  </button>
                ))}
              </div>
              <p className="community-hint">
                Tap cells with the selected brush. Initials = sown seed; 🌱 sprouted; ✕ didn&apos;t come up; ✓ transplanted out.
              </p>
            </div>

            <div className="seedtray-tools">
              <h4>Brushes</h4>
              <div className="seedtray-brushes">
                <button className={brush.mode === "sprouted" ? "active" : ""} onClick={() => setBrush({ mode: "sprouted" })}>🌱 Sprouted</button>
                <button className={brush.mode === "failed" ? "active" : ""} onClick={() => setBrush({ mode: "failed" })}>✕ No-show</button>
                <button className={brush.mode === "transplanted" ? "active" : ""} onClick={() => setBrush({ mode: "transplanted" })}><Check size={13} /> Transplanted</button>
                <button className={brush.mode === "erase" ? "active" : ""} onClick={() => setBrush({ mode: "erase" })}>🚫 Erase</button>
              </div>

              <h4>Sow from the seed vault</h4>
              <input
                className="pest-search"
                type="search"
                placeholder="Search your 119 packets…"
                value={seedQuery}
                onChange={(event) => setSeedQuery(event.target.value)}
              />
              <div className="seedtray-seedlist">
                {filteredSeeds.slice(0, 40).map((choice) => (
                  <button
                    key={choice.key}
                    className={brush.mode === "sow" && brush.seed === choice.seed && brush.variety === choice.variety ? "active" : ""}
                    onClick={() => setBrush({ mode: "sow", seed: choice.seed, variety: choice.variety })}
                  >
                    <strong>{choice.seed}</strong>
                    {choice.variety ? <em> &apos;{choice.variety}&apos;</em> : null}
                    {choice.daysToGermination ? <span>{choice.daysToGermination}d · {choice.germinationRate}%</span> : null}
                  </button>
                ))}
                {!filteredSeeds.length && <p className="empty-note">No packet matches that search.</p>}
              </div>
            </div>
          </div>

          {expectations.length > 0 && (
            <div className="seedtray-expectations">
              <h4>What to expect in this tray</h4>
              <ul>
                {expectations.map((choice) => {
                  const overdue = choice.daysToGermination && stats.dayNumber > choice.daysToGermination + 4;
                  return (
                    <li key={choice.key} className={overdue ? "overdue" : ""}>
                      <strong>{choice.seed}{choice.variety ? ` '${choice.variety}'` : ""}</strong> — germinates in ~
                      {choice.daysToGermination ?? "?"} days at {choice.germinationRate}% (2020 packet)
                      {overdue ? " — past the window; re-sow the quiet cells." : ""}
                    </li>
                  );
                })}
              </ul>
              <button
                className="secondary-button"
                onClick={() =>
                  askEve(
                    `My seed tray "${active.name}" is on day ${stats.dayNumber}: ${stats.filled} cells sown, ${stats.sprouted} sprouted, ${stats.failed} failed. ` +
                      `It contains: ${expectations.map((entry) => entry.seed + (entry.variety ? ` '${entry.variety}'` : "")).join(", ")}. ` +
                      `What should I do this week — heat, light, moisture, re-sowing, or transplant prep?`,
                  )
                }
              >
                <Bot size={15} /> Ask Eve about this tray
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
