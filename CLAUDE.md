# Serene Ledger - 宁静账本

## Tech Stack
- Next.js 15.5.14 + Turbopack
- React 19 + TypeScript
- Tailwind CSS v4 (NOT v3)
- Supabase (Auth + Database)
- Deployed: not yet (planned: Vercel)

## Critical Rules

### Never change framework versions manually
This project was initialized with `create-next-app@15`. Do NOT:
- Downgrade/upgrade Next.js by editing package.json
- Switch between Tailwind v3 and v4
- Change postcss.config.mjs format
- These caused hours of compilation failures.

### Tailwind v4 syntax
- CSS uses `@import "tailwindcss"` + `@theme inline {}`, NOT `@tailwind base`
- No `tailwind.config.js/ts` file — colors defined in `globals.css` via `@theme inline`
- PostCSS plugin is `@tailwindcss/postcss`, NOT `tailwindcss`

### Path alias
- `@/*` maps to `./src/*` (configured in tsconfig.json)
- All source code is in `src/`

### Always git commit before risky changes
- Run `git add -A && git commit -m "checkpoint"` before debugging or refactoring
- Never delete source files without a backup

### Dev server
- Start with `npm run dev` (uses `next dev --turbopack`)
- User has Clash proxy — first compilation may need direct connection mode
- Ready in ~1 second normally

## Architecture
```
src/
  app/
    page.tsx          — 个案管理主页
    layout.tsx        — Root layout (imports AppShell client component)
    login/page.tsx    — 登录/注册
    schedule/page.tsx — 日程安排
    stats/page.tsx    — 数据统计
    globals.css       — Tailwind v4 theme
  components/         — UI components (all "use client")
  hooks/              — useAuth, useClients, useSchedule, useStatistics
  lib/supabase.ts     — Supabase client
  types/index.ts      — TypeScript interfaces
```

## Database (Supabase)
Tables: clients, sessions, events, event_clients, profiles
RLS enabled — all tables have user_id column for data isolation.
