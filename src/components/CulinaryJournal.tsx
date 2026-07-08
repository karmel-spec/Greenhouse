"use client";

/**
 * Culinary Garden Journal — the farm-to-table record. Every meal the garden
 * feeds gets an entry: what was cooked, which plants contributed, what it
 * really cost versus the store, and how fast it went from soil to plate.
 */

import { useEffect, useRef, useState } from "react";
import { Bot, ChefHat, Plus, X } from "lucide-react";
import { fileToResizedDataUrl } from "@/lib/image-client";
import type { StoredCulinaryEntry } from "@/lib/store";

function askEve(prompt: string) {
  window.dispatchEvent(new CustomEvent("eve-ask", { detail: prompt }));
}

/** Eve's first documented meal — one tap files it. */
const ENTRY_ONE = {
  dish: "Brassica Mix Microgreens & Cherry Tomato Salad",
  ingredients: [
    "Brassica mix microgreens — harvested yesterday from the studio",
    "Cherry tomatoes — small, ripe, picked yesterday",
    "Fresh mozzarella / burrata",
    "Olive oil, salt, pepper",
  ],
  flavorProfile:
    "Peppery kick from the brassicas (radish, mustard), sweet juicy tomatoes, creamy richness from the cheese, and that just-cut brightness only microgreens have.",
  mealCost: "$3–6",
  storeCost: "$12–18",
  savings: "$9–12 per meal (60–75%)",
  timeline:
    "Microgreens: planted 10–12 days ago, harvested yesterday. Tomatoes: picked yesterday. Prepared today — under 24 hours from harvest to plate.",
  insight:
    "Everything grew within 50 feet. Seed → harvest → plate turns eating into celebration. This is food sovereignty.",
};

const EMPTY_FORM = {
  dish: "",
  ingredients: "",
  flavorProfile: "",
  mealCost: "",
  storeCost: "",
  savings: "",
  timeline: "",
  insight: "",
};

