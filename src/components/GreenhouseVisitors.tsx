"use client";

/**
 * Greenhouse Visitors — the guest book. Photos of everyone who comes to help,
 * learn, or just stand in the warm plant air for a while: grandkids, neighbors,
 * friends. Every visit gets a face, a name, a date, and the story.
 */

import { useEffect, useRef, useState } from "react";
import { HeartHandshake, Plus, X } from "lucide-react";
import { fileToResizedDataUrl } from "@/lib/image-client";
import type { StoredVisit } from "@/lib/store";

export function GreenhouseVisitors() {
  const [visits, setVisits] = useState<StoredVisit[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [visitedAt, setVisitedAt] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formNote, setFormNote] = useState("");
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const photoRef = useRef<HTMLInputElement>(null);
  const noteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    fetch("/api/visitors")
      .then((r) => r.json())
      .then((data) => setVisits(Array.isArray(data.visits) ? data.visits : []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const addVisit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      const response = await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          note,
          visitedAt: visitedAt ? new Date(`${visitedAt}T12:00:00`).toISOString() : undefined,
          photoDataUrl: photoDataUrl ?? undefined,
        }),
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data.visits)) {
        setVisits(data.visits);
        setShowForm(false);
        setName("");
        setNote("");
        setVisitedAt("");
        setPhotoDataUrl(null);
        setFormNote("Added to the guest book. 💛");
      } else {
        setFormNote(data.error ?? "Couldn't save that visit — try again.");
      }
    } catch {
      setFormNote("Couldn't save that visit — check the connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const saveNote = (id: string, value: string) => {
    setNoteDrafts((current) => ({ ...current, [id]: value }));
    if (noteTimers.current[id]) clearTimeout(noteTimers.current[id]);
    noteTimers.current[id] = setTimeout(() => {
      fetch("/api/visitors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, note: value }),
      }).catch(() => {});
    }, 700);
  };

  const removeVisit = async (id: string) => {
    setVisits((current) => current.filter((visit) => visit.id !== id));
    await fetch(`/api/visitors?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
  };

  return (
    <div className="section-stack">
      <div className="section-intro">
        <h2>Greenhouse Visitors</h2>
        <p>
          The guest book. Every pair of helping hands and every friend who comes to stand in the warm green air gets a
          page here — who came, when, and what you did together among the plants.
        </p>
      </div>

      <div className="toolbar">
        <button className="primary-button" onClick={() => setShowForm((value) => !value)}>
          <Plus size={16} /> Add a guest
        </button>
      </div>
      {formNote && <p className="gh-hint">{formNote}</p>}

      {showForm && (
        <form className="visitor-form gh-card" onSubmit={addVisit}>
          <input
            className="pest-search"
            placeholder="Who came? — e.g. The grandkids, Sister Jensen next door"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
          <textarea
            className="seedtest-notes"
            rows={2}
            placeholder="The story — helped harvest the microgreens, first time seeing the watermelons…"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <div className="visitor-form-row">
            <input
              className="pest-search"
              type="date"
              value={visitedAt}
              onChange={(event) => setVisitedAt(event.target.value)}
              aria-label="Visit date (defaults to today)"
            />
            <button className="secondary-button" type="button" onClick={() => photoRef.current?.click()}>
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
            <button className="primary-button" type="submit" disabled={saving || !name.trim()}>
              {saving ? "Saving…" : "Add to guest book"}
            </button>
          </div>
        </form>
      )}

      {loaded && !visits.length && !showForm && (
        <div className="empty-library">
          <HeartHandshake size={30} />
          <h3>The guest book is open</h3>
          <p>
            Tap <strong>Add a guest</strong> after the next helper or friend stops by — a photo, their name, and what
            you grew together that day.
          </p>
        </div>
      )}

      <div className="visitor-gallery">
        {visits.map((visit) => (
          <article key={visit.id} className="visitor-card">
            <button className="plant-remove visitor-remove" onClick={() => removeVisit(visit.id)} aria-label={`Remove ${visit.name}'s visit`}>
              <X size={13} />
            </button>
            {visit.photo ? (
              <img src={visit.photo} alt={visit.name} loading="lazy" />
            ) : (
              <div className="visitor-placeholder" aria-hidden>💛</div>
            )}
            <div className="visitor-body">
              <strong>{visit.name}</strong>
              <span className="visitor-date">
                {new Date(visit.visitedAt).toLocaleDateString([], { dateStyle: "long" })}
              </span>
              <textarea
                className="visitor-note"
                rows={2}
                placeholder="What made this visit special…"
                value={noteDrafts[visit.id] ?? visit.note ?? ""}
                onChange={(event) => saveNote(visit.id, event.target.value)}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
