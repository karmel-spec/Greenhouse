"use client";

/**
 * Seed Testing — Karmel's 12-plug hydroponic tester (cone plugs in water
 * under lights). Start a test from any packet in the library, tap plugs as
 * they sprout (or don't), and compare the measured germination rate to what
 * the packet claims. Finished tests keep their notes in a log.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, FlaskConical, Plus, X } from "lucide-react";
import { completeSeedVaultDatabase } from "@/lib/seed-vault-complete-database";
import { toSeedPacket } from "@/lib/user-seeds";
import type { SeedTestPlug, StoredSeedPacket, StoredSeedTest } from "@/lib/store";

function askEve(prompt: string) {
  window.dispatchEvent(new CustomEvent("eve-ask", { detail: prompt }));
}

const NEXT_PLUG: Record<SeedTestPlug, SeedTestPlug> = { sown: "sprouted", sprouted: "failed", failed: "sown" };

export function SeedTesting() {
  const [tests, setTests] = useState<StoredSeedTest[]>([]);
  const [userSeeds, setUserSeeds] = useState<StoredSeedPacket[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [seedQuery, setSeedQuery] = useState("");
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const noteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/seedtests").then((r) => r.json()).catch(() => ({})),
      fetch("/api/seeds").then((r) => r.json()).catch(() => ({})),
    ])
      .then(([testsData, seedsData]) => {
        setTests(Array.isArray(testsData.tests) ? testsData.tests : []);
        setUserSeeds(Array.isArray(seedsData.seeds) ? seedsData.seeds : []);
      })
      .finally(() => setLoaded(true));
  }, []);

  const allPackets = useMemo(() => {
    const merged = [...completeSeedVaultDatabase, ...userSeeds.map(toSeedPacket)];
    return merged.sort((a, b) => a.commonName.localeCompare(b.commonName) || (a.variety ?? "").localeCompare(b.variety ?? ""));
  }, [userSeeds]);

  const matches = seedQuery.trim()
    ? allPackets.filter((packet) => `${packet.commonName} ${packet.variety ?? ""}`.toLowerCase().includes(seedQuery.trim().toLowerCase()))
    : [];

  const startTest = async (packet: (typeof allPackets)[number]) => {
    const response = await fetch("/api/seedtests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seedName: packet.commonName,
        variety: packet.variety,
        claimedGermination: packet.germinationRate,
        daysToGermination: packet.daysToGermination,
      }),
    }).catch(() => null);
    const data = await response?.json();
    if (data?.tests) {
      setTests(data.tests);
      setShowNew(false);
      setSeedQuery("");
    }
  };

  const patchTest = (id: string, payload: object, optimistic?: (test: StoredSeedTest) => StoredSeedTest) => {
    if (optimistic) {
      setTests((current) => current.map((test) => (test.id === id ? optimistic(test) : test)));
    }
    fetch("/api/seedtests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...payload }),
    }).catch(() => {});
  };

  const cyclePlug = (test: StoredSeedTest, index: number) => {
    // Functional-style: compute from the latest copy in state.
    setTests((current) =>
      current.map((candidate) => {
        if (candidate.id !== test.id) return candidate;
        const plugs = candidate.plugs.slice();
        plugs[index] = NEXT_PLUG[plugs[index]];
        fetch("/api/seedtests", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: candidate.id, plugs }),
        }).catch(() => {});
        return { ...candidate, plugs };
      }),
    );
  };

  const setNotes = (id: string, value: string) => {
    setNoteDrafts((current) => ({ ...current, [id]: value }));
    if (noteTimers.current[id]) clearTimeout(noteTimers.current[id]);
    noteTimers.current[id] = setTimeout(() => patchTest(id, { notes: value }), 600);
  };

  const removeTest = async (id: string) => {
    setTests((current) => current.filter((test) => test.id !== id));
    await fetch(`/api/seedtests?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
  };

  const active = tests.filter((test) => test.status === "active");
  const done = tests.filter((test) => test.status === "done");

  const testMath = (test: StoredSeedTest) => {
    const sprouted = test.plugs.filter((plug) => plug === "sprouted").length;
    const failed = test.plugs.filter((plug) => plug === "failed").length;
    const measured = Math.round((sprouted / test.plugs.length) * 100);
    const day = Math.max(1, Math.ceil((Date.now() - Date.parse(test.startedAt)) / 86_400_000));
    const overdue = test.daysToGermination ? day > test.daysToGermination + 4 : day > 14;
    return { sprouted, failed, measured, day, overdue };
  };

  const renderTest = (test: StoredSeedTest) => {
    const math = testMath(test);
    const label = `${test.seedName}${test.variety ? ` '${test.variety}'` : ""}`;
    const isDone = test.status === "done";
    return (
      <article key={test.id} className={`seedtest-card ${isDone ? "done" : ""}`}>
        <div className="seedtest-head">
          <div>
            <strong>{label}</strong>
            <span className="seedtest-meta">
              {isDone ? "Finished" : `Day ${math.day}`} · started {new Date(test.startedAt).toLocaleDateString()}
              {test.daysToGermination ? ` · expect sprouts in ~${test.daysToGermination}d` : ""}
            </span>
          </div>
          <button className="plant-remove" onClick={() => removeTest(test.id)} aria-label={`Delete test of ${label}`}><X size={14} /></button>
        </div>

        {/* Top view of the 12-plug hydroponic tester — wells fill with seedlings */}
        <div className="hydro-tester">
          <div className="hydro-lightbar" aria-hidden>
            <span /><span /><span /><span /><span /><span />
          </div>
          <div className="hydro-basin">
            {test.plugs.map((plug, index) => (
              <button
                key={index}
                className={`hydro-well well-${plug}`}
                onClick={() => !isDone && cyclePlug(test, index)}
                title={isDone ? `Plug ${index + 1}: ${plug}` : `Plug ${index + 1}: ${plug} — tap to cycle sown → sprouted → no-show`}
                disabled={isDone}
              >
                <span className="hydro-plug">
                  {plug === "sprouted" && <em className="hydro-seedling">🌱</em>}
                  {plug === "failed" && <em className="hydro-noshow">✕</em>}
                  {plug === "sown" && <em className="hydro-seed" />}
                </span>
              </button>
            ))}
          </div>
          <p className="hydro-caption">Your 12-plug tester from above — lights on, water below. Tap a well when it sprouts.</p>
        </div>

        <div className="seedtest-score">
          <span><strong>{math.sprouted}</strong>/12 sprouted{math.failed ? ` · ${math.failed} no-shows` : ""}</span>
          <span className={`seedtest-verdict ${test.claimedGermination && math.measured >= test.claimedGermination - 10 ? "good" : math.sprouted + math.failed === 0 ? "" : "poor"}`}>
            Measured <strong>{math.measured}%</strong>
            {test.claimedGermination ? ` vs packet's ${test.claimedGermination}%` : ""}
          </span>
        </div>
        {!isDone && math.overdue && math.sprouted < test.plugs.length && (
          <p className="seedtest-overdue">Past the germination window — mark the quiet plugs ✕ and consider this packet's real rate.</p>
        )}

        <textarea
          className="seedtest-notes"
          placeholder="Test notes — water level, light hours, what you observed…"
          value={noteDrafts[test.id] ?? test.notes}
          onChange={(event) => setNotes(test.id, event.target.value)}
          rows={2}
          readOnly={isDone}
        />

        <div className="seedtest-actions">
          {!isDone ? (
            <>
              <button
                className="primary-button"
                onClick={() => patchTest(test.id, { status: "done" }, (candidate) => ({ ...candidate, status: "done" }))}
              >
                Finish test
              </button>
              <button
                className="secondary-button"
                onClick={() => askEve(`My seed test of ${label} is on day ${math.day}: ${math.sprouted}/12 plugs sprouted (packet claims ${test.claimedGermination ?? "?"}% germination) in the hydroponic tester under lights. What should I conclude, and should I adjust anything this week?`)}
              >
                <Bot size={14} /> Ask Eve
              </button>
            </>
          ) : (
            <span className="seedtest-final">
              Final: {math.measured}% germination{test.claimedGermination ? ` (packet claimed ${test.claimedGermination}%)` : ""} —
              {test.claimedGermination && math.measured >= test.claimedGermination - 10 ? " seed is holding strong 🌱" : " sow this one thicker to compensate"}
            </span>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="section-stack">
      <div className="section-intro">
        <h2>Seed Testing Lab</h2>
        <p>
          Twelve cone plugs, hydroponic water, lights on — your germination tester gets its own lab book. Start a test
          from any packet, tap plugs as they sprout, and see the packet&apos;s real germination rate versus its promise.
        </p>
      </div>

      <div className="toolbar">
        <button className="primary-button" onClick={() => setShowNew((value) => !value)}>
          <Plus size={16} /> New seed test
        </button>
      </div>

      {showNew && (
        <div className="seedtest-new">
          <input
            className="pest-search"
            type="search"
            placeholder="Search your seed library — which packet goes in the tester?"
            value={seedQuery}
            onChange={(event) => setSeedQuery(event.target.value)}
            autoFocus
          />
          {matches.length > 0 && (
            <div className="seedtray-seedlist seedtest-picker">
              {matches.slice(0, 12).map((packet) => (
                <button key={packet.id} onClick={() => startTest(packet)}>
                  <strong>{packet.commonName}</strong>
                  {packet.variety ? <em> &apos;{packet.variety}&apos;</em> : null}
                  <span>{packet.germinationRate}% claimed{packet.daysToGermination ? ` · ~${packet.daysToGermination}d` : ""}</span>
                </button>
              ))}
            </div>
          )}
          {seedQuery.trim() && !matches.length && <p className="empty-note">No packet matches — add it in the Seed Library first.</p>}
        </div>
      )}

      {loaded && !tests.length && !showNew && (
        <div className="empty-library">
          <FlaskConical size={30} />
          <h3>Load the tester</h3>
          <p>
            Tap <strong>New seed test</strong>, pick a packet, and drop 12 seeds into the cone plugs. As green tips
            appear, tap each plug — the lab keeps score against the packet&apos;s claimed germination.
          </p>
        </div>
      )}

      {active.map(renderTest)}

      {done.length > 0 && (
        <>
          <h3 className="apothecary-subhead">Test log</h3>
          {done.map(renderTest)}
        </>
      )}
    </div>
  );
}
