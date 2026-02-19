# High-Performance React DataGrid — 50,000 Rows

**Live Demo:** https://peppy-mochi-5b3f2d.netlify.app  
**Repo:** https://github.com/UdaraAventude/POC-frontend-app

> Client-Side Rendering · Web Workers · Virtualization · Optimistic UI · PWA

---

## 1. The Challenge

Modern web applications (Figma, Notion, internal dashboards) must handle massive client-side datasets without sacrificing responsiveness. A naïve `Array.map()` over 50,000 records causes:

| Problem | Impact |
|---------|--------|
| Main thread blocking | Browser freezes during data generation |
| Input lag | Typing becomes sluggish due to heavy re-renders |
| DOM explosion | >150,000 nodes exhaust browser memory |
| High INP | Interaction to Next Paint exceeds 5,000ms |

---

## 2. Architectural Overview

```
User Input
    │
    ├─ Search → Debounce (300ms) ──────────────────────────────────────────┐
    │                                                                       │
    └─ Scroll → react-window ─── renders only ~20 visible rows             │
                    │                                                       ▼
                    ▼                                           ┌─────────────────────┐
            ┌──────────────────┐                               │   Web Worker Thread  │
            │   Main Thread    │  ◄── STATUS_CONFIRMED delta ─ │  GENERATE / SEARCH  │
            │                  │                               │  UPDATE_STATUS       │
            │  useDataWorker   │ ──── postMessage ───────────► │  O(1) Map<id,index> │
            │  (startTrans.)   │                               └─────────────────────┘
            │  indexMap O(1)   │
            └──────────────────┘
```

**Key decisions:**

| Technique | Why |
|-----------|-----|
| **Web Worker** | All 50k record generation and filtering off the main thread |
| **react-window** | Virtualizes the list — only visible rows exist in the DOM |
| **startTransition** | Marks search result renders as non-urgent, yielding to user input |
| **Optimistic UI** | Status toggles apply instantly; a 10% failure rate triggers rollback |
| **O(1) index Map** | Status updates find the target item without scanning 50k entries |
| **Delta messages** | Worker sends only `{id, status}` on confirm — no full array clone |
| **React.memo** | `arePropsEqual` prevents row re-renders unless its specific item changes |

---

## 3. Performance Metrics

| Metric | 🔴 Legacy Mode | 🟢 Optimized Mode |
|--------|---------------|------------------|
| DOM Nodes | 150,000+ | ~180 (constant) |
| Scroll FPS | 5–10 FPS | 60 FPS |
| Status Toggle Render | ~800ms | < 2ms |
| INP (Interaction to Next Paint) | 5,304ms | **48ms** |
| LCP (Largest Contentful Paint) | — | **0.50s** |
| CLS (Cumulative Layout Shift) | — | **0.00** |
| Memory | 300MB+ | Heap-optimized |

---

## 4. Lighthouse Scores (Desktop)

| Category | Score |
|----------|-------|
| Performance | 65 Mobile / ~95 Desktop |
| Accessibility | 85 |
| Best Practices | **100** |
| SEO | 91 |
| PWA | ✅ Installable + Offline |

---

## 5. Project Structure

```
frontend-poc/
├── public/
│   ├── icons/           # PWA icons (192px, 512px)
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── ListItem/
│   │   │   └── Row.tsx          # Virtualized row (React.memo + arePropsEqual)
│   │   ├── VirtualList/
│   │   │   └── ListContainer.tsx # react-window + AutoSizer wrapper
│   │   ├── EmptyState.tsx        # Zero-result search state
│   │   ├── LegacyList.tsx        # Non-virtualized comparison (role="list")
│   │   ├── ToastContainer.tsx    # Rollback notification toasts
│   │   └── Toolbar.tsx           # Search + mode toggle + live counters
│   ├── hooks/
│   │   └── useDataWorker.ts      # Worker lifecycle, optimistic UI, toasts
│   ├── pages/
│   │   ├── OptimizedPage.tsx     # Route: /
│   │   └── LegacyPage.tsx        # Route: /legacy
│   ├── types/
│   │   └── data.ts               # Shared TypeScript interfaces
│   ├── workers/
│   │   └── dataGenerator.worker.ts # Off-main-thread generation, search, toggle
│   ├── App.tsx                   # Lazy router shell
│   ├── main.tsx
│   └── index.css                 # Tailwind v4 + shimmer + toast animations
├── index.html
├── vite.config.ts
├── netlify.toml
└── tailwind.config.js
```

---

## 6. How to Run Locally

```bash
# Clone
git clone https://github.com/UdaraAventude/POC-frontend-app.git
cd POC-frontend-app/frontend-poc

# Install
npm install

# Dev server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Bundle analysis (opens dist/stats.html)
npx vite-bundle-visualizer
```

---

## 7. Performance Demonstrations

### A — React Profiler: Status Toggle

1. Open the live URL → DevTools → **React DevTools** → **Profiler**
2. Click **Record** → toggle any row's status pill → **Stop**
3. The flamegraph shows **one small bar** (the toggled row) while 49,999 rows are grey

Expected commit time: **< 2ms**

### B — DOM Node Count

The Toolbar displays a live DOM node counter:
- **Optimized mode:** ~180 nodes (only visible rows rendered)
- **Legacy mode:** toggle on — watch the counter climb past 150,000

### C — INP: Interaction to Next Paint

1. DevTools → **Performance** panel → **Record**
2. Type "smith" quickly in the search box → **Stop**
3. INP interactions should show **< 50ms** (green)

This is achieved by wrapping worker search results in `startTransition()` — React yields to the keyboard event first, then applies the data update.

### D — Offline Support (PWA)

1. Open the live Netlify URL in Chrome
2. DevTools → **Network** → set dropdown to **Offline**
3. Refresh the page — the app loads fully from the Workbox cache

---

## 8. Design Decisions

**Why Client-Side Rendering (CSR) not SSR?**  
This is a data-heavy dashboard — the dataset is generated client-side with no server. SSR would add hydration cost without any SEO benefit for private dashboard data.

**Why Web Workers instead of `useMemo`?**  
`useMemo` runs synchronously on the main thread and still blocks the browser during execution. A Worker runs on a separate OS thread — the UI stays interactive at 60 FPS even while generating 50,000 records.

**Why delta messages instead of posting the full array?**  
Structured clone of a 50,000-item array takes ~50ms. By sending only `{id, newStatus}` on update confirmation, that cost drops to **< 0.1ms**.

---

## 9. PWA Capabilities

Configured via `vite-plugin-pwa` + Workbox `generateSW`:

| Asset type | Strategy |
|------------|----------|
| App shell (HTML, JS, CSS) | Pre-cached on install |
| Google Font stylesheets | StaleWhileRevalidate |
| Google Font files | CacheFirst (1 year) |
| Offline fallback | Full app shell served from cache |

---

## 10. Deployment

Hosted on **Netlify** with:
- SPA redirects (`/* → /index.html 200`) for React Router
- `Cache-Control: max-age=31536000, immutable` on all `/assets/*` (content-hashed)
- Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`
