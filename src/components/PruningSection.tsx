"use client";

/**
 * Pruning — which of Karmel's real plants need pruning, when, and how.
 * Plants come from the live Plant Library; instructions from src/lib/pruning.
 */

import { useEffect, useMemo, useState } from "react";
import { Bot, Scissors } from "lucide-react";
import { pruningGuide, pruneNow, type PruningGuide } from "@/lib/pruning";

function askEve(prompt: string) {
  window.dispatchEvent(new CustomEvent("eve-ask", { detail: prompt }));
}

type LibraryPlant = { id: string; name: string; zone: string; health: string; photo?: string };

type PrunablePlant = { plant: LibraryPlant; guide: PruningGuide; now: boolean };

export function PruningSection() {
  const [plants, setPlants] = useState<LibraryPlant[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/plants")
      .then((r) => r.json())
      .then((data) => setPlants(Array.isArray(data.plants) ? data.plants : []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const prunable = useMemo<PrunablePlant[]>(() => {
    const seen = new Set<string>();
    const matched: PrunablePlant[] = [];
    for (const plant of plants) {
      const key = plant.name.toLowerCase();
      if (seen.has(key)) continue;
      const guide = pruningGuide(plant.name);
      if (!guide) continue;
      seen.add(key);
      matched.push({ plant, guide, now: pruneNow(guide) });
    }
    // Prune-now first, then alphabetical
    return matched.sort((a, b) => Number(b.now) - Number(a.now) || a.plant.name.localeCompare(b.plant.name));
  }, [plants]);

  const nowCount = prunable.filter((entry) => entry.now).length;
  const monthName = new Date().toLocaleDateString([], { month: "long" });

  return (
    <div className="section-stack">
      <div className="section-intro">
        <h2>Pruning Guide</h2>
        <p>
          Every plant in your library that wants pruning — sorted so what needs the snips <em>this month</em> comes
          first, with exactly when and how for each one.
        </p>
      </div>

      <div className="community-stats pruning-stats">
        <span><Scissors size={14} /> <strong>{prunable.length}</strong> of your plants need pruning</span>
        <span><strong>{nowCount}</strong> are in their pruning window in {monthName}</span>
      </div>

      {loaded && !prunable.length && (
        <p className="empty-note">No plants in the library match the pruning guide yet — add plants via the Photo Journal and they&apos;ll appear here.</p>
      )}

      <div className="pruning-grid">
        {prunable.map(({ plant, guide, now }) => {
          const open = openId === plant.id;
          return (
            <article key={plant.id} className={`pruning-card ${now ? "due" : ""} ${open ? "open" : ""}`}>
              <button className="pruning-head" onClick={() => setOpenId(open ? null : plant.id)}>
                <span className="pruning-photo">
                  {plant.photo ? <img src={plant.photo} alt={plant.name} loading="lazy" /> : <Scissors size={20} />}
                </span>
                <span className="pruning-head-body">
                  <strong>{plant.name}</strong>
                  <em>{guide.plantType} · {plant.zone}</em>
                  <span className={`pruning-badge ${now ? "now" : ""}`}>
                    {now ? `✂️ Prune window open — ${monthName}` : `Wait — ${guide.when.split(";")[0].split("(")[0].trim()}`}
                  </span>
                </span>
              </button>
              {open && (
                <div className="pruning-detail">
                  <p className="pruning-when"><strong>When:</strong> {guide.when}</p>
                  <ol>
                    {guide.how.map((step) => <li key={step}>{step}</li>)}
                  </ol>
                  {guide.caution && <p className="pruning-caution">⚠️ {guide.caution}</p>}
                  <button
                    className="secondary-button"
                    onClick={() => askEve(`Walk me through pruning my ${plant.name} (${guide.plantType}, in ${plant.zone}) this week — it's ${monthName} in Orem. Step by step, and what tools to bring.`)}
                  >
                    <Bot size={14} /> Ask Eve to walk me through it
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="pest-habits">
        <h3>Pruning principles worth keeping</h3>
        <ul>
          <li>Sharp, clean tools — wipe blades with rubbing alcohol between plants to avoid spreading disease.</li>
          <li>The 3 D&apos;s always go first: dead, damaged, diseased.</li>
          <li>Never take more than a third of a plant at once (a quarter for trees).</li>
          <li>Cut just above a bud or node, angled away from it.</li>
          <li>Spring bloomers get pruned right after flowering; summer bloomers and fruit in late winter.</li>
          <li>When in doubt, prune less — you can always cut more next month.</li>
        </ul>
      </div>
    </div>
  );
}
