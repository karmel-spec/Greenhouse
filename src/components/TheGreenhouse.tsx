"use client";

/**
 * The Greenhouse — a home page for the building itself: the cedar greenhouse's
 * specs, a photo gallery, and Karmel's notes. The station layout map
 * (microgreens, propagation, seed testing, hydroponics, houseplants…) will
 * grow out of this section.
 */

import { useEffect, useRef, useState } from "react";
import { Camera, Warehouse, X } from "lucide-react";
import { fileToResizedDataUrl } from "@/lib/image-client";
import type { StoredGreenhouse } from "@/lib/store";

const SPECS: { label: string; value: string }[] = [
  { label: "Structure", value: "Cedar frame with tongue-and-groove lower panels" },
  { label: "Glazing", value: "Twin-wall polycarbonate walls and roof" },
  { label: "Footprint", value: "7.8 × 6.7 ft (2.38 × 2.04 m) — posts 7'2¼\" × 5'9\" inside" },
  { label: "Peak height", value: "7.7 ft (2.36 m)" },
  { label: "Ventilation", value: "Opening roof vent + louvered floor-level intake vent" },
  { label: "Work surfaces", value: "L-shaped corner bench, high shelf, and window-sill ledges" },
  { label: "Door", value: "Hinged single door with black latch, window sills either side" },
];

/** Stations that will get mapped onto the layout in a future session. */
const PLANNED_STATIONS = [
  "Microgreens",
  "Propagation Station",
  "Seed Testing",
  "Quart Jar Hydroponics",
  "Seed Trays",
  "Houseplants",
  "Potting Bench",
];

export function TheGreenhouse() {
  const [greenhouse, setGreenhouse] = useState<StoredGreenhouse>({ notes: "", photos: [] });
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadNote, setUploadNote] = useState("");
  const [notesDraft, setNotesDraft] = useState<string | null>(null);
  const [captionDrafts, setCaptionDrafts] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    fetch("/api/greenhouse")
      .then((r) => r.json())
      .then((data) => {
        if (data.greenhouse) setGreenhouse(data.greenhouse);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const uploadPhotos = async (files: FileList | null) => {
    if (!files?.length || uploading) return;
    setUploading(true);
    const list = Array.from(files);
    for (let index = 0; index < list.length; index++) {
      setUploadNote(`Saving photo ${index + 1} of ${list.length}…`);
      try {
        const dataUrl = await fileToResizedDataUrl(list[index], 2000);
        const response = await fetch("/api/greenhouse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoDataUrl: dataUrl }),
        });
        const data = await response.json();
        if (response.ok && data.greenhouse) {
          setGreenhouse(data.greenhouse);
        } else {
          setUploadNote(data.error ?? "That photo couldn't be saved — try again.");
        }
      } catch {
        setUploadNote("Upload hiccup — check the connection and try again.");
      }
    }
    setUploadNote(`Added ${list.length === 1 ? "the photo" : `${list.length} photos`} to the greenhouse album.`);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const debouncedPatch = (key: string, payload: object) => {
    if (saveTimers.current[key]) clearTimeout(saveTimers.current[key]);
    saveTimers.current[key] = setTimeout(() => {
      fetch("/api/greenhouse", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }, 700);
  };

  const setNotes = (value: string) => {
    setNotesDraft(value);
    debouncedPatch("notes", { notes: value });
  };

  const setCaption = (photoId: string, value: string) => {
    setCaptionDrafts((current) => ({ ...current, [photoId]: value }));
    debouncedPatch(`caption-${photoId}`, { photoId, caption: value });
  };

  const removePhoto = async (id: string) => {
    setGreenhouse((current) => ({ ...current, photos: current.photos.filter((photo) => photo.id !== id) }));
    await fetch(`/api/greenhouse?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
  };

  return (
    <div className="section-stack">
      <div className="section-intro">
        <h2>The Greenhouse</h2>
        <p>
          The cedar heart of the garden — 7.8 by 6.7 feet of warm wood and light. This page keeps the
          building&apos;s own story: its specs, its photo album through the seasons, and your notes. Next up, we&apos;ll
          map where every station lives inside it.
        </p>
      </div>

      {/* Specs */}
      <article className="gh-card">
        <h3><Warehouse size={16} /> The build</h3>
        <dl className="gh-specs">
          {SPECS.map((spec) => (
            <div key={spec.label}>
              <dt>{spec.label}</dt>
              <dd>{spec.value}</dd>
            </div>
          ))}
        </dl>
      </article>

      {/* Future layout teaser */}
      <article className="gh-card">
        <h3>Stations to map</h3>
        <p className="gh-hint">
          The floor-plan map is coming in a future session — here&apos;s what it will place inside these walls:
        </p>
        <div className="gh-stations">
          {PLANNED_STATIONS.map((station) => (
            <span key={station} className="gh-station-chip">{station}</span>
          ))}
        </div>
      </article>

      {/* Photo album */}
      <article className="gh-card">
        <div className="gh-album-head">
          <h3><Camera size={16} /> Greenhouse album</h3>
          <button className="primary-button" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? "Saving…" : "Add photos"}
          </button>
          <input
            ref={inputRef}
            className="visually-hidden"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => uploadPhotos(event.target.files)}
          />
        </div>
        {uploadNote && <p className="gh-hint">{uploadNote}</p>}
        {loaded && !greenhouse.photos.length && (
          <p className="gh-hint">
            No photos yet — tap <strong>Add photos</strong> and start the album: the whole building, the door, the
            benches, the roof vent, and how it changes with the seasons.
          </p>
        )}
        <div className="gh-gallery">
          {greenhouse.photos.map((photo) => (
            <figure key={photo.id} className="gh-photo">
              <button className="plant-remove gh-photo-remove" onClick={() => removePhoto(photo.id)} aria-label="Remove photo">
                <X size={13} />
              </button>
              <img src={photo.photo} alt={photo.caption || "Greenhouse photo"} loading="lazy" />
              <figcaption>
                <input
                  value={captionDrafts[photo.id] ?? photo.caption}
                  onChange={(event) => setCaption(photo.id, event.target.value)}
                  placeholder="Caption — what & when…"
                />
              </figcaption>
            </figure>
          ))}
        </div>
      </article>

      {/* Notes */}
      <article className="gh-card">
        <h3>Greenhouse notes</h3>
        <textarea
          className="seedtest-notes gh-notes"
          rows={5}
          placeholder="The building's running story — assembly notes, what faces south, summer shading, winter heating, what you'd change…"
          value={notesDraft ?? greenhouse.notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </article>
    </div>
  );
}
