"use client";

/**
 * Composting — learn the craft, then run real piles with a persisted log.
 * Knowledge lives in src/lib/compost.ts; piles persist via /api/compost.
 */

import { useEffect, useMemo, useState } from "react";
import { Bot, Droplets, Flame, Leaf, Plus, RotateCw, Thermometer, Trash2, X } from "lucide-react";
import { COMPOSTABLES, COMPOST_FIXES, COMPOST_METHODS, UTAH_COMPOST_NOTES, pileStatus } from "@/lib/compost";
import type { StoredCompostPile } from "@/lib/store";

function askEve(prompt: string) {
  window.dispatchEvent(new CustomEvent("eve-ask", { detail: prompt }));
}

const VERDICT_LABEL = { yes: "Compost it", caution: "With care", no: "Keep it out" } as const;

export function CompostSection() {
  const [piles, setPiles] = useState<StoredCompostPile[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("Greenhouse pile");
  const [newMethod, setNewMethod] = useState("hot");
  const [tempDraft, setTempDraft] = useState<Record<string, string>>({});
  const [lookup, setLookup] = useState("");
  const [openMethod, setOpenMethod] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/compost")
      .then((r) => r.json())
      .then((data) => setPiles(Array.isArray(data.piles) ? data.piles : []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const createPile = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/compost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, method: newMethod }),
    }).catch(() => null);
    const data = await response?.json();
    if (data?.piles) setPiles(data.piles);
    setShowNew(false);
  };

  const patchPile = async (id: string, payload: object) => {
    const response = await fetch("/api/compost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...payload }),
    }).catch(() => null);
    const data = await response?.json();
    if (data?.piles) setPiles(data.piles);
  };

  const removePile = async (id: string) => {
    setPiles((current) => current.filter((pile) => pile.id !== id));
    await fetch(`/api/compost?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
  };

  const logTemp = (id: string) => {
    const value = Number(tempDraft[id]);
    if (!value) return;
    patchPile(id, { logEntry: { type: "temp", tempF: value } });
    setTempDraft((current) => ({ ...current, [id]: "" }));
  };

  const query = lookup.trim().toLowerCase();
  const matches = useMemo(
    () => (query ? COMPOSTABLES.filter((c) => c.item.toLowerCase().includes(query) || c.note.toLowerCase().includes(query)) : COMPOSTABLES),
    [query],
  );

  const activePiles = piles.filter((pile) => pile.status !== "done");
  const donePiles = piles.filter((pile) => pile.status === "done");

  return (
    <div className="section-stack">
      <div className="section-intro">
        <h2>Composting</h2>
        <p>
          Turn greenhouse trimmings, spent trays, and kitchen scraps into the best soil amendment money can&apos;t buy —
          tuned for Orem&apos;s dry air and alkaline soil, with live tracking for every pile you start.
        </p>
      </div>

      {/* The recipe */}
      <div className="compost-recipe">
        <div className="compost-recipe-col browns">
          <h3>Browns <span>· carbon · 2–3 parts</span></h3>
          <p>Dry leaves, straw, shredded cardboard, wood chips. The pile&apos;s structure and fuel.</p>
        </div>
        <div className="compost-recipe-plus">+</div>
        <div className="compost-recipe-col greens">
          <h3>Greens <span>· nitrogen · 1 part</span></h3>
          <p>Scraps, clippings, coffee grounds, plant trimmings. The pile&apos;s engine.</p>
        </div>
        <div className="compost-recipe-plus">+</div>
        <div className="compost-recipe-col extras">
          <h3>Air &amp; water</h3>
          <p>Moist as a wrung-out sponge, turned for oxygen. In Utah, water is the one you&apos;ll forget.</p>
        </div>
      </div>

      {/* Live piles */}
      <div className="compost-piles">
        <div className="compost-piles-head">
          <h3>Your piles</h3>
          <button className="primary-button" onClick={() => setShowNew((v) => !v)}><Plus size={15} /> Start a pile</button>
        </div>

        {showNew && (
          <form className="compost-new" onSubmit={createPile}>
            <label>
              Name
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Greenhouse pile, Fall leaves batch" />
            </label>
            <label>
              Method
              <select value={newMethod} onChange={(e) => setNewMethod(e.target.value)}>
                {COMPOST_METHODS.map((m) => <option key={m.key} value={m.key}>{m.name} ({m.timeline})</option>)}
              </select>
            </label>
            <button className="primary-button" type="submit">Start tracking</button>
          </form>
        )}

        {loaded && !activePiles.length && !showNew && (
          <p className="empty-note">
            No piles yet. Tap <strong>Start a pile</strong>, then log what you add and every turn — the tracker estimates
            when it&apos;s ready and tells you what the pile needs.
          </p>
        )}

        {activePiles.map((pile) => {
          const status = pileStatus(pile);
          return (
            <article key={pile.id} className="compost-pile">
              <div className="compost-pile-head">
                <div>
                  <strong>{pile.name}</strong>
                  <span className="compost-pile-meta">
                    {status.method.name} · week {Math.max(1, Math.ceil(status.weeks))} · ready in {status.method.timeline}
                    {pile.status === "curing" ? " · curing" : ""}
                  </span>
                </div>
                <button className="plant-remove" onClick={() => removePile(pile.id)} aria-label={`Delete ${pile.name}`}><X size={14} /></button>
              </div>

              <div className="progress compost-progress"><i style={{ width: `${Math.round(status.progress * 100)}%` }} /></div>

              <div className="compost-gauges">
                <span><Leaf size={14} /> {status.greens} greens · {status.browns} browns logged{status.balance !== "unknown" ? ` — ${status.balance === "balanced" ? "good balance" : status.balance === "greeny" ? "running green" : "running brown"}` : ""}</span>
                <span><RotateCw size={14} /> {status.turnCount} turns{status.daysSinceTurn !== null ? ` (last ${status.daysSinceTurn}d ago)` : ""}</span>
                {status.lastTemp !== null && <span><Flame size={14} /> last temp {status.lastTemp}°F</span>}
              </div>

              <div className="compost-advice">
                {status.advice.map((line) => <p key={line}>{line}</p>)}
              </div>

              <div className="compost-actions">
                <button onClick={() => patchPile(pile.id, { logEntry: { type: "greens" } })}><Leaf size={14} /> Added greens</button>
                <button onClick={() => patchPile(pile.id, { logEntry: { type: "browns" } })}>🍂 Added browns</button>
                <button onClick={() => patchPile(pile.id, { logEntry: { type: "turn" } })}><RotateCw size={14} /> Turned it</button>
                <button onClick={() => patchPile(pile.id, { logEntry: { type: "water" } })}><Droplets size={14} /> Watered</button>
                <span className="compost-temp">
                  <Thermometer size={14} />
                  <input
                    value={tempDraft[pile.id] ?? ""}
                    onChange={(e) => setTempDraft((current) => ({ ...current, [pile.id]: e.target.value.replace(/\D/g, "") }))}
                    placeholder="°F"
                    inputMode="numeric"
                  />
                  <button onClick={() => logTemp(pile.id)}>Log</button>
                </span>
                {pile.status === "active" && status.maybeReady && (
                  <button className="cure" onClick={() => patchPile(pile.id, { status: "curing" })}>Start curing</button>
                )}
                {pile.status === "curing" && (
                  <button className="cure" onClick={() => patchPile(pile.id, { status: "done" })}>Mark finished</button>
                )}
              </div>
            </article>
          );
        })}

        {donePiles.length > 0 && (
          <p className="compost-done">
            ✅ Finished: {donePiles.map((pile) => pile.name).join(", ")} — beautiful work.
            <button className="tray-btn" onClick={() => donePiles.forEach((pile) => removePile(pile.id))} title="Clear finished piles"><Trash2 size={13} /></button>
          </p>
        )}
      </div>

      {/* Methods */}
      <div className="compost-methods">
        <h3>Pick your method</h3>
        <div className="compost-method-grid">
          {COMPOST_METHODS.map((method) => (
            <button
              key={method.key}
              className={`compost-method ${openMethod === method.key ? "active" : ""}`}
              onClick={() => setOpenMethod((current) => (current === method.key ? null : method.key))}
            >
              <strong>{method.name}</strong>
              <span className="compost-method-time">{method.timeline}</span>
              <span className="compost-method-effort">{method.effort}</span>
              <span className="compost-method-best">{method.bestFor}</span>
            </button>
          ))}
        </div>
        {openMethod && (
          <ol className="compost-method-steps">
            {COMPOST_METHODS.find((method) => method.key === openMethod)!.how.map((step) => <li key={step}>{step}</li>)}
          </ol>
        )}
      </div>

      {/* What goes in */}
      <div className="compost-lookup">
        <h3>Can I compost it?</h3>
        <input
          type="search"
          className="pest-search"
          placeholder="Type anything — eggshells, citrus, bread, walnut leaves…"
          value={lookup}
          onChange={(e) => setLookup(e.target.value)}
        />
        <div className="compost-items">
          {matches.map((entry) => (
            <div key={entry.item} className={`compost-item ${entry.verdict}`}>
              <span className="compost-item-verdict">{VERDICT_LABEL[entry.verdict]}</span>
              <strong>{entry.item}{entry.kind ? <em> · {entry.kind}</em> : null}</strong>
              <p>{entry.note}</p>
            </div>
          ))}
          {!matches.length && <p className="empty-note">Not in the list — ask Eve below and she&apos;ll rule on it.</p>}
        </div>
      </div>

      {/* Troubleshooting + Utah */}
      <div className="compost-columns">
        <div className="compost-fixes">
          <h3>When it goes sideways</h3>
          {COMPOST_FIXES.map((fix) => (
            <div key={fix.problem} className="compost-fix">
              <strong>{fix.problem}</strong>
              <p><em>{fix.cause}.</em> {fix.fix}</p>
            </div>
          ))}
        </div>
        <div className="compost-utah">
          <h3>Composting in Orem</h3>
          <ul>
            {UTAH_COMPOST_NOTES.map((note) => <li key={note}>{note}</li>)}
          </ul>
          <button
            className="secondary-button"
            onClick={() => askEve("Coach me through composting in Orem: given my greenhouse trimmings, spent microgreen mats, and kitchen scraps, which composting method should I start with, where should the pile go, and what should I do this week?")}
          >
            <Bot size={15} /> Ask Eve to set up my first pile
          </button>
        </div>
      </div>
    </div>
  );
}
