/**
 * Seed Vault Card Component
 * Beautiful display for individual seed records with tabs and expandable sections
 */

"use client";

import React, { useState } from "react";
import { SeedPacket } from "@/lib/seed-vault-types";
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

/** Four-stage lifecycle strip: real photos when set on the packet, artwork otherwise. */
function LifecycleStrip({ seed }: { seed: SeedPacket }) {
  const art = cropArt(seed.commonName);
  const stages: { label: string; photo?: string; emoji: string }[] = [
    { label: "Seed", photo: seed.seedCloseupPhoto, emoji: "🌰" },
    { label: "Seedling", photo: seed.seedlingPhoto, emoji: "🌱" },
    { label: "Plant", photo: seed.maturePlantPhoto, emoji: art.plant },
    { label: "Harvest", photo: seed.harvestedProductPhoto, emoji: art.harvest },
  ];

  return (
    <div className="grid grid-cols-4 border-b bg-green-50/40">
      {stages.map((stage, index) => (
        <div
          key={stage.label}
          className={`flex flex-col items-center py-2 ${index < 3 ? "border-r border-green-100" : ""}`}
        >
          {stage.photo ? (
            <img src={stage.photo} alt={`${seed.commonName} ${stage.label}`} className="h-10 w-10 rounded object-cover" />
          ) : (
            <span className="text-2xl leading-10">{stage.emoji}</span>
          )}
          <span className="text-[10px] uppercase tracking-wide text-gray-500">{stage.label}</span>
        </div>
      ))}
    </div>
  );
}

type TabType = "overview" | "growing" | "harvest" | "culinary" | "history" | "notes";

