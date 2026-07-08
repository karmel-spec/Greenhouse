"use client";

/**
 * Propagation Station — ten numbered spots for the starts actually rooting
 * right now (cuttings in water, plugs under a dome, divisions settling in).
 * Tap an empty spot to start something; tap a start's badge as it moves
 * rooting → rooted → potted. Lives at the top of the Propagation Lab.
 */

import { useEffect, useState } from "react";
import { Plus, Sprout, X } from "lucide-react";
import { propagationGuide } from "@/lib/propagation";
import type { StoredPropStart } from "@/lib/store";

const STATUS_FLOW: Record<StoredPropStart["status"], StoredPropStart["status"]> = {
  rooting: "rooted",
  rooted: "potted",
  potted: "rooting",
  failed: "rooting",
};

const STATUS_LABELS: Record<StoredPropStart["status"], string> = {
  rooting: "Rooting",
  rooted: "Rooted!",
  potted: "Potted",
  failed: "Didn't take",
};

const EMPTY_SPOTS: (StoredPropStart | null)[] = Array.from({ length: 10 }, () => null);

export function PropagationStation() {
  const [spots, setSpots] = useState<(StoredPropStart | null)[]>(EMPTY_SPOTS);
  const [formSpot, setFormSpot] = useState<number | null>(null);
  const [plant, setPlant] = useState("");
  const [method, setMethod] = useState("");

  useEffect(() => {
    fetch("/api/propstarts")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.spots)) setSpots(data.spots);
      })
      .catch(() => {});
  }, []);

  const suggestedMethod = plant.trim() ? propagationGuide(plant).method : "";

  const openForm = (index: number) => {
    setFormSpot(index);
    setPlant("");
    setMethod("");
  };

  const startSpot = async (event: React.FormEvent) => {
    event.preventDefault();
    if (formSpot === null || !plant.trim()) return;
    const response = await fetch("/api/propstarts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spot: formSpot, plant: plant.trim(), method: method.trim() || suggestedMethod }),
    }).catch(() => null);
    const data = await response?.json();
    if (Array.isArray(data?.spots)) {
      setSpots(data.spots);
      setFormSpot(null);
    }
  };

  const cycleStatus = (index: number) => {
    setSpots((current) =>
      current.map((spot, spotIndex) => {
        if (spotIndex !== index || !spot) return spot;
        const status = STATUS_FLOW[spot.status];
        fetch("/api/propstarts", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ spot: index, status }),
        }).catch(() => {});
        return { ...spot, status };
      }),
    );
  };

  const markFailed = (index: number) => {
    setSpots((current) =>
      current.map((spot, spotIndex) => {
        if (spotIndex !== index || !spot) return spot;
        fetch("/api/propstarts", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ spot: index, status: "failed" }),
        }).catch(() => {});
        return { ...spot, status: "failed" as const };
      }),
    );
  };

  const clearSpot = (index: number) => {
    setSpots((current) => current.map((spot, spotIndex) => (spotIndex === index ? null : spot)));
    fetch(`/api/propstarts?spot=${index}`, { method: "DELETE" }).catch(() => {});
  };

  const occupied = spots.filter(Boolean).length;

  return (
    <div className="prop-station">
      <div className="prop-station-head">
        <h3>
          <Sprout size={16} /> Propagation Station
        </h3>
        <span>{occupied}/10 spots working</span>
      </div>
      <div className="prop-station-grid">
        {spots.map((spot, index) =>
          spot ? (
            <article key={index} className={`prop-spot ${spot.status}`}>
              <header>
                <span className="prop-spot-number">{index + 1}</span>
                <button className="plant-remove" onClick={() => clearSpot(index)} aria-label={`Clear spot ${index + 1}`}>
                  <X size={12} />
                </button>
              </header>
              <strong>{spot.plant}</strong>
              <em>{spot.method}</em>
              <span className="prop-spot-day">
                Day {Math.max(1, Math.ceil((Date.now() - Date.parse(spot.startedAt)) / 86_400_000))}
              </span>
              <button
                className={`prop-spot-status ${spot.status}`}
                onClick={() => cycleStatus(index)}
                title="Tap as it progresses: rooting → rooted → potted"
              >
                {STATUS_LABELS[spot.status]}
              </button>
              {spot.status === "rooting" && (
                <button className="prop-spot-fail" onClick={() => markFailed(index)}>
                  didn&apos;t take
                </button>
              )}
            </article>
          ) : (
            <button key={index} className="prop-spot empty" onClick={() => openForm(index)}>
              <span className="prop-spot-number">{index + 1}</span>
              <Plus size={18} />
              <span>Start</span>
            </button>
          ),
        )}
      </div>

      {formSpot !== null && (
        <form className="prop-station-form" onSubmit={startSpot}>
          <strong>Spot {formSpot + 1}:</strong>
          <input
            className="pest-search"
            placeholder="What are you starting? (basil, lavender…)"
            value={plant}
            onChange={(event) => setPlant(event.target.value)}
            autoFocus
          />
          <input
            className="pest-search"
            placeholder={suggestedMethod || "Method (cutting, division…)"}
            value={method}
            onChange={(event) => setMethod(event.target.value)}
          />
          <button className="primary-button" type="submit" disabled={!plant.trim()}>
            Start it
          </button>
          <button className="secondary-button" type="button" onClick={() => setFormSpot(null)}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
