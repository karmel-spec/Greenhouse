"use client";

/**
 * Today's Bouquet — celebrate what you DID do. Check a nurturing action,
 * earn its flower, watch the day's bouquet fill the vase. Flowers are never
 * lost: no streaks, only growth. Built from Karmel's Daily Bouquet mockups.
 * Actions are grouped by category, and Karmel can add her own (name + flower).
 */

import { useEffect, useMemo, useState } from "react";
import { Heart, Plus, X } from "lucide-react";
import {
  BOUQUET_ACTIONS,
  BOUQUET_CATEGORIES,
  COMPASSION_ACTION,
  FLOWER_CHOICES,
  REDEEM_TIERS,
  bouquetTag,
  todayKey,
  type BouquetAction,
} from "@/lib/bouquet";
import type { BouquetHistory, StoredBouquetAction } from "@/lib/store";
import { BouquetStage } from "@/components/BouquetStage";

/** Lets the sidebar mini-bouquet refresh the moment a box is checked. */
function announceChange() {
  window.dispatchEvent(new CustomEvent("bouquet-changed"));
}


export function TodaysBouquet() {
  const [history, setHistory] = useState<BouquetHistory>({});
  const [custom, setCustom] = useState<StoredBouquetAction[]>([]);
  const [art, setArt] = useState<Record<string, string>>({});
  const [painting, setPainting] = useState(false);
  const [paintNote, setPaintNote] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ label: "", flowerIndex: 0, category: "Soul", newCategory: "" });
  const today = todayKey();

  useEffect(() => {
    fetch("/api/bouquet")
      .then((r) => r.json())
      .then((data) => {
        setHistory(data.history && typeof data.history === "object" ? data.history : {});
        setCustom(Array.isArray(data.custom) ? data.custom : []);
        setArt(data.art && typeof data.art === "object" ? data.art : {});
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const paint = async () => {
    if (painting) return;
    setPainting(true);
    setPaintNote("Eve is painting your bouquet… this takes about a minute. 🎨");
    try {
      const response = await fetch("/api/bouquet/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: today }),
      });
      const data = await response.json();
      if (data.art) {
        setArt(data.art);
        setPaintNote("");
        announceChange();
      } else {
        setPaintNote(data.error ?? "The painting didn't come through — try again in a moment.");
      }
    } catch {
      setPaintNote("The painting didn't come through — try again in a moment.");
    } finally {
      setPainting(false);
    }
  };

  const allActions: BouquetAction[] = useMemo(
    () => [
      ...BOUQUET_ACTIONS,
      ...custom.map((action) => ({
        key: action.key,
        label: action.label,
        flower: action.flower,
        emoji: action.emoji,
        meaning: `${action.flower} · your own`,
        category: action.category || "Soul",
        custom: true,
      })),
      COMPASSION_ACTION,
    ],
    [custom],
  );

  // Built-in categories first, then any categories Karmel has invented.
  const categoryList = useMemo(() => {
    const builtIn = BOUQUET_CATEGORIES.map((category) => ({ key: category.key as string, blurb: category.blurb }));
    const known = new Set(builtIn.map((category) => category.key));
    const extras = Array.from(new Set(custom.map((action) => action.category || "Soul")))
      .filter((key) => !known.has(key))
      .sort()
      .map((key) => ({ key, blurb: "your own category" }));
    return [...builtIn, ...extras];
  }, [custom]);
  const actionByKey = useMemo(() => new Map(allActions.map((action) => [action.key, action])), [allActions]);

  const todays = history[today] ?? [];

  const toggle = (key: string) => {
    // Functional update so rapid toggles never work from stale state.
    setHistory((current) => {
      const day = current[today] ?? [];
      const next = day.includes(key) ? day.filter((entry) => entry !== key) : [...day, key];
      const nextHistory = { ...current };
      if (next.length) nextHistory[today] = next;
      else delete nextHistory[today];
      fetch("/api/bouquet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: today, actions: next }),
      })
        .then(announceChange)
        .catch(() => {});
      return nextHistory;
    });
  };

  const addCustom = async (event: React.FormEvent) => {
    event.preventDefault();
    const label = addForm.label.trim();
    if (!label) return;
    const category = addForm.category === "__new__" ? addForm.newCategory.trim() || "Soul" : addForm.category;
    const choice = FLOWER_CHOICES[addForm.flowerIndex];
    const response = await fetch("/api/bouquet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, emoji: choice.emoji, flower: choice.flower, category }),
    }).catch(() => null);
    const data = await response?.json();
    if (data?.custom) {
      setCustom(data.custom);
      setAddForm({ label: "", flowerIndex: 0, category, newCategory: "" });
      setShowAdd(false);
    }
  };

  const removeCustom = async (key: string) => {
    setCustom((current) => current.filter((action) => action.key !== key));
    await fetch(`/api/bouquet?key=${encodeURIComponent(key)}`, { method: "DELETE" }).catch(() => {});
  };

  const collection = useMemo(() => {
    const counts = new Map<string, number>();
    for (const day of Object.values(history)) {
      for (const key of day) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [history]);

  const lifetimeFlowers = Array.from(collection.values()).reduce((sum, count) => sum + count, 0);
  const daysBloomed = Object.keys(history).length;
  const nextTier = REDEEM_TIERS.find((tier) => lifetimeFlowers < tier.flowers);
  const dateLabel = new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  const renderAction = (action: BouquetAction) => {
    const done = todays.includes(action.key);
    return (
      <label key={action.key} className={`bouquet-action ${done ? "done" : ""}`}>
        <input type="checkbox" checked={done} onChange={() => toggle(action.key)} />
        <span className="bouquet-action-emoji">{action.emoji}</span>
        <span className="bouquet-action-body">
          <strong>{action.label}</strong>
          <em>{action.flower} · {action.meaning}</em>
        </span>
        {action.custom && (
          <button
            type="button"
            className="bouquet-remove"
            onClick={(event) => { event.preventDefault(); removeCustom(action.key); }}
            title="Remove this activity (flowers already earned are kept)"
          >
            <X size={13} />
          </button>
        )}
      </label>
    );
  };

  return (
    <div className="section-stack">
      <div className="section-intro">
        <h2>Today&apos;s Bouquet</h2>
        <p>
          Celebrate what you <em>did</em> do. Every choice adds beauty — check a nurturing action and its flower joins
          today&apos;s bouquet. You don&apos;t lose flowers here. You only grow more.
        </p>
      </div>

      {/* The day's bouquet: AI-painted watercolor when painted, live sketch until then */}
      <div className="bouquet-vase-card">
        <p className="bouquet-date">{dateLabel}</p>
        {art[today] ? (
          <div className="bouquet-painting">
            <img src={art[today]} alt={`Today's bouquet — ${todays.length} flowers, painted in watercolor`} />
            <div className="bqd-count painted">
              <strong>{todays.length}</strong>
              <span>Flowers<br />Earned</span>
            </div>
            <p className="bqd-tagline">{bouquetTag(todays.length)}</p>
          </div>
        ) : (
          <BouquetStage
            flowers={todays.map((key) => {
              const action = actionByKey.get(key);
              return { emoji: action?.emoji ?? "🌸", title: action ? `${action.flower} — ${action.label}` : undefined };
            })}
            count={todays.length}
            tagline={bouquetTag(todays.length)}
          />
        )}
        <div className="bouquet-paint-row">
          <button className="primary-button" onClick={paint} disabled={painting || !todays.length}>
            🎨 {painting ? "Painting…" : art[today] ? "Repaint with today's flowers" : "Paint today's bouquet"}
          </button>
          {!art[today] && !painting && todays.length > 0 && (
            <span className="bouquet-paint-hint">Turns your {todays.length} flowers into a real watercolor.</span>
          )}
          {paintNote && <span className="bouquet-paint-hint">{paintNote}</span>}
        </div>
      </div>

      {/* Today's checkboxes, by category */}
      <div className="bouquet-actions-card">
        <div className="bouquet-actions-head">
          <h3>Today you…</h3>
          <button className="secondary-button" onClick={() => setShowAdd((value) => !value)}>
            <Plus size={14} /> Add your own
          </button>
        </div>

        {showAdd && (
          <form className="bouquet-add" onSubmit={addCustom}>
            <label className="bouquet-add-label">
              What will you do?
              <input
                value={addForm.label}
                onChange={(event) => setAddForm((form) => ({ ...form, label: event.target.value }))}
                placeholder="e.g. Practiced piano, called Mom, 10 minutes of stretching"
                autoFocus
              />
            </label>
            <label>
              Category
              <select value={addForm.category} onChange={(event) => setAddForm((form) => ({ ...form, category: event.target.value }))}>
                {categoryList.map((category) => <option key={category.key} value={category.key}>{category.key}</option>)}
                <option value="__new__">＋ New category…</option>
              </select>
            </label>
            {addForm.category === "__new__" && (
              <label>
                Name the new category
                <input
                  value={addForm.newCategory}
                  onChange={(event) => setAddForm((form) => ({ ...form, newCategory: event.target.value }))}
                  placeholder="e.g. Relationships, Creativity, Learning"
                  autoFocus
                />
              </label>
            )}
            <div className="bouquet-flower-picker">
              <span>Its flower</span>
              <div>
                {FLOWER_CHOICES.map((choice, index) => (
                  <button
                    type="button"
                    key={`${choice.flower}-${index}`}
                    className={addForm.flowerIndex === index ? "active" : ""}
                    title={choice.flower}
                    onClick={() => setAddForm((form) => ({ ...form, flowerIndex: index }))}
                  >
                    {choice.emoji}
                  </button>
                ))}
              </div>
            </div>
            <button className="primary-button" type="submit">Add to my list</button>
          </form>
        )}

        {categoryList.map((category) => {
          const actions = allActions.filter((action) => action.category === category.key && action.key !== COMPASSION_ACTION.key);
          if (!actions.length) return null;
          return (
            <div key={category.key} className="bouquet-category">
              <h4>{category.key} <em>· {category.blurb}</em></h4>
              <div className="bouquet-actions">{actions.map(renderAction)}</div>
            </div>
          );
        })}

        <label className={`bouquet-action compassion ${todays.includes(COMPASSION_ACTION.key) ? "done" : ""}`}>
          <input type="checkbox" checked={todays.includes(COMPASSION_ACTION.key)} onChange={() => toggle(COMPASSION_ACTION.key)} />
          <span className="bouquet-action-emoji">{COMPASSION_ACTION.emoji}</span>
          <span className="bouquet-action-body">
            <strong>Compassion bonus — {COMPASSION_ACTION.label.toLowerCase()}</strong>
            <em>{COMPASSION_ACTION.flower} · {COMPASSION_ACTION.meaning}</em>
          </span>
          <Heart size={15} className="bouquet-heart" />
        </label>
      </div>

      {/* Collection + rewards */}
      <div className="compost-columns">
        <div className="bouquet-collection">
          <h3>Your flower collection</h3>
          <p className="bouquet-sub">{lifetimeFlowers.toLocaleString()} flowers across {daysBloomed} day{daysBloomed === 1 ? "" : "s"} — saved forever. No days are lost; every day adds beauty.</p>
          <div className="bouquet-collection-grid">
            {allActions.map((action) => (
              <div key={action.key} className="bouquet-collect">
                <span>{action.emoji}</span>
                <strong>{(collection.get(action.key) ?? 0).toLocaleString()}</strong>
                <em>{action.flower}</em>
              </div>
            ))}
          </div>
        </div>

        <div className="bouquet-rewards">
          <h3>Redeem your flowers</h3>
          <p className="bouquet-sub">You choose the rewards that bring you joy.</p>
          {REDEEM_TIERS.map((tier) => {
            const reached = lifetimeFlowers >= tier.flowers;
            const progress = Math.min(1, lifetimeFlowers / tier.flowers);
            return (
              <div key={tier.flowers} className={`bouquet-tier ${reached ? "reached" : ""}`}>
                <span className="bouquet-tier-emoji">{tier.emoji}</span>
                <span className="bouquet-tier-body">
                  <strong>{tier.reward}</strong>
                  <em>{tier.flowers.toLocaleString()} flowers{reached ? " — earned! Treat yourself." : ""}</em>
                  <i className="bouquet-tier-bar"><b style={{ width: `${Math.round(progress * 100)}%` }} /></i>
                </span>
              </div>
            );
          })}
          {nextTier && (
            <p className="bouquet-next">{(nextTier.flowers - lifetimeFlowers).toLocaleString()} flowers to {nextTier.reward.toLowerCase()}.</p>
          )}
        </div>
      </div>

      {/* The Conservatory — every day's bouquet, preserved */}
      {(() => {
        const pastDays = Object.keys(history)
          .filter((day) => day !== today)
          .sort()
          .reverse()
          .slice(0, 14);
        if (!pastDays.length) return null;
        return (
          <div className="conservatory-card">
            <h3>The Conservatory</h3>
            <p className="bouquet-sub">Every day&apos;s bouquet is preserved here — no days are lost. Beautiful things grow slowly.</p>
            <div className="conservatory-grid">
              {pastDays.map((day) => {
                const dayFlowers = (history[day] ?? []).map((key) => ({ emoji: actionByKey.get(key)?.emoji ?? "🌸" }));
                const label = new Date(`${day}T12:00:00`).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
                return (
                  <div key={day} className="conservatory-day">
                    {art[day] ? (
                      <img className="conservatory-painting" src={art[day]} alt={`Bouquet from ${label}`} loading="lazy" />
                    ) : (
                      <BouquetStage flowers={dayFlowers} scale={0.42} showMeta={false} />
                    )}
                    <strong>{label}</strong>
                    <em>{dayFlowers.length} flower{dayFlowers.length === 1 ? "" : "s"}</em>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      <div className="bouquet-philosophy">
        <p><strong>No imperfect streaks.</strong> Life is not perfect and neither are days. There are no broken streaks here — only seasons. Rest, reset, and begin again. Your garden is always growing.</p>
        <p><strong>Celebrate the good.</strong> This is not about what you didn&apos;t do. Every flower matters. Every day matters. You matter — and you are growing beautifully.</p>
      </div>

      {!loaded && <p className="community-hint">Loading your garden…</p>}
    </div>
  );
}
