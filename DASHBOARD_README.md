# Trimly — Dashboard (Modern UI)

This folder contains a modern, performant dashboard scaffold for Trimly built with Next.js (App Router), MUI (Material UI), Framer Motion, and react-window.

Goals implemented
- Dark-first responsive dashboard with a ready-to-toggle light theme.
- Component-driven layout (StatsCard, LinkList, URLShortenerForm, QRCodeCard).
- Virtualized list for links via react-window for large lists.
- Framer Motion animations for subtle, performant transitions.
- Debounced inputs to reduce API calls and unnecessary re-renders.
- Lazy loading of non-critical widgets and Suspense fallbacks.
- Theme provider (client) with localStorage persistence.

Quick start

1. Install dependencies (already required):

```bash
cd /path/to/trimly/trimly
npm install
```

2. Run dev server:

```bash
npm run dev
```

What to look for
- App bar with logo and theme toggle (top-right).
- Stats cards at the top showing Total Links, Total Clicks, Active Links, Top Link.
- URL shortener form (example) with copy-to-clipboard support.
- Virtualized "My Links" list with search/debounce and QR/Copy actions.

Extending the dashboard
- Add new widgets by creating components under `components/dashboard`.
- Keep heavy widgets lazy-loaded with `React.lazy` + `Suspense`.
- Use `useMemo` and `React.memo` for expensive render-heavy components.

Performance recommendations
- Keep props stable (avoid recreating functions each render) — use `useCallback`.
- For very large datasets, implement infinite-loading with react-window-infinite-loader.
- Memoize derived arrays and expensive transforms.

Next steps (suggested)
- Wire `URLShortenerForm` to your backend/CreateLink API.
- Replace mock `getUrls` / `getClicksForUrls` hooks with real Supabase or API calls.
- Add optional drag/resizable layout support (e.g., react-grid-layout) for widgets.
- Add unit tests for core components and visual regression tests.

Design notes
- Default theme is dark; theme toggles are persisted to localStorage.
- Cards are interactive with hover elevation and small motion for polish.

Files of interest
- `app/layout.tsx` — Root layout wiring ThemeProvider.
- `app/dashboard-new/page.tsx` — Example dashboard page wiring components.
- `components/providers/ThemeProvider.tsx` — Client theme provider.
- `components/dashboard/*` — Cards, list, form and QR components.
- `theme/theme.ts` — MUI theme token generator.

If you'd like, I can now:
- Wire the URL creation flow to your existing `CreateLink` API.
- Add drag/resizable widgets using `react-grid-layout` with persisted layout.
- Add server-side pagination endpoints to feed the virtualized list.

