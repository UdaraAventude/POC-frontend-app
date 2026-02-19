# DataGrid Pro — High-Performance Client-Side Grid

> **50,000 records. 60 FPS. Zero backend.**
> A production-grade POC demonstrating "Google-Anti-Gravity" frontend engineering.

---

## 🏗 Architecture Overview

```
src/
├── workers/
│   └── dataGenerator.worker.ts   # Off-main-thread: generate + search + status toggle
├── hooks/
│   ├── useDataWorker.ts           # Worker bridge: lifecycle, optimistic UI, rollback
│   └── useDebounce.ts             # Input debounce (300ms)
├── components/
│   ├── Toolbar.tsx                # Debounced search + router NavLinks
│   ├── VirtualList/
│   │   └── ListContainer.tsx      # react-window + AutoSizer
│   ├── ListItem/
│   │   └── Row.tsx                # React.memo + custom arePropsEqual
│   ├── LegacyList.tsx             # .map() rendering (intentional jank demo)
│   ├── EmptyState.tsx             # Zero-result SVG illustration
│   └── ToastContainer.tsx         # Rollback notifications (no external lib)
├── pages/
│   ├── OptimizedPage.tsx          # Route /    — virtualized + profiled
│   └── LegacyPage.tsx             # Route /legacy — DOM explosion demo
└── types/
    └── data.ts                    # Strict TypeScript interfaces
```

---

## 🚀 The Performance Stack

### Why Client-Side Rendering (not SSR/Next.js)?

For a 50,000-item list, **hydration is the enemy**. Even with Next.js SSR, the browser must "hydrate" the HTML — for 50k nodes this locks the CPU for seconds. We choose:

```
Vite + React CSR  →  Web Worker  →  Virtualization  →  React.memo
```

### 1. Web Workers (Off-Main-Thread)

The main thread handles **only UI updates**. Heavy work lives in `dataGenerator.worker.ts`:

| Message        | What it does                              | Thread    |
|----------------|-------------------------------------------|-----------|
| `GENERATE`     | Creates 50,000 `ListItemData` objects     | Worker    |
| `SEARCH`       | Filters `cachedData` (worker-scope cache) | Worker    |
| `UPDATE_STATUS`| Toggles status, 10% simulated failure     | Worker    |
| `ROLLBACK`     | Tells UI to revert optimistic update      | → Main    |

### 2. Virtualization (react-window)

Only the **visible rows** exist in the DOM — typically ~12 rows:

```
50,000 items × 64px  =  3,200,000px total scroll height
~12 rows actually rendered  =  <300 DOM nodes
```

### 3. React.memo + Custom Comparator

```ts
const arePropsEqual = (prev, next) =>
  prev.index === next.index &&
  prev.item === next.item &&          // referential equality
  prev.style.top === next.style.top;  // virtualization position check
```

**Row renders only when its own data changes** — not when other rows change.

### 4. Optimistic UI + Rollback

```
User clicks toggle
↓
Immediate UI update (0ms user-perceived latency)
↓
Worker receives UPDATE_STATUS
↓
90% → confirms → updates worker-scope cachedData
10% → rejects  → sends ROLLBACK → hook reverts → Toast shown
```

### 5. Debounced Search

```
Toolbar local state → 300ms debounce → onSearch(query) → Worker SEARCH
```

The typing updates the input instantly (local state in Toolbar). The heavy filtering only runs after 300ms of silence. Main thread stays free.

---

## 🌐 PWA (Progressive Web App)

Configured via `vite-plugin-pwa` + Workbox:

- **Pre-cache**: All `.js`, `.css`, `.html` assets → offline shell available instantly
- **Google Fonts**: `StaleWhileRevalidate` for stylesheets, `CacheFirst` (1 year) for font files
- **Auto-update**: New deployments register seamlessly via `autoUpdate`

**To test offline:** Open DevTools → Network tab → set to "Offline" → refresh. The app shell loads from cache.

---

## 📦 Bundle Analysis

After `npm run build`, open `dist/stats.html` in a browser to see the Rollup treemap:

| Chunk              | Size (gzip) | Role                         |
|--------------------|-------------|------------------------------|
| `index.js`         | ~58 kB      | React core + shared utils    |
| `router.js`        | ~16 kB      | react-router-dom             |
| `virtualize.js`    | ~5 kB       | react-window + auto-sizer    |
| `OptimizedPage.js` | ~2 kB       | Lazy-loaded route chunk      |
| `LegacyPage.js`    | ~1.7 kB     | Lazy-loaded route chunk      |
| `*.worker.js`      | ~2.8 kB     | Isolated Web Worker bundle   |

---

## ✅ "Google Anti-Gravity" Checklist

### 🏎 Performance
- [x] Main thread idle during data generation (Worker handles it)
- [x] Scrolling at 60 FPS (Virtualization — only visible rows rendered)
- [x] Status toggle < 2ms in React Profiler (single-item immutable update)
- [x] Typing does not drop frames (Debounced + Decoupled state in Toolbar)
- [x] DOM nodes < 300 in Optimized Mode / > 150,000 in Legacy Mode

### 🏗 Architecture
- [x] Worker terminates on route navigation (useEffect cleanup)
- [x] `React.memo` with custom `arePropsEqual` comparator
- [x] Optimistic UI: instant status update
- [x] Rollback: 10% failure rate → state reverts → Toast notification
- [x] `react-router-dom` v6 with lazy-loaded page chunks
- [x] TypeScript `strict: true`, zero `any` types

### 🌐 Network
- [x] PWA: offline-capable shell via Workbox pre-cache
- [x] Netlify SPA redirect + security headers in `netlify.toml`
- [x] Bundle visualizer: `dist/stats.html` treemap
- [x] Immutable asset cache headers (1 year) for hashed filenames

### 🎨 UI/UX
- [x] "Obsidian Glass" dark theme (slate-950 + subtle borders + blur)
- [x] Shimmer skeleton rows on initial load (match exact row height)
- [x] Subtle column-header spinner during search (no layout shift)
- [x] Empty state SVG when search returns zero results
- [x] ARIA labels on all inputs, regions, tables, and buttons
- [x] Skip-to-main-content link for keyboard navigation
- [x] Three-way status pills: emerald (active) / amber (pending) / slate (inactive)

---

## 🛠 Running Locally

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production bundle → dist/
npm run preview      # preview production build
```

Open `dist/stats.html` after build to inspect the bundle treemap.

---

## 🚢 Deployment (Netlify)

Already configured via `netlify.toml`:
- SPA redirect (`/*` → `/index.html`)
- Security headers (X-Frame-Options, Referrer-Policy)
- Immutable cache for `/assets/*` (1 year)

```bash
npm run build
# drag dist/ to Netlify, or push to Git + connect repo
```
