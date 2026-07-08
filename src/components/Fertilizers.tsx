"use client";

/**
 * Fertilizers — the plant-food shelf and a "who gets fed what" map. Two real
 * products (Osmocote prills and TakeRoot powder), four feeding cards covering
 * everything from houseplants to the apothecary bed, plus the signs of too
 * much and too little for an alkaline-water high-desert greenhouse.
 */

import { useMemo, useState } from "react";
import { Bot } from "lucide-react";
import { FEEDING_CARDS, FEEDING_TIPS, FERTILIZER_PRODUCTS } from "@/lib/fertilizers";
import type { FeedingGroup } from "@/lib/fertilizers";

function askEve(prompt: string) {
  window.dispatchEvent(new CustomEvent("eve-ask", { detail: prompt }));
}

interface GroupOption {
  value: string;
  label: string;
  group: FeedingGroup;
}

export function Fertilizers() {
  const [selectedGroup, setSelectedGroup] = useState("");

  const groupOptions = useMemo<GroupOption[]>(
    () =>
      FEEDING_CARDS.flatMap((card) =>
        card.groups.map((group) => ({
          value: `${card.key}::${group.plants}`,
          label: `${card.title} — ${group.plants}`,
          group,
        })),
      ),
    [],
  );

  const picked = groupOptions.find((option) => option.value === selectedGroup);

  return (
    <div className="section-stack">
      <div className="section-intro">
        <h2>Plant Food &amp; Fertilizers</h2>
        <p>
          What&apos;s on your shelf, who gets fed what, and how to read the leaves when you get it wrong. Orem&apos;s
          alkaline water and hot greenhouse summers reward a light hand — dilute more than the label says, and flush
          the salts out monthly.
        </p>
      </div>

      {/* The product shelf — the two things Karmel actually owns */}
      <div className="ref-grid">
        {FERTILIZER_PRODUCTS.map((product) => (
          <article key={product.key} className="gh-card">
            <h3>
              {product.emoji} {product.name}
            </h3>
            <div className="ref-kv">
              <strong>Form</strong>
              <span>{product.form}</span>
            </div>
            <div className="ref-kv">
              <strong>Active ingredient</strong>
              <span>{product.activeIngredient}</span>
            </div>
            <div>
              {product.bestFor.map((use) => (
                <span key={use} className="ref-chip">
                  {use}
                </span>
              ))}
            </div>
            <ol>
              {product.application.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="gh-hint">{product.notes}</p>
          </article>
        ))}
      </div>

      {/* Quick lookup — pick any group across the four feeding cards */}
      <div className="gh-card">
        <h3>Who gets fed what?</h3>
        <select
          className="pest-search"
          value={selectedGroup}
          onChange={(event) => setSelectedGroup(event.target.value)}
          aria-label="Pick a plant group to see its feeding plan"
        >
          <option value="">Pick a plant group…</option>
          {groupOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {picked && (
          <>
            <div className="ref-kv">
              <strong>Fertilizer</strong>
              <span>{picked.group.fertilizer}</span>
            </div>
            <div className="ref-kv">
              <strong>NPK hint</strong>
              <span>{picked.group.npkHint}</span>
            </div>
            <div className="ref-kv">
              <strong>How often</strong>
              <span>{picked.group.frequency}</span>
            </div>
            {picked.group.warning && <p className="gh-hint">{picked.group.warning}</p>}
          </>
        )}
      </div>

      {/* The four feeding cards in full */}
      {FEEDING_CARDS.map((card) => (
        <article key={card.key} className="gh-card">
          <h3>
            {card.emoji} {card.title}
          </h3>
          {card.groups.map((group) => (
            <div key={group.plants}>
              <div className="ref-kv">
                <strong>{group.plants}</strong>
                <span>
                  {group.fertilizer} · {group.frequency}
                </span>
              </div>
              {group.warning && <p className="gh-hint">{group.warning}</p>}
            </div>
          ))}
        </article>
      ))}

      {/* Reading the leaves — too much, too little, and the house rules */}
      <h3 className="apothecary-subhead">Signs &amp; rules</h3>
      <div className="ref-grid">
        <article className="gh-card">
          <h3>Too much</h3>
          <ul>
            {FEEDING_TIPS.overFeedingSigns.map((sign) => (
              <li key={sign}>{sign}</li>
            ))}
          </ul>
        </article>
        <article className="gh-card">
          <h3>Too little</h3>
          <ul>
            {FEEDING_TIPS.underFeedingSigns.map((sign) => (
              <li key={sign}>{sign}</li>
            ))}
          </ul>
        </article>
      </div>
      <article className="gh-card">
        <h3>House rules</h3>
        <ul>
          {FEEDING_TIPS.generalRules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </article>

      <div>
        <button
          className="secondary-button"
          onClick={() => askEve("What should I feed this week, given what's actively growing in the greenhouse?")}
        >
          <Bot size={14} /> Ask Eve
        </button>
      </div>
    </div>
  );
}
