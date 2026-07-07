/**
 * Seed Vault Browser
 * The full 124-packet seed vault with stats, search, and filters.
 * Used by the dedicated /seed-vault page and embedded in the main
 * app's Seed Library section.
 */

"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { fileToResizedDataUrl } from "@/lib/image-client";
import { SeedCard } from "@/components/SeedCard";
import completeSeedVaultDatabase from "@/lib/seed-vault-complete-database";
import { SeedVaultFilter } from "@/lib/seed-vault-types";
import { plantingSortKey } from "@/lib/planting";
import { toSeedPacket } from "@/lib/user-seeds";
import type { StoredSeedPacket } from "@/lib/store";
import { Search, Filter, Leaf, CalendarClock, ArrowDownAZ, Plus, X } from "lucide-react";

const EMPTY_PACKET_FORM = {
  commonName: "",
  variety: "",
  seedCount: "25",
  germinationRate: "85",
  packagedYear: String(new Date().getFullYear()),
  daysToGermination: "",
  daysToMaturity: "",
  springStart: "",
  springEnd: "",
  notes: "",
  isHeirloom: false,
  isAnnual: true,
};

export function SeedVaultBrowser({ showStats = true }: { showStats?: boolean }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<SeedVaultFilter>({});
  const [sortBy, setSortBy] = useState<"planting" | "name">("planting");
  const [userSeeds, setUserSeeds] = useState<StoredSeedPacket[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_PACKET_FORM);
  const [formNote, setFormNote] = useState("");
  const [scanning, setScanning] = useState(false);
  const scanInputRef = useRef<HTMLInputElement>(null);

  const scanPacket = async (files: FileList | null) => {
    if (!files?.length || scanning) return;
    setScanning(true);
    setShowAdd(true);
    setFormNote("Reading the packet photos…");
    try {
      const images = await Promise.all(Array.from(files).slice(0, 2).map((file) => fileToResizedDataUrl(file)));
      const response = await fetch("/api/seeds/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images }),
      });
      const data = await response.json();
      const extracted = data.extracted;
      if (!extracted?.commonName) {
        setFormNote(data.error ?? "I couldn't read a plant name off that packet — try a brighter, straighter photo, or fill the form by hand.");
        return;
      }
      setForm({
        commonName: extracted.commonName,
        variety: extracted.variety || "",
        seedCount: String(extracted.seedCount || 25),
        germinationRate: String(extracted.germinationRate || 85),
        packagedYear: String(extracted.packagedYear || new Date().getFullYear()),
        daysToGermination: extracted.daysToGermination ? String(extracted.daysToGermination) : "",
        daysToMaturity: extracted.daysToMaturity ? String(extracted.daysToMaturity) : "",
        springStart: extracted.springStart || "",
        springEnd: extracted.springEnd || "",
        notes: extracted.sowingNotes || "",
        isHeirloom: Boolean(extracted.isHeirloom),
        isAnnual: extracted.isAnnual !== false,
      });
      setFormNote(
        extracted.confidence >= 0.7
          ? `Read the packet (${Math.round(extracted.confidence * 100)}% sure) — double-check the fields, then add it.`
          : `Best guess from the photos (${Math.round((extracted.confidence || 0) * 100)}% sure) — please verify each field before adding.`,
      );
    } catch {
      setFormNote("The scan didn't go through — is the OpenAI key set and the photo clear?");
    } finally {
      setScanning(false);
      if (scanInputRef.current) scanInputRef.current.value = "";
    }
  };

  useEffect(() => {
    fetch("/api/seeds")
      .then((r) => r.json())
      .then((data) => setUserSeeds(Array.isArray(data.seeds) ? data.seeds : []))
      .catch(() => {});
  }, []);

  const allSeeds = useMemo(
    () => [...completeSeedVaultDatabase, ...userSeeds.map(toSeedPacket)],
    [userSeeds],
  );

  const addPacket = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.commonName.trim()) return;
    const response = await fetch("/api/seeds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commonName: form.commonName,
        variety: form.variety || undefined,
        seedCount: Number(form.seedCount) || 25,
        germinationRate: Number(form.germinationRate) || 85,
        packagedYear: Number(form.packagedYear) || undefined,
        daysToGermination: form.daysToGermination ? Number(form.daysToGermination) : undefined,
        daysToMaturity: form.daysToMaturity ? Number(form.daysToMaturity) : undefined,
        springStart: form.springStart || undefined,
        springEnd: form.springEnd || undefined,
        notes: form.notes || undefined,
        isHeirloom: form.isHeirloom,
        isAnnual: form.isAnnual,
      }),
    }).catch(() => null);
    const data = await response?.json();
    if (data?.seeds) {
      setUserSeeds(data.seeds);
      setForm(EMPTY_PACKET_FORM);
      setShowAdd(false);
      setFormNote(`Added "${data.packet.commonName}" to the library.`);
    } else {
      setFormNote(data?.error ?? "Couldn't save that packet — try again.");
    }
  };

  const removePacket = async (id: string) => {
    setUserSeeds((current) => current.filter((seed) => seed.id !== id));
    await fetch(`/api/seeds?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
  };

  const stats = useMemo(() => {
    const totalSeeds = allSeeds.length;
    const totalSeedCount = allSeeds.reduce((sum, s) => sum + s.seedCount, 0);
    const heirloomCount = allSeeds.filter((s) => s.isHeirloom).length;
    const avgGermination = allSeeds.reduce((sum, s) => sum + s.germinationRate, 0) / totalSeeds;

    return {
      totalSeeds,
      totalSeedCount,
      heirloomCount,
      avgGermination: avgGermination.toFixed(1),
    };
  }, [allSeeds]);

  const filteredSeeds = useMemo(() => {
    return allSeeds.filter((seed) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches =
          seed.commonName.toLowerCase().includes(term) ||
          seed.variety?.toLowerCase().includes(term) ||
          seed.botanicalName.toLowerCase().includes(term);
        if (!matches) return false;
      }

      if (filter.heirloomOnly && !seed.isHeirloom) return false;
      if (filter.annualOnly && !seed.isAnnual) return false;
      if (filter.perennialOnly && seed.isAnnual) return false;
      if (filter.readyToPlant && seed.seedCount === 0) return false;
      if (filter.lightRequirement && seed.lightRequirement !== filter.lightRequirement) {
        return false;
      }
      if (filter.waterNeeds && seed.waterNeeds !== filter.waterNeeds) return false;

      return true;
    });
  }, [allSeeds, searchTerm, filter]);

  const sortedSeeds = useMemo(() => {
    const seeds = [...filteredSeeds];
    if (sortBy === "name") {
      seeds.sort((a, b) => a.commonName.localeCompare(b.commonName) || (a.variety ?? "").localeCompare(b.variety ?? ""));
    } else {
      const today = new Date();
      const keys = new Map(seeds.map((seed) => [seed.id, plantingSortKey(seed, today)]));
      seeds.sort(
        (a, b) =>
          (keys.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (keys.get(b.id) ?? Number.MAX_SAFE_INTEGER) ||
          a.commonName.localeCompare(b.commonName),
      );
    }
    return seeds;
  }, [filteredSeeds, sortBy]);

  return (
    <div>
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <VaultStat value={String(stats.totalSeeds)} label="Varieties" tone="text-[#496331]" />
          <VaultStat value={String(stats.totalSeedCount)} label="Total Seeds" tone="text-[#496331]" />
          <VaultStat value={String(stats.heirloomCount)} label="Heirlooms" tone="text-[#c99a45]" />
          <VaultStat value={`${stats.avgGermination}%`} label="Avg Germination" tone="text-[#b56e44]" />
        </div>
      )}

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-[#a89f8d]" size={20} />
          <input
            type="text"
            placeholder="Search seeds by name or variety..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-[#fffdf6] focus:outline-none focus:ring-2 focus:ring-[#7f9565]"
          />
        </div>
      </div>

      <div className="mb-4 seed-add-buttons">
        <button className="secondary-button" onClick={() => setShowAdd((value) => !value)}>
          <Plus size={15} /> Add seed packet
        </button>
        <button className="secondary-button" onClick={() => scanInputRef.current?.click()} disabled={scanning}>
          📷 {scanning ? "Reading the packet…" : "Scan packet photos"}
        </button>
        <input
          ref={scanInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(event) => scanPacket(event.target.files)}
        />
        {formNote && <span className="seed-form-note"> {formNote}</span>}
      </div>

      {showAdd && (
        <form className="seed-add-form" onSubmit={addPacket}>
          <label>
            Plant name *
            <input value={form.commonName} onChange={(e) => setForm({ ...form, commonName: e.target.value })} placeholder="e.g. Basil" autoFocus />
          </label>
          <label>
            Variety
            <input value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} placeholder="e.g. Genovese" />
          </label>
          <label>
            Seed count
            <input value={form.seedCount} onChange={(e) => setForm({ ...form, seedCount: e.target.value.replace(/\D/g, "") })} inputMode="numeric" />
          </label>
          <label>
            Germination %
            <input value={form.germinationRate} onChange={(e) => setForm({ ...form, germinationRate: e.target.value.replace(/\D/g, "") })} inputMode="numeric" />
          </label>
          <label>
            Year packaged
            <input value={form.packagedYear} onChange={(e) => setForm({ ...form, packagedYear: e.target.value.replace(/\D/g, "") })} inputMode="numeric" />
          </label>
          <label>
            Days to germinate
            <input value={form.daysToGermination} onChange={(e) => setForm({ ...form, daysToGermination: e.target.value.replace(/\D/g, "") })} placeholder="e.g. 7" inputMode="numeric" />
          </label>
          <label>
            Days to maturity
            <input value={form.daysToMaturity} onChange={(e) => setForm({ ...form, daysToMaturity: e.target.value.replace(/\D/g, "") })} placeholder="e.g. 65" inputMode="numeric" />
          </label>
          <label>
            Sow window start (MM-DD)
            <input value={form.springStart} onChange={(e) => setForm({ ...form, springStart: e.target.value })} placeholder="05-01" />
          </label>
          <label>
            Sow window end (MM-DD)
            <input value={form.springEnd} onChange={(e) => setForm({ ...form, springEnd: e.target.value })} placeholder="06-15" />
          </label>
          <label className="seed-add-notes">
            Notes (from the packet back)
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Sowing depth, spacing, anything worth keeping" />
          </label>
          <label className="seed-add-check">
            <input type="checkbox" checked={form.isHeirloom} onChange={(e) => setForm({ ...form, isHeirloom: e.target.checked })} /> Heirloom
          </label>
          <label className="seed-add-check">
            <input type="checkbox" checked={form.isAnnual} onChange={(e) => setForm({ ...form, isAnnual: e.target.checked })} /> Annual
          </label>
          <button className="primary-button" type="submit">Add to seed library</button>
        </form>
      )}

      {userSeeds.length > 0 && (
        <p className="seed-user-note">
          {userSeeds.length} packet{userSeeds.length === 1 ? "" : "s"} added by you:
          {userSeeds.map((seed) => (
            <span key={seed.id} className="seed-user-chip">
              {seed.commonName}{seed.variety ? ` '${seed.variety}'` : ""}
              <button onClick={() => removePacket(seed.id)} title="Remove this packet" aria-label={`Remove ${seed.commonName}`}><X size={11} /></button>
            </span>
          ))}
        </p>
      )}

      <div className="flex gap-2 flex-wrap items-center mb-6">
        <span className="text-sm font-semibold text-[#3a4430] flex items-center gap-1">
          <Filter size={16} /> Filters:
        </span>

        <FilterChip
          active={!!filter.heirloomOnly}
          activeClass="bg-[#f3e5c3] text-[#8a6520] border border-[#dfc794]"
          label="Heirlooms Only"
          onClick={() => setFilter((prev) => ({ ...prev, heirloomOnly: !prev.heirloomOnly }))}
        />
        <FilterChip
          active={!!filter.annualOnly}
          activeClass="bg-[#e3ead8] text-[#3f5c2e] border border-[#b9cba2]"
          label="Annuals Only"
          onClick={() => setFilter((prev) => ({ ...prev, annualOnly: !prev.annualOnly, perennialOnly: false }))}
        />
        <FilterChip
          active={!!filter.perennialOnly}
          activeClass="bg-[#e3ead8] text-[#3f5c2e] border border-[#b9cba2]"
          label="Perennials Only"
          onClick={() => setFilter((prev) => ({ ...prev, perennialOnly: !prev.perennialOnly, annualOnly: false }))}
        />
        <FilterChip
          active={!!filter.readyToPlant}
          activeClass="bg-[#dfeed2] text-[#33511f] border border-[#a9c48d]"
          label="Ready to Plant"
          onClick={() => setFilter((prev) => ({ ...prev, readyToPlant: !prev.readyToPlant }))}
        />

        {Object.keys(filter).length > 0 && (
          <button
            onClick={() => setFilter({})}
            className="px-3 py-1 rounded-full text-sm bg-[#f2ecd9] text-[#3a4430] hover:bg-[#e9e1cb]"
          >
            Clear Filters
          </button>
        )}

        <span className="mx-2 text-[#d8cfba]">|</span>
        <button
          onClick={() => setSortBy("planting")}
          className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-colors ${
            sortBy === "planting"
              ? "bg-[#e3ead8] text-[#3f5c2e] border border-[#b9cba2]"
              : "bg-[#f2ecd9] text-[#3a4430] hover:bg-[#e9e1cb]"
          }`}
        >
          <CalendarClock size={14} /> Planting date
        </button>
        <button
          onClick={() => setSortBy("name")}
          className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-colors ${
            sortBy === "name"
              ? "bg-[#e3ead8] text-[#3f5c2e] border border-[#b9cba2]"
              : "bg-[#f2ecd9] text-[#3a4430] hover:bg-[#e9e1cb]"
          }`}
        >
          <ArrowDownAZ size={14} /> A–Z
        </button>

        <span className="ml-auto text-sm text-[#766d5c]">
          {filteredSeeds.length} of {completeSeedVaultDatabase.length} seeds
        </span>
      </div>

      {sortBy === "planting" && (
        <p className="text-xs text-[#766d5c] -mt-4 mb-4">
          Ordered by planting date for Orem — what you can plant right now comes first, soonest-closing window at the top.
        </p>
      )}

      {sortedSeeds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSeeds.map((seed) => (
            <SeedCard key={seed.id} seed={seed} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Leaf size={48} className="mx-auto text-[#d8cfba] mb-4" />
          <h3 className="text-xl font-semibold text-[#3a4430] mb-2">No seeds found</h3>
          <p className="text-[#766d5c] mb-4">
            Try adjusting your search or filters to find seeds you're looking for.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilter({});
            }}
            className="px-4 py-2 bg-[#496331] text-white rounded hover:bg-[#3a5228] transition-colors"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}

function VaultStat({ value, label, tone }: { value: string; label: string; tone: string }) {
  return (
    <div className="text-center bg-[#fffdf6] rounded-lg border border-[#ded3b8] py-3">
      <div className={`text-2xl font-bold ${tone}`}>{value}</div>
      <div className="text-sm text-[#766d5c]">{label}</div>
    </div>
  );
}

function FilterChip({
  active,
  activeClass,
  label,
  onClick,
}: {
  active: boolean;
  activeClass: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm transition-colors ${
        active ? activeClass : "bg-[#f2ecd9] text-[#3a4430] hover:bg-[#e9e1cb]"
      }`}
    >
      {label}
    </button>
  );
}
