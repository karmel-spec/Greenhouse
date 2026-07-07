#!/bin/zsh
# Upload Garden to Cloud — double-click me!
# One-time (re-runnable) upload of your plants, journal, photos, and all
# saved data to Supabase, so the Netlify-hosted app has the real garden.
# Needs SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local first.

cd "$(dirname "$0")"
node scripts/migrate-to-supabase.mjs
read -sk "?Done. Press any key to close."
