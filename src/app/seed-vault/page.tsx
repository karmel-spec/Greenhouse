/**
 * Seed Vault Gallery Page
 * Dedicated full-page view of the seed vault. The browsing UI itself
 * lives in SeedVaultBrowser, shared with the main app's Seed Library.
 */

"use client";

import { SeedVaultBrowser } from "@/components/SeedVaultBrowser";
import { Leaf } from "lucide-react";

export default function SeedVaultGallery() {
  return (
    <div className="min-h-screen bg-[#f7f1e2]">
      <div className="bg-gradient-to-r from-[#496331] to-[#06261c] text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Leaf size={32} />
            <h1 className="text-4xl font-bold font-serif">Seed Vault</h1>
          </div>
          <p className="text-[#e8e3d2] max-w-2xl">
            Karmel's complete seed inventory and growing guide. Track germination, plan plantings,
            save seeds, and grow delicious vegetables adapted to Utah's high-desert climate.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <SeedVaultBrowser />
      </div>

      <div className="bg-[#f2ecd9] border-t mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-[#26301e] mb-2">💡 Tips</h4>
              <p className="text-[#766d5c]">
                Click each seed card to explore detailed growing guides, Utah-specific planting
                windows, and seed-saving instructions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#26301e] mb-2">📸 Photo Upload</h4>
              <p className="text-[#766d5c]">
                Send seed packet photos to Eve for rapid cataloging. She'll read germination rates,
                extract dates, and populate the database.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#26301e] mb-2">🌱 Seed Saving</h4>
              <p className="text-[#766d5c]">
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