export function SeedCard({ seed }: SeedCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [expanded, setExpanded] = useState(false);

  const tabs = [
    { id: "overview", label: "Overview", icon: Leaf },
    { id: "growing", label: "Growing", icon: Sprout },
    { id: "harvest", label: "Harvest", icon: Calendar },
    { id: "culinary", label: "Culinary", icon: ChefHat },
    { id: "history", label: "History", icon: TrendingUp },
    { id: "notes", label: "Notes", icon: BookOpen },
  ];

  const getGerminationColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
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

  const headerArt = cropArt(seed.commonName);
  const headerByTab: Record<TabType, { photo?: string; emoji: string }> = {
    overview: { photo: seed.maturePlantPhoto ?? seed.seedPacketPhoto, emoji: headerArt.plant },
    growing: { photo: seed.seedlingPhoto, emoji: "🌱" },
    harvest: { photo: seed.harvestedProductPhoto, emoji: headerArt.harvest },
    culinary: { photo: seed.harvestedProductPhoto, emoji: "🍽️" },
    history: { photo: seed.seedPacketPhoto, emoji: "📜" },
    notes: { photo: seed.seedPacketPhoto, emoji: "📝" },
  };
  const headerVisual = headerByTab[activeTab];

  return (
    <div className="border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-white">
      {/* Header image follows the active tab: plant → seedling → harvest → ... */}
      <div className="relative h-48 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center overflow-hidden">
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
        <div className="absolute bottom-2 left-2 bg-white/80 text-gray-600 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
          {activeTab}
        </div>
        {pastViability && (
          <div
            className="absolute top-2 right-2 bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1"
            title={`Packaged ${packagedYear}, ~${shelfLife}-year shelf life. Germination is likely reduced — test before big plantings.`}
          >
            <AlertCircle size={14} /> Was viable through {viableThrough}
          </div>
        )}
        {nearViability && (
          <div
            className="absolute top-2 right-2 bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1"
            title={`Packaged ${packagedYear}, ~${shelfLife}-year shelf life.`}
          >
            <AlertCircle size={14} /> Viable through {viableThrough}
          </div>
        )}
      </div>

      {/* Lifecycle: seed → seedling → plant → harvest */}
      <LifecycleStrip seed={seed} />

      {/* Title Section */}
      <div className="p-4 border-b">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {seed.commonName}
              {seed.variety && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  '{seed.variety}'
                </span>
              )}
            </h3>
            {seed.botanicalName && (
              <p className="text-xs italic text-gray-500">{seed.botanicalName}</p>
            )}
          </div>
          {seed.isHeirloom && (
            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-semibold">
              Heirloom
            </span>
          )}
        </div>

        {/* Quick Info Row */}
        <div className="grid grid-cols-4 gap-2 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-800">{seed.seedCount}</div>
            <div className="text-xs text-gray-600">Seeds</div>
          </div>
          <div className={`text-center ${getGerminationColor(seed.germinationRate)}`}>
            <div className="font-semibold">{seed.germinationRate}%</div>
            <div className="text-xs text-gray-600">Germ.</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-800">{seed.daysToMaturity}d</div>
            <div className="text-xs text-gray-600">To Harvest</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-800">
              {new Date(seed.packagedDate).getFullYear()}
            </div>
            <div className="text-xs text-gray-600">Packaged</div>
          </div>
        </div>

        {/* Status Badge */}
        {seed.seedCount > 50 ? (
          <div className="mt-2 text-xs flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded">
            <CheckCircle size={14} /> Ready to plant (abundant seeds)
          </div>
        ) : seed.seedCount > 0 ? (
          <div className="mt-2 text-xs flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-1 rounded">
            <CheckCircle size={14} /> Ready to plant (limited quantity)
          </div>
        ) : null}
      </div>

      {/* Tabs */}
      <div className="border-b bg-gray-50">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-shrink-0 px-4 py-2 border-b-2 font-medium text-sm flex items-center gap-1 transition-colors ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-700 bg-green-50"
                    : "border-transparent text-gray-600 hover:text-gray-800"
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
                <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <Sun size={16} /> Light & Water
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    <strong>Light:</strong> {seed.lightRequirement?.replace("-", " ") || "Not specified"}
                  </li>
                  <li>
                    <strong>Water:</strong> {seed.waterNeeds || "Not specified"}
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} /> Utah Growing
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
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
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-900">
                  <strong>Utah Tips:</strong> {seed.utahSpecificNotes}
                </p>
              </div>
            )}
            <div className={`rounded p-3 border ${pastViability ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"}`}>
              <p className={`text-sm ${pastViability ? "text-orange-900" : "text-gray-700"}`}>
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
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Planting Details</h4>
              <ul className="text-sm text-gray-600 space-y-1">
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
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Companion Plants</h4>
                <p className="text-sm text-gray-600">
                  {seed.companionPlants.join(", ")}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "harvest" && (
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Harvesting</h4>
              <ul className="text-sm text-gray-600 space-y-1">
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
                <h4 className="font-semibold text-sm text-gray-700 mb-1">Flavor</h4>
                <p className="text-sm text-gray-600">{seed.flavorProfile}</p>
              </div>
            )}
            {seed.cookingMethods && seed.cookingMethods.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-1">Cooking Methods</h4>
                <p className="text-sm text-gray-600">{seed.cookingMethods.join(", ")}</p>
              </div>
            )}
            {seed.preservationMethods && seed.preservationMethods.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-1">Preservation</h4>
                <p className="text-sm text-gray-600">{seed.preservationMethods.join(", ")}</p>
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
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Recipes</h4>
                <ul className="space-y-1">
                  {seed.recipeLinks.map((recipe, idx) => (
                    <li key={idx}>
                      <a
                        href={recipe.url}
                        className="text-sm text-green-600 hover:underline"
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
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-3">
            {seed.plantingHistory && seed.plantingHistory.length > 0 ? (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Planting Records</h4>
                {seed.plantingHistory.map((record, idx) => (
                  <div key={idx} className="border rounded p-2 mb-2 bg-gray-50 text-sm">
                    <div className="font-semibold text-gray-800">{record.year}</div>
                    {record.yieldObtained && (
                      <div className="text-gray-700">
                        <strong>Yield:</strong> {record.yieldObtained}
                      </div>
                    )}
                    {record.gardenerNotes && (
                      <div className="text-gray-600 italic">{record.gardenerNotes}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No planting history yet.</p>
            )}
            {seed.successStories && seed.successStories.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
                  <CheckCircle size={16} className="text-green-600" /> Success Stories
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {seed.successStories.map((story, idx) => (
                    <li key={idx}>✓ {story}</li>
                  ))}
                </ul>
              </div>
            )}
            {seed.challenges && seed.challenges.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
                  <AlertCircle size={16} className="text-amber-600" /> Challenges
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
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
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-900">{seed.notes}</p>
              </div>
            )}
            <div className="text-xs text-gray-500 space-y-1">
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

      {/* Footer */}
      <div className="border-t bg-gray-50 px-4 py-3 flex justify-between items-center">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          {expanded ? "Hide Details" : "Expand All"} →
        </button>
        <div className="text-xs text-gray-500">
          ID: <code className="font-mono">{seed.id}</code>
        </div>
      </div>
    </div>
  );
}
