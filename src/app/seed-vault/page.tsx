/**
 * Seed Vault Gallery Page
 * Displays all seeds in a responsive grid with filtering and search
 */

"use client";

import React, { useState, useMemo } from "react";
import { SeedCard } from "@/components/SeedCard";
import completeSeedVaultDatabase from "@/lib/seed-vault-complete-database";
import { SeedVaultFilter } from "@/lib/seed-vault-types";
import {
  Search,
  Filter,
  BarChart3,
  Leaf,
  Flame,
} from "lucide-react";

export default function SeedVaultGallery() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<SeedVaultFilter>({});
  const [showStats, setShowStats] = useState(true);

  // Calculate stats
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

  // Filter seeds
  const filteredSeeds = useMemo(() => {
    return completeSeedVaultDatabase.filter((seed) => {
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches =
          seed.commonName.toLowerCase().includes(term) ||
          seed.variety?.toLowerCase().includes(term) ||
          seed.botanicalName.toLowerCase().includes(term);
        if (!matches) return false;
      }

      // Heirloom filter
      if (filter.heirloomOnly && !seed.isHeirloom) return false;

      // Annual filter
      if (filter.annualOnly && !seed.isAnnual) return false;

      // Ready to plant filter
      if (filter.readyToPlant && seed.seedCount === 0) return false;

      // Light requirement filter
      if (filter.lightRequirement && seed.lightRequirement !== filter.lightRequirement) {
        return false;
      }

      // Water needs filter
      if (filter.waterNeeds && seed.waterNeeds !== filter.waterNeeds) return false;

      return true;
    });
  }, [searchTerm, filter]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Leaf size={32} />
            <h1 className="text-4xl font-bold">Seed Vault</h1>
          </div>
          <p className="text-green-100 max-w-2xl">
            Karmel's complete seed inventory and growing guide. Track germination, plan plantings,
            save seeds, and grow delicious vegetables adapted to Utah's high-desert climate.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      {showStats && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.totalSeeds}</div>
                <div className="text-sm text-gray-600">Varieties</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.totalSeedCount}</div>
                <div className="text-sm text-gray-600">Total Seeds</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">{stats.heirloomCount}</div>
                <div className="text-sm text-gray-600">Heirlooms</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.avgGermination}%</div>
                <div className="text-sm text-gray-600">Avg Germination</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search seeds by name or variety..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              <Filter size={16} /> Filters:
            </span>

            <button
              onClick={() =>
                setFilter((prev) => ({
                  ...prev,
                  heirloomOnly: !prev.heirloomOnly,
                }))
              }
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter.heirloomOnly
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Heirlooms Only
            </button>

            <button
              onClick={() =>
                setFilter((prev) => ({
                  ...prev,
                  annualOnly: !prev.annualOnly,
                }))
              }
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter.annualOnly
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Annuals Only
            </button>

            <button
              onClick={() =>
                setFilter((prev) => ({
                  ...prev,
                  readyToPlant: !prev.readyToPlant,
                }))
              }
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter.readyToPlant
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Ready to Plant
            </button>

            {Object.keys(filter).length > 0 && (
              <button
                onClick={() => setFilter({})}
                className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Clear Filters
              </button>
            )}

            <span className="ml-auto text-sm text-gray-600">
              {filteredSeeds.length} of {completeSeedVaultDatabase.length} seeds
            </span>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredSeeds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSeeds.map((seed) => (
              <SeedCard key={seed.id} seed={seed} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Leaf size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No seeds found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filters to find seeds you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilter({});
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-100 border-t mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">💡 Tips</h4>
              <p className="text-gray-600">
                Click each seed card to explore detailed growing guides, Utah-specific planting
                windows, and seed-saving instructions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">📸 Photo Upload</h4>
              <p className="text-gray-600">
                Send seed packet photos to Eve for rapid cataloging. She'll read germination rates,
                extract dates, and populate the database.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">🌱 Seed Saving</h4>
              <p className="text-gray-600">
                Many heirloom varieties can save seeds. Look for the "Seed Saving Available"
                badge and detailed instructions on the Harvest tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
