/**
 * Seed Vault Card Component
 * Beautiful display for individual seed records with tabs and expandable sections
 */

"use client";

import React, { useState } from "react";
import { SeedPacket } from "@/lib/seed-vault-types";
import { cropPhotos } from "@/lib/crop-photos";
import { nextPlanting } from "@/lib/planting";
import { recipeIdeas } from "@/lib/culinary";
import { seedSavingGuide, STORAGE_DEFAULT } from "@/lib/seed-saving";
import {
  Leaf,
  Calendar,
  Droplet,
  Sun,
  Sprout,
  BookOpen,
  ChefHat,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Archive,
} from "lucide-react";

interface SeedCardProps {
  seed: SeedPacket;
}

// Per-crop artwork for the lifecycle strip (plant stage + harvest stage).
const CROP_ART: { match: RegExp; plant: string; harvest: string }[] = [
  { match: /tomato/i, plant: "🌿", harvest: "🍅" },
  { match: /pepper, hot|hot pepper/i, plant: "🌿", harvest: "🌶️" },
  { match: /pepper/i, plant: "🌿", harvest: "🫑" },
  { match: /carrot|parsnip/i, plant: "☘️", harvest: "🥕" },
  { match: /corn/i, plant: "🎋", harvest: "🌽" },
  { match: /bean|lentil/i, plant: "🌿", harvest: "🫘" },
  { match: /pea\b|pea,/i, plant: "🌿", harvest: "🫛" },
  { match: /lettuce|spinach|kale|collard|chard|cabbage|mustard|chicory|celery|kohlrabi|turnip|brussels/i, plant: "🥬", harvest: "🥬" },
  { match: /broccoli/i, plant: "🌿", harvest: "🥦" },
  { match: /onion/i, plant: "🌱", harvest: "🧅" },
  { match: /melon(?!.*water)/i, plant: "🌿", harvest: "🍈" },
  { match: /watermelon/i, plant: "🌿", harvest: "🍉" },
  { match: /cucumber/i, plant: "🌿", harvest: "🥒" },
  { match: /pumpkin/i, plant: "🌿", harvest: "🎃" },
  { match: /squash/i, plant: "🌿", harvest: "🎃" },
  { match: /radish|beet/i, plant: "☘️", harvest: "🌰" },
  { match: /almond/i, plant: "🌳", harvest: "🌰" },
  { match: /poppy/i, plant: "🌿", harvest: "🌸" },
  { match: /amaranth/i, plant: "🌾", harvest: "🌾" },
  { match: /fennel|coriander|asparagus|okra/i, plant: "🌿", harvest: "🌿" },
];

function cropArt(commonName: string) {
  const entry = CROP_ART.find((candidate) => candidate.match.test(commonName));
  return entry ?? { plant: "🌿", harvest: "🧺" };
}

/** Lifecycle strip: real photos only (packet fields first, then the local crop photo set). */
function LifecycleStrip({ seed }: { seed: SeedPacket }) {
  const set = cropPhotos[seed.commonName.toLowerCase()] ?? {};
  const stages = [
    { label: "Seed", photo: seed.seedCloseupPhoto ?? set.seed },
    { label: "Seedling", photo: seed.seedlingPhoto ?? set.seedling },
    { label: "Plant", photo: seed.maturePlantPhoto ?? set.plant },
    { label: "Harvest", photo: seed.harvestedProductPhoto ?? set.harvest },
  ].filter((stage) => !!stage.photo);

  if (stages.length < 2) return null;

  return (
    <div className={`grid border-b bg-[#f7f1e2]`} style={{ gridTemplateColumns: `repeat(${stages.length}, 1fr)` }}>
      {stages.map((stage, index) => (
        <div
          key={stage.label}
          className={`flex flex-col items-center ${index < stages.length - 1 ? "border-r border-[#e4dcc4]" : ""}`}
        >
          <img
            src={stage.photo}
            alt={`${seed.commonName} ${stage.label}`}
            className="h-16 w-full object-cover"
          />
          <span className="text-[10px] uppercase tracking-wide text-[#766d5c] py-1">{stage.label}</span>
        </div>
      ))}
    </div>
  );
}

type TabType = "overview" | "growing" | "harvest" | "culinary" | "seedsaving" | "history" | "notes";

