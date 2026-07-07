"use client";

/**
 * Today's Bouquet — celebrate what you DID do. Check a nurturing action,
 * earn its flower, watch the day's bouquet fill the vase. Flowers are never
 * lost: no streaks, only growth. Built from Karmel's Daily Bouquet mockups.
 */

import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { ACTION_BY_KEY, ALL_ACTIONS, BOUQUET_ACTIONS, COMPASSION_ACTION, REDEEM_TIERS, bouquetTag, todayKey } from "@/lib/bouquet";
import type { BouquetHistory } from "@/lib/store";

export function TodaysBouquet() {
  const [history, setHistory] = useState<BouquetHistory>({});
  const [loaded, setLoaded] = useState(false);
  const today = todayKey();

  useEffect(() => {
    fetch("/api/bouquet")
      .then((r) => r.json())
      .then((data) => setHistory(data.history && typeof data.history === "object" ? data.history : {}))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

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
      }).catch(() => {});
      return nextHistory;
    });
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

  return (
    <div className="section-stack">
      <div className="section-intro">
        <h2>Today&apos;s Bouquet</h2>
        <p>
          Celebrate what you <em>did</em> do. Every choice adds beauty — check a nurturing action and its flower joins
          today&apos;s bouquet. You don&apos;t lose flowers here. You only grow more.
        </p>
      </div>

      {/* The vase */}
      <div className="bouquet-vase-card">
        <p className="bouquet-date">{dateLabel}</p>
        <div className={`bouquet-vase ${todays.length ? "" : "empty"}`}>
          <div className="bouquet-flowers">
            {todays.length ? (
              todays.map((key, index) => {
                const action = ACTION_BY_KEY.get(key);
                if (!action) return null;
                return (
                  <span key={key} className="bouquet-flower" style={{ transform: `rotate(${(index - (todays.length - 1) / 2) * 14}deg) translateY(${Math.abs(index - (todays.length - 1) / 2) * 6}px)` }} title={`${action.flower} — ${action.label}`}>
                    {action.emoji}
                  </span>
                );
              })
            ) : (
              <span className="bouquet-stem">🌿</span>
            )}
          </div>
          <div className="bouquet-jar">
            <span className="bouquet-tagline">{bouquetTag(todays.length)}</span>
          </div>
        </div>
        <p className="bouquet-earned">
          <strong>{todays.length}</strong> flower{todays.length === 1 ? "" : "s"} earned today
        </p>
      </div>

      {/* Today's checkboxes */}
      <div className="bouquet-actions-card">
        <h3>Today you…</h3>
        <div className="bouquet-actions">
          {BOUQUET_ACTIONS.map((action) => {
            const done = todays.includes(action.key);
            return (
              <label key={action.key} className={`bouquet-action ${done ? "done" : ""}`}>
                <input type="checkbox" checked={done} onChange={() => toggle(action.key)} />
                <span className="bouquet-action-emoji">{action.emoji}</span>
                <span className="bouquet-action-body">
                  <strong>{action.label}</strong>
                  <em>{action.flower} · {action.meaning}</em>
                </span>
              </label>
            );
          })}
        </div>
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
            {ALL_ACTIONS.map((action) => (
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
