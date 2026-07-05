/**
 * Seed Vault Browser
 * The full 124-packet seed vault with stats, search, and filters.
 * Used by the dedicated /seed-vault page and embedded in the main
 * app's Seed Library section.
 */

"use client";

import React, { useState, useMemo } from "react";
import { SeedCard } from "@/components/SeedCard";
import completeSeedVaultDatabase from "@/lib/seed-vault-complete-database";
import { SeedVaultFilter } from "@/lib/seed-vault-types";
import { Search, Filter, Leaf } from "lucide-react";

export function SeedVaultBrowser({ showStats = true }: { showStats?: boolean }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<SeedVaultFilter>({});

  const stats = useMemo(() => {
    const totalSeeds = completeSeedVaultDatabase.length;
    const totalSeedCount = completeSeedVaultDatabase.reduce((sum, s) => sum + s.seedCount, 0);
    const heirloomCount = completeSeedVaultDatabase.filter((s) => s.isHeirloom).length;
    const avgGermination =
      completeSeedVaultDatabase.reduce((sum, s) => sum + s.germinationRate, 0) / totalSeeds;

    return {
      totalSeeds,
      totalSeedCount,
      heirloomCount,
      avgGermination: avgGermination.toFixed(1),
    };
  }, []);

  const filteredSeeds = useMemo(() => {
    return completeSeedVaultDatabase.filter((seed) => {
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
      if (filter.readyToPlant && seed.seedCount === 0) return false;
      if (filter.lightRequirement && seed.lightRequirement !== filter.lightRequirement) {
        return false;
      }
      if (filter.waterNeeds && seed.waterNeeds !== filter.waterNeeds) return false;

      return true;
    });
  }, [searchTerm, filter]);

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
          onClick={() => setFilter((prev) => ({ ...prev, annualOnly: !prev.annualOnly }))}
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

        <span className="ml-auto text-sm text-[#766d5c]">
          {filteredSeeds.length} of {completeSeedVaultDatabase.length} seeds
        </span>
      </div>

      {filteredSeeds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSeeds.map((seed) => (
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
