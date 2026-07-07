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
  type BouquetCategory,
} from "@/lib/bouquet";
import type { BouquetHistory, StoredBouquetAction } from "@/lib/store";

/** Lets the sidebar mini-bouquet refresh the moment a box is checked. */
function announceChange() {
  window.dispatchEvent(new CustomEvent("bouquet-changed"));
}

/**
 * Composed-bouquet layout (modeled on Karmel's watercolor mockups): the first
 * flower takes the center, then blooms fill the flanks and crown so the
 * arrangement reads as a dome at any count. x = px from center, y = px up
 * from the jar mouth, s = font size, r = stem tilt, z = layer.
 */
const BLOOM_SLOTS: { x: number; y: number; s: number; r: number; z: number }[] = [
  { x: 0, y: 62, s: 56, r: 0, z: 10 },
  { x: -38, y: 52, s: 50, r: -12, z: 9 },
  { x: 38, y: 52, s: 50, r: 12, z: 9 },
  { x: -20, y: 92, s: 46, r: -6, z: 8 },
  { x: 20, y: 92, s: 46, r: 6, z: 8 },
  { x: -60, y: 28, s: 44, r: -20, z: 7 },
  { x: 60, y: 28, s: 44, r: 20, z: 7 },
  { x: 0, y: 122, s: 44, r: 0, z: 7 },
  { x: -46, y: 86, s: 40, r: -16, z: 6 },
  { x: 46, y: 86, s: 40, r: 16, z: 6 },
  { x: -76, y: 56, s: 38, r: -28, z: 5 },
  { x: 76, y: 56, s: 38, r: 28, z: 5 },
  { x: -24, y: 142, s: 36, r: -8, z: 5 },
  { x: 24, y: 142, s: 36, r: 8, z: 5 },
  { x: 0, y: 24, s: 42, r: 0, z: 11 },
  { x: -6, y: 166, s: 32, r: -3, z: 4 },
];

const GREENERY_SLOTS: { x: number; y: number; s: number; r: number; leaf: string }[] = [
  { x: 0, y: 100, s: 34, r: 0, leaf: "🌿" },
  { x: -52, y: 74, s: 34, r: -30, leaf: "🌿" },
  { x: 52, y: 74, s: 34, r: 30, leaf: "🌿" },
  { x: -28, y: 120, s: 32, r: -15, leaf: "🍃" },
  { x: 28, y: 120, s: 32, r: 15, leaf: "🍃" },
  { x: -84, y: 42, s: 30, r: -45, leaf: "🍃" },
  { x: 84, y: 42, s: 30, r: 45, leaf: "🍃" },
  { x: 0, y: 152, s: 30, r: 0, leaf: "🌿" },
  { x: -62, y: 106, s: 28, r: -35, leaf: "🌿" },
  { x: 62, y: 106, s: 28, r: 35, leaf: "🌿" },
  { x: -98, y: 66, s: 26, r: -55, leaf: "🌱" },
  { x: 98, y: 66, s: 26, r: 55, leaf: "🌱" },
];

export function TodaysBouquet() {
  const [history, setHistory] = useState<BouquetHistory>({});
  const [custom, setCustom] = useState<StoredBouquetAction[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ label: "", flowerIndex: 0, category: "Soul" as BouquetCategory });
  const today = todayKey();

  useEffect(() => {
    fetch("/api/bouquet")
      .then((r) => r.json())
      .then((data) => {
        setHistory(data.history && typeof data.history === "object" ? data.history : {});
        setCustom(Array.isArray(data.custom) ? data.custom : []);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const allActions: BouquetAction[] = useMemo(
    () => [
      ...BOUQUET_ACTIONS,
      ...custom.map((action) => ({
        key: action.key,
        label: action.label,
        flower: action.flower,
        emoji: action.emoji,
        meaning: `${action.flower} · your own`,
        category: (["Body", "Soul", "Connection", "Garden"].includes(action.category) ? action.category : "Soul") as BouquetCategory,
        custom: true,
      })),
      COMPASSION_ACTION,
    ],
    [custom],
  );
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
    const choice = FLOWER_CHOICES[addForm.flowerIndex];
    const response = await fetch("/api/bouquet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, emoji: choice.emoji, flower: choice.flower, category: addForm.category }),
    }).catch(() => null);
    const data = await response?.json();
    if (data?.custom) {
      setCustom(data.custom);
      setAddForm({ label: "", flowerIndex: 0, category: addForm.category });
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

      {/* The vase — a composed arrangement that fills like a real bouquet */}
      <div className="bouquet-vase-card">
        <p className="bouquet-date">{dateLabel}</p>
        <div className={`bouquet-vase ${todays.length ? "" : "empty"}`}>
          <div className="bouquet-arrangement">
            {/* greenery fills in behind the blooms as the bouquet grows */}
            {GREENERY_SLOTS.slice(0, todays.length ? Math.min(3 + todays.length, GREENERY_SLOTS.length) : 1).map((slot, index) => (
              <span
                key={`green-${index}`}
                className="bouquet-greenery"
                style={{
                  left: `calc(50% + ${slot.x}px)`,
                  bottom: slot.y,
                  fontSize: slot.s,
                  transform: `translateX(-50%) rotate(${slot.r}deg)`,
                }}
              >
                {slot.leaf}
              </span>
            ))}
            {todays.map((key, index) => {
              const action = actionByKey.get(key);
              const slot = BLOOM_SLOTS[index % BLOOM_SLOTS.length];
              if (!action) return null;
              return (
                <span
                  key={key}
                  className="bouquet-bloom"
                  style={{
                    left: `calc(50% + ${slot.x}px)`,
                    bottom: slot.y,
                    fontSize: slot.s,
                    zIndex: slot.z,
                    transform: `translateX(-50%) rotate(${slot.r}deg)`,
                  }}
                  title={`${action.flower} — ${action.label}`}
                >
                  {action.emoji}
                </span>
              );
            })}
          </div>
          <div className="bouquet-jar">
            <span className="bouquet-ribbon">🎀</span>
            <span className="bouquet-tagline">{bouquetTag(todays.length)}</span>
          </div>
        </div>
        <p className="bouquet-earned">
          <strong>{todays.length}</strong> flower{todays.length === 1 ? "" : "s"} earned today
        </p>
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
              <select value={addForm.category} onChange={(event) => setAddForm((form) => ({ ...form, category: event.target.value as BouquetCategory }))}>
                {BOUQUET_CATEGORIES.map((category) => <option key={category.key} value={category.key}>{category.key}</option>)}
              </select>
            </label>
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

        {BOUQUET_CATEGORIES.map((category) => {
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

      <div className="bouquet-philosophy">
        <p><strong>No imperfect streaks.</strong> Life is not perfect and neither are days. There are no broken streaks here — only seasons. Rest, reset, and begin again. Your garden is always growing.</p>
        <p><strong>Celebrate the good.</strong> This is not about what you didn&apos;t do. Every flower matters. Every day matters. You matter — and you are growing beautifully.</p>
      </div>

      {!loaded && <p className="community-hint">Loading your garden…</p>}
    </div>
  );
}