export function CulinaryJournal() {
  const [entries, setEntries] = useState<StoredCulinaryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/culinary")
      .then((r) => r.json())
      .then((data) => setEntries(Array.isArray(data.entries) ? data.entries : []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const saveEntry = async (payload: object) => {
    setSaving(true);
    try {
      const response = await fetch("/api/culinary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data.entries)) {
        setEntries(data.entries);
        setShowForm(false);
        setForm(EMPTY_FORM);
        setPhotoDataUrl(null);
        setNote("Filed — the garden fed you again. 🌿");
      } else {
        setNote(data.error ?? "Couldn't save that meal — try again.");
      }
    } catch {
      setNote("Couldn't save that meal — check the connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const submitForm = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.dish.trim()) return;
    saveEntry({
      ...form,
      ingredients: form.ingredients.split("\n").map((line) => line.trim()).filter(Boolean),
      photoDataUrl: photoDataUrl ?? undefined,
    });
  };

  const removeEntry = async (id: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
    await fetch(`/api/culinary?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
  };

  const hasEntryOne = entries.some((entry) => entry.dish === ENTRY_ONE.dish);

  return (
    <div className="section-stack">
      <div className="section-intro">
        <h2>Culinary Garden Journal</h2>
        <p>
          The whole point of the greenhouse, on a plate. Record every garden-fed meal — what you made, which plants
          starred, what it really cost versus the store, and how fast it traveled from soil to supper.
        </p>
      </div>

      <div className="toolbar">
        <button className="primary-button" onClick={() => setShowForm((value) => !value)}>
          <Plus size={16} /> Record a meal
        </button>
        {loaded && !hasEntryOne && (
          <button className="secondary-button" disabled={saving} onClick={() => saveEntry({ ...ENTRY_ONE, cookedAt: new Date().toISOString() })}>
            <ChefHat size={15} /> File Eve&apos;s Entry #1 — microgreens salad
          </button>
        )}
      </div>
      {note && <p className="gh-hint">{note}</p>}

      {showForm && (
        <form className="culinary-form gh-card" onSubmit={submitForm}>
          <input
            className="pest-search"
            placeholder="The dish — e.g. Brassica microgreens & tomato salad"
            value={form.dish}
            onChange={(event) => setForm({ ...form, dish: event.target.value })}
            autoFocus
          />
          <textarea
            className="seedtest-notes"
            rows={4}
            placeholder={"Ingredients — one per line, garden stars first:\nBrassica microgreens (harvested today)\nCherry tomatoes (picked this morning)\nBurrata from the store"}
            value={form.ingredients}
            onChange={(event) => setForm({ ...form, ingredients: event.target.value })}
          />
          <textarea
            className="seedtest-notes"
            rows={2}
            placeholder="Flavor profile — what made it sing?"
            value={form.flavorProfile}
            onChange={(event) => setForm({ ...form, flavorProfile: event.target.value })}
          />
          <div className="culinary-costs">
            <input className="pest-search" placeholder="Meal cost ($3–6)" value={form.mealCost} onChange={(event) => setForm({ ...form, mealCost: event.target.value })} />
            <input className="pest-search" placeholder="Store equivalent ($12–18)" value={form.storeCost} onChange={(event) => setForm({ ...form, storeCost: event.target.value })} />
            <input className="pest-search" placeholder="Savings ($9–12, 60–75%)" value={form.savings} onChange={(event) => setForm({ ...form, savings: event.target.value })} />
          </div>
          <textarea
            className="seedtest-notes"
            rows={2}
            placeholder="Farm-to-plate timeline — planted when, harvested when, eaten when?"
            value={form.timeline}
            onChange={(event) => setForm({ ...form, timeline: event.target.value })}
          />
          <textarea
            className="seedtest-notes"
            rows={2}
            placeholder="The insight — why this meal mattered"
            value={form.insight}
            onChange={(event) => setForm({ ...form, insight: event.target.value })}
          />
          <div className="culinary-form-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => photoRef.current?.click()}
            >
              {photoDataUrl ? "Photo attached ✓" : "Attach a photo"}
            </button>
            <input
              ref={photoRef}
              className="visually-hidden"
              type="file"
              accept="image/*"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (file) setPhotoDataUrl(await fileToResizedDataUrl(file));
              }}
            />
            <button className="primary-button" type="submit" disabled={saving || !form.dish.trim()}>
              {saving ? "Filing…" : "File the meal"}
            </button>
          </div>
        </form>
      )}

      {loaded && !entries.length && !showForm && (
        <div className="empty-library">
          <ChefHat size={30} />
          <h3>The kitchen chapter starts here</h3>
          <p>
            When the garden feeds you, write it down — tap <strong>Record a meal</strong>, or start with Eve&apos;s
            microgreens salad above.
          </p>
        </div>
      )}

      {entries.map((entry) => (
        <article key={entry.id} className="culinary-entry gh-card">
          <div className="seedtest-head">
            <div>
              <strong>🍽️ {entry.dish}</strong>
              <span className="seedtest-meta">{new Date(entry.cookedAt).toLocaleDateString([], { dateStyle: "long" })}</span>
            </div>
            <button className="plant-remove" onClick={() => removeEntry(entry.id)} aria-label={`Delete ${entry.dish}`}>
              <X size={14} />
            </button>
          </div>
          {entry.photo && <img className="culinary-photo" src={entry.photo} alt={entry.dish} loading="lazy" />}
          {entry.ingredients.length > 0 && (
            <ul className="culinary-ingredients">
              {entry.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          )}
          {entry.flavorProfile && <p className="culinary-flavor">{entry.flavorProfile}</p>}
          {(entry.mealCost || entry.storeCost || entry.savings) && (
            <div className="culinary-cost-row">
              {entry.mealCost && <span className="ref-chip">Cost: <strong>{entry.mealCost}</strong></span>}
              {entry.storeCost && <span className="ref-chip">Store: <strong>{entry.storeCost}</strong></span>}
              {entry.savings && <span className="ref-chip savings">Saved: <strong>{entry.savings}</strong></span>}
            </div>
          )}
          {entry.timeline && <p className="gh-hint">⏱️ {entry.timeline}</p>}
          {entry.insight && <p className="culinary-insight">🌿 {entry.insight}</p>}
          <button
            className="secondary-button"
            onClick={() => askEve(`Plan the next garden-fed meal: what's ready to harvest right now, and what could I cook with it? Last time I made ${entry.dish}.`)}
          >
            <Bot size={14} /> Plan the next one with Eve
          </button>
        </article>
      ))}
    </div>
  );
}
