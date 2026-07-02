# Karmel's Garden OS

Roots, Light & Growth.

This first version is a mobile-friendly mock-data web app for Karmel's garden operating system. Eve is the assistant inside the app, not the app name.

## Run Locally

```bash
pnpm install
pnpm dev
```

## AI Diagnosis Setup

Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY` to enable real photo analysis in Photo Journal.

Hermes/Eve can be connected as the garden knowledge source by setting `HERMES_EVE_CONTEXT_URL`. The app will call that endpoint for Karmel-specific context, then use OpenAI vision for plant identification and diagnosis.

## Included

- Responsive app shell with desktop sidebar and mobile bottom tabs
- Today in the Garden dashboard
- Eve assistant panel and prompt library
- Plant library, garden zones, propagation lab, microgreens studio, apothecary garden
- Seed packet library, seed saving, photo journal, wishlist, edible landscape, aerial map, scriptures, learning center, reminder architecture
- Placeholder API routes under `/api/eve/*` and `/api/reminders`
- Mock-data-first structure ready for Supabase, Firebase, uploads, and assistant integration
