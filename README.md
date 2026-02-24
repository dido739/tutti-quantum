# Tutti Quantum

Tutti Quantum is a multiplayer strategy card game inspired by Feynman-style particle interactions.

Players build diagrams by placing and rotating particle cards, creating legal vertices for points, and avoiding invalid combinations. The app supports English and Bulgarian UI.

## Features

- **Game modes**: Local multiplayer, AI game, and online multiplayer
- **Rules engine**: Legal placement validation + auto-orient helper
- **Scoring**: Vertex/connection-based scoring with penalties for invalid combinations
- **AI**: Difficulty levels with legal-move selection
- **Realtime online play**: Supabase-backed sessions and sync
- **Auth**: Supabase email/password authentication
- **Bilingual UI**: English/Bulgarian language switching

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (`auth`, `database`, `realtime`)
- Vitest + Testing Library

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env` file (or copy from `.env.example`) with:

```dotenv
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
# Optional legacy alias:
# VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
```

### 3) Run the app

```bash
npm run dev
```

### 4) Run tests

```bash
npm run test
```

## Supabase Setup

This project expects a configured Supabase project with the SQL migrations in `supabase/migrations` applied.

If you use the Supabase CLI:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

## Available Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run build:dev` - development-mode build
- `npm run preview` - preview built app
- `npm run lint` - run ESLint
- `npm run test` - run tests once
- `npm run test:watch` - run tests in watch mode

## Project Structure

- `src/pages` - route pages (`Index`, `LocalGame`, `AIGame`, `OnlineGame`, etc.)
- `src/components` - reusable UI and gameplay components
- `src/lib` - core game logic and AI logic
- `src/contexts` - auth and i18n contexts
- `src/integrations/supabase` - Supabase client and types
- `supabase/migrations` - database/RLS migrations

## Notes

- Online mode requires valid Supabase env values.
- If registration or multiplayer writes fail, verify migrations and RLS policies are applied.
- Language preference is persisted locally in the browser.