export function SeedCard({ seed }: SeedCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [expanded, setExpanded] = useState(false);

  const tabs = [
    { id: "overview", label: "Overview", icon: Leaf },
    { id: "growing", label: "Growing", icon: Sprout },
    { id: "harvest", label: "Harvest", icon: Calendar },
    { id: "culinary", label: "Culinary", icon: ChefHat },
    { id: "seedsaving", label: "Seed Saving", icon: Archive },
    { id: "history", label: "History", icon: TrendingUp },
    { id: "notes", label: "Notes", icon: BookOpen },
  ];

  const getGerminationColor = (rate: number) => {
    if (rate >= 90) return "text-[#4c7a3d]";
    if (rate >= 75) return "text-yellow-600";
    return "text-orange-600";
  };

  // Seeds don't die on a date — germination declines. "Viable through" is
  // packaged year + the variety's estimated shelf life.
  const packagedYear = new Date(seed.packagedDate).getFullYear();
  const shelfLife = seed.estimatedShelfLife ?? 5;
  const viableThrough = packagedYear + shelfLife;
  const currentYear = new Date().getFullYear();
  const pastViability = currentYear > viableThrough;
  const nearViability = !pastViability && currentYear >= viableThrough - 1;

  const stockPhotos = cropPhotos[seed.commonName.toLowerCase()] ?? {};
  const headerArt = cropArt(seed.commonName);
  const headerByTab: Record<TabType, { photo?: string; emoji: string }> = {
    overview: { photo: seed.maturePlantPhoto ?? seed.seedPacketPhoto ?? stockPhotos.plant ?? stockPhotos.harvest, emoji: headerArt.plant },
    growing: { photo: seed.seedlingPhoto ?? stockPhotos.seedling ?? stockPhotos.plant, emoji: "🌱" },
    harvest: { photo: seed.harvestedProductPhoto ?? stockPhotos.harvest ?? stockPhotos.plant, emoji: headerArt.harvest },
    culinary: { photo: stockPhotos.dish ?? seed.harvestedProductPhoto ?? stockPhotos.harvest, emoji: "🍽️" },
    seedsaving: { photo: seed.seedCloseupPhoto ?? stockPhotos.seed ?? stockPhotos.plant, emoji: "🌰" },
    history: { photo: seed.seedPacketPhoto ?? stockPhotos.plant, emoji: "📜" },
    notes: { photo: seed.seedPacketPhoto ?? stockPhotos.plant, emoji: "📝" },
  };
  const headerVisual = headerByTab[activeTab];
  const planting = nextPlanting(seed, new Date());

  return (
    <div className="border border-[#ded3b8] rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-[#fffdf6]">
      {/* Header image follows the active tab: plant → seedling → harvest → ... */}
      <div className="relative h-48 bg-gradient-to-br from-[#f1e9d4] to-[#e6eedd] flex items-center justify-center overflow-hidden">
        {headerVisual.photo ? (
          <img
            key={activeTab}
            src={headerVisual.photo}
            alt={`${seed.commonName} — ${activeTab}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div key={activeTab} className="text-7xl seed-header-emoji" aria-hidden>
            {headerVisual.emoji}
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-[#fffdf6]/80 text-[#766d5c] px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
          {activeTab}
        </div>
        {planting && (
          <div
            className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
              planting.now ? "bg-[#dfeed2] text-[#33511f]" : "bg-[#fffdf6]/90 text-[#496331]"
            }`}
            title="Utah zone 6b planting window (~ = estimated from frost hardiness)"
          >
            {planting.now ? <CheckCircle size={14} /> : <Calendar size={14} />} {planting.text}
          </div>
        )}
      </div>

      {/* Lifecycle: seed → seedling → plant → harvest */}
      <LifecycleStrip seed={seed} />

      {/* Title Section */}
      <div className="p-4 border-b">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-xl font-bold font-serif text-[#26301e]">
              {seed.commonName}
              {seed.variety && (
                <span className="text-sm font-normal text-[#766d5c] ml-2">
                  '{seed.variety}'
                </span>
              )}
            </h3>
            {seed.botanicalName && (
              <p className="text-xs italic text-[#766d5c]">{seed.botanicalName}</p>
            )}
          </div>
          {seed.isHeirloom && (
            <span className="bg-[#f3e5c3] text-[#8a6520] px-2 py-1 rounded text-xs font-semibold">
              Heirloom
            </span>
          )}
        </div>

        {/* Quick Info Row */}
        <div className="grid grid-cols-4 gap-2 text-sm">
          <div className="text-center">
            <div className="font-semibold text-[#26301e]">{seed.seedCount}</div>
            <div className="text-xs text-[#766d5c]">Seeds</div>
          </div>
          <div className={`text-center ${getGerminationColor(seed.germinationRate)}`}>
            <div className="font-semibold">{seed.germinationRate}%</div>
            <div className="text-xs text-[#766d5c]">Germ.</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-[#26301e]">{seed.daysToMaturity}d</div>
            <div className="text-xs text-[#766d5c]">To Harvest</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-[#26301e]">
              {new Date(seed.packagedDate).getFullYear()}
            </div>
            <div className="text-xs text-[#766d5c]">Packaged</div>
          </div>
        </div>

        {/* Status Badge */}
        {seed.seedCount > 50 ? (
          <div className="mt-2 text-xs flex items-center gap-1 text-[#3f5c2e] bg-[#edf3e3] px-2 py-1 rounded">
            <CheckCircle size={14} /> Ready to plant (abundant seeds)
          </div>
        ) : seed.seedCount > 0 ? (
          <div className="mt-2 text-xs flex items-center gap-1 text-[#6d5433] bg-[#f5edda] px-2 py-1 rounded">
            <CheckCircle size={14} /> Ready to plant (limited quantity)
          </div>
        ) : null}
      </div>

      {/* Tabs */}
      <div className="border-b bg-[#f7f1e2]">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-shrink-0 px-4 py-2 border-b-2 font-medium text-sm flex items-center gap-1 transition-colors ${
                  activeTab === tab.id
                    ? "border-[#496331] text-[#496331] bg-[#f2ecd9]"
                    : "border-transparent text-[#766d5c] hover:text-[#26301e]"
                }`}
              >
                <IconComponent size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "overview" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-[#3a4430] mb-2 flex items-center gap-2">
                  <Sun size={16} /> Light & Water
                </h4>
                <ul className="text-sm text-[#766d5c] space-y-1">
                  <li>
                    <strong>Light:</strong> {seed.lightRequirement?.replace("-", " ") || "Not specified"}
                  </li>
                  <li>
                    <strong>Water:</strong> {seed.waterNeeds || "Not specified"}
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[#3a4430] mb-2 flex items-center gap-2">
                  <Calendar size={16} /> Utah Growing
                </h4>
                <ul className="text-sm text-[#766d5c] space-y-1">
                  <li>
                    <strong>Zone:</strong> {seed.utahZone || "N/A"}
                  </li>
                  <li>
                    <strong>Type:</strong> {seed.isAnnual ? "Annual" : "Perennial"}
                  </li>
                </ul>
              </div>
            </div>
            {seed.utahSpecificNotes && (
              <div className="bg-[#eef3e7] border border-[#cfdabc] rounded p-3">
                <p className="text-sm text-[#334224]">
                  <strong>Utah Tips:</strong> {seed.utahSpecificNotes}
                </p>
              </div>
            )}
            <div className={`rounded p-3 border ${pastViability ? "bg-orange-50 border-orange-200" : "bg-[#f7f1e2] border-[#ded3b8]"}`}>
              <p className={`text-sm ${pastViability ? "text-orange-900" : "text-[#3a4430]"}`}>
                <strong>Seed viability:</strong> packaged {packagedYear}, estimated {shelfLife}-year shelf
                life → viable through <strong>{viableThrough}</strong>.
                {pastViability
                  ? " Past that window germination drops — sprout 10 seeds in a damp paper towel to test before relying on them."
                  : " Store cool and dry to reach the full window."}
              </p>
            </div>
          </div>
        )}

        {activeTab === "growing" && (
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm text-[#3a4430] mb-2">Planting Details</h4>
              <ul className="text-sm text-[#766d5c] space-y-1">
                <li>
                  <strong>Start:</strong> {seed.startIndoors !== undefined ? (seed.startIndoors ? "Indoors" : "Direct sow") : "Not specified"}
                </li>
                <li>
                  <strong>Germination:</strong> {seed.daysToGermination || "N/A"} days
                </li>
                <li>
                  <strong>Maturity:</strong> {seed.daysToMaturity} days
                </li>
                <li>
                  <strong>Spacing:</strong> {seed.spacingInches} inches apart
                </li>
                <li>
                  <strong>Soil:</strong> {seed.soilType || "Well-draining loam"}
                </li>
              </ul>
            </div>
            {seed.companionPlants && seed.companionPlants.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-[#3a4430] mb-2">Companion Plants</h4>
                <p className="text-sm text-[#766d5c]">
                  {seed.companionPlants.join(", ")}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "harvest" && (
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm text-[#3a4430] mb-2">Harvesting</h4>
              <ul className="text-sm text-[#766d5c] space-y-1">
                <li>
                  <strong>Season:</strong> {seed.harvestSeason || "See planting calendar"}
                </li>
                <li>
                  <strong>Timing:</strong> {seed.harvestTiming}
                </li>
                {seed.yieldPerPlant && (
                  <li>
                    <strong>Yield:</strong> {seed.yieldPerPlant}
                  </li>
                )}
              </ul>
            </div>
            {seed.canSaveSeed && (
              <div className="bg-amber-50 border border-amber-200 rounded p-3">
                <p className="text-sm font-semibold text-amber-900 mb-1">
                  🌱 Seed Saving Available
                </p>
                <p className="text-sm text-amber-800">
                  {seed.seedSavingInstructions ||
                    "Allow pods to mature, dry, and shell. Store in cool, dry place."}
                </p>
              </div>
            )}
            <div className="text-sm">
              <strong>Storage:</strong> {seed.seedStorageMethod} ({seed.estimatedShelfLife} years
              viable)
            </div>
          </div>
        )}

        {activeTab === "culinary" && (
          <div className="space-y-3">
            {seed.flavorProfile && (
              <div>
                <h4 className="font-semibold text-sm text-[#3a4430] mb-1">Flavor</h4>
                <p className="text-sm text-[#766d5c]">{seed.flavorProfile}</p>
              </div>
            )}
            {seed.cookingMethods && seed.cookingMethods.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-[#3a4430] mb-1">Cooking Methods</h4>
                <p className="text-sm text-[#766d5c]">{seed.cookingMethods.join(", ")}</p>
              </div>
            )}
            {seed.preservationMethods && seed.preservationMethods.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-[#3a4430] mb-1">Preservation</h4>
                <p className="text-sm text-[#766d5c]">{seed.preservationMethods.join(", ")}</p>
              </div>
            )}
            {seed.nutritionHighlights && (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-sm font-semibold text-green-900 mb-1">Nutrition</p>
                <p className="text-sm text-green-800">{seed.nutritionHighlights}</p>
              </div>
            )}
            {seed.recipeLinks && seed.recipeLinks.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-[#3a4430] mb-2">Recipes</h4>
                <ul className="space-y-1">
                  {seed.recipeLinks.map((recipe, idx) => (
                    <li key={idx}>
                      <a
                        href={recipe.url}
                        className="text-sm text-[#4c7a3d] hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        → {recipe.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <h4 className="font-semibold text-sm text-[#3a4430] mb-2 flex items-center gap-1">
                <ChefHat size={15} /> Top Ways to Cook It
              </h4>
              <ul className="space-y-1">
                {recipeIdeas(seed.commonName).map((recipe) => (
                  <li key={recipe.title}>
                    <a
                      href={recipe.url}
                      className="text-sm text-[#4c7a3d] hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      → {recipe.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "seedsaving" && (() => {
          const guide = seedSavingGuide(seed.commonName);
          return (
            <div className="space-y-3">
              {seed.isHeirloom && seed.canSaveSeed ? (
                <div className="text-xs flex items-center gap-1 text-[#3f5c2e] bg-[#edf3e3] px-2 py-1 rounded">
                  <CheckCircle size={14} /> Heirloom — saved seeds grow true to type
                </div>
              ) : (
                <div className="text-xs flex items-center gap-1 text-[#8a6520] bg-[#f3e5c3]/70 px-2 py-1 rounded">
                  <AlertCircle size={14} /> Not a documented heirloom — saved seeds may not grow exactly true
                </div>
              )}
              <div>
                <h4 className="font-semibold text-sm text-[#3a4430] mb-1">1. When the seed is ready</h4>
                <p className="text-sm text-[#766d5c]">{seed.seedMaturityIndicators ?? guide.collect}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[#3a4430] mb-1">2. Collect &amp; dry</h4>
                <p className="text-sm text-[#766d5c]">{seed.seedSavingInstructions ?? guide.process}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[#3a4430] mb-1">3. Store for next year</h4>
                <p className="text-sm text-[#766d5c]">
                  {seed.seedStorageMethod
                    ? `Store ${seed.seedStorageMethod.replace("-", ", ")}${
                        seed.seedStorageTemperature
                          ? ` at ${seed.seedStorageTemperature.min}–${seed.seedStorageTemperature.max}°F`
                          : ""
                      }${seed.seedStorageHumidity ? `, humidity ${seed.seedStorageHumidity}` : ""}. Label with variety and year.`
                    : STORAGE_DEFAULT}{" "}
                  Stored well, expect ~{seed.estimatedShelfLife ?? 5} years of good germination.
                </p>
              </div>
              {guide.note && (
                <div className="bg-[#eef3e7] border border-[#cfdabc] rounded p-3">
                  <p className="text-sm text-[#334224]"><strong>Worth knowing:</strong> {guide.note}</p>
                </div>
              )}
            </div>
          );
        })()}

        {activeTab === "history" && (
          <div className="space-y-3">
            {seed.plantingHistory && seed.plantingHistory.length > 0 ? (
              <div>
                <h4 className="font-semibold text-sm text-[#3a4430] mb-2">Planting Records</h4>
                {seed.plantingHistory.map((record, idx) => (
                  <div key={idx} className="border rounded p-2 mb-2 bg-[#f7f1e2] text-sm">
                    <div className="font-semibold text-[#26301e]">{record.year}</div>
                    {record.yieldObtained && (
                      <div className="text-[#3a4430]">
                        <strong>Yield:</strong> {record.yieldObtained}
                      </div>
                    )}
                    {record.gardenerNotes && (
                      <div className="text-[#766d5c] italic">{record.gardenerNotes}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#766d5c]">No planting history yet.</p>
            )}
            {seed.successStories && seed.successStories.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-[#3a4430] mb-2 flex items-center gap-1">
                  <CheckCircle size={16} className="text-[#4c7a3d]" /> Success Stories
                </h4>
                <ul className="text-sm text-[#766d5c] space-y-1">
                  {seed.successStories.map((story, idx) => (
                    <li key={idx}>✓ {story}</li>
                  ))}
                </ul>
              </div>
            )}
            {seed.challenges && seed.challenges.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-[#3a4430] mb-2 flex items-center gap-1">
                  <AlertCircle size={16} className="text-[#c99a45]" /> Challenges
                </h4>
                <ul className="text-sm text-[#766d5c] space-y-1">
                  {seed.challenges.map((challenge, idx) => (
                    <li key={idx}>⚠ {challenge}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-3">
            {seed.notes && (
              <div className="bg-[#eef3e7] border border-[#cfdabc] rounded p-3">
                <p className="text-sm text-[#334224]">{seed.notes}</p>
              </div>
            )}
            <div className="text-xs text-[#766d5c] space-y-1">
              <p>
                <strong>Created:</strong> {new Date(seed.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Updated:</strong> {new Date(seed.updatedAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Source:</strong> {seed.source}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Viability notice lives at the bottom of the card */}
      {(pastViability || nearViability) && (
        <div
          className={`border-t px-4 py-2 text-xs font-medium flex items-center gap-1.5 ${
            pastViability ? "bg-orange-50 text-orange-800" : "bg-[#f3e5c3]/60 text-[#8a6520]"
          }`}
          title={`Packaged ${packagedYear}, ~${shelfLife}-year shelf life.`}
        >
          <AlertCircle size={13} />
          {pastViability
            ? `Was viable through ${viableThrough} — test germination before big plantings`
            : `Viable through ${viableThrough}`}
        </div>
      )}

      {/* Footer */}
      <div className="border-t bg-[#f7f1e2] px-4 py-3 flex justify-between items-center">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-[#4c7a3d] hover:text-[#496331] font-medium"
        >
          {expanded ? "Hide Details" : "Expand All"} →
        </button>
        <div className="text-xs text-[#766d5c]">
          ID: <code className="font-mono">{seed.id}</code>
        </div>
      </div>
    </div>
  );
}
