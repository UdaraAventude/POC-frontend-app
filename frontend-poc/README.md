# High-Performance React DataGrid — 50,000 Rows

<div align="center">

[![Netlify Status](https://api.netlify.com/api/v1/badges/peppy-mochi-5b3f2d/deploy-status)](https://peppy-mochi-5b3f2d.netlify.app)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-5A0FC8?logo=pwa&logoColor=white)

**[🚀 Live Demo](https://peppy-mochi-5b3f2d.netlify.app)** · **[📦 Repository](https://github.com/UdaraAventude/POC-frontend-app)**

*Client-Side Rendering · Web Workers · Virtualization · Optimistic UI · Progressive Web App*

</div>

---

## 1. The Challenge

Modern web applications — Figma, Notion, internal dashboards — must handle massive client-side datasets without sacrificing responsiveness. A naïve `Array.map()` over 50,000 records causes:

| Problem | Impact |
|---------|--------|
| **Main thread blocking** | Browser freezes during data generation |
| **Input lag** | Typing becomes sluggish due to heavy re-renders |
| **DOM explosion** | >150,000 nodes exhaust browser memory |
| **High INP** | Interaction to Next Paint exceeds 5,000ms |

---

## 2. Architectural Overview

![High-Performance React DataGrid Architecture](./src/assets/react-datagrid-architecture.png)

| Step | Technique | Why It Matters |
|------|-----------|----------------|
| **1 — User Input** | Native DOM event | Zero-cost capture |
| **2 — Debounce** | 300ms delay | Prevents worker spam on every keystroke |
| **3 — Virtualize Scroll** | `react-window` | Only ~20 rows exist in the DOM at any time |
| **4 — startTransition** | React 18 concurrent | Marks search renders as non-urgent; yields to keyboard |
| **5 — Post Message** | `Worker.postMessage()` | Sends query off the main thread |
| **6 — Web Worker** | Dedicated Worker thread | Generates/filters 50k items without blocking the UI |
| **7 — Delta Message** | `STATUS_CONFIRMED {id, status}` | Sends only the changed field — no 50k array clone |
| **8 — Update UI** | `React.memo` + `arePropsEqual` | Only the affected row re-renders |

---

## 3. Performance Metrics

> All Optimized numbers measured on the live Netlify deployment (Chrome, Incognito).

| Metric | 🔴 Legacy Mode | 🟢 Optimized Mode | Improvement |
|--------|---------------|------------------|-------------|
| **DOM Nodes** | 150,000+ | **~180** (constant) | 833× fewer |
| **Scroll FPS** | 5–10 FPS | **60 FPS** | 6–12× smoother |
| **Status Toggle Render** | ~800ms | **< 2ms** | 400× faster |
| **INP** | 5,304ms 🔴 | **48ms** 🟢 | **110× improvement** |
| **LCP** | — | **0.50s** 🟢 | Excellent |
| **CLS** | — | **0.00** 🟢 | Perfect |

---

## 4. Lighthouse Scores

> Tested on live Netlify URL · Chrome · Incognito mode

| Category | Score | Status |
|----------|-------|--------|
| ⚡ Performance | 65 Mobile / ~95 Desktop | 🟠 / 🟢 |
| ♿ Accessibility | **91** | 🟢 |
| ✅ Best Practices | **100** | 🟢 |
| 🔍 SEO | **100** | 🟢 |
| 📱 PWA | **Installable + Offline** | ✅ |

> **Note:** The 65 mobile Performance score is expected — Lighthouse simulates a 4× CPU-throttled mid-range phone. The real-world INP of 48ms and LCP of 0.50s demonstrate excellent actual performance.

---

## 5. Project Structure

```
frontend-poc/
├── public/
│   ├── icons/                       # PWA icons (192px, 512px)
│   └── robots.txt
├── scripts/
│   └── generate-icons.cjs           # Node.js PNG icon generator
├── src/
│   ├── assets/
│   │   └── react-datagrid-architecture.png
│   ├── components/
│   │   ├── ListItem/
│   │   │   └── Row.tsx              # Virtualized row — React.memo + arePropsEqual
│   │   ├── VirtualList/
│   │   │   └── ListContainer.tsx    # react-window + AutoSizer wrapper
│   │   ├── EmptyState.tsx           # Zero-result search state
│   │   ├── LegacyList.tsx           # Non-virtualized baseline (role="list")
│   │   ├── ToastContainer.tsx       # Rollback notification toasts
│   │   └── Toolbar.tsx              # Search + mode toggle + live counters
│   ├── hooks/
│   │   └── useDataWorker.ts         # Worker lifecycle, optimistic UI, toasts
│   ├── pages/
│   │   ├── OptimizedPage.tsx        # Route: /
│   │   └── LegacyPage.tsx           # Route: /legacy
│   ├── types/
│   │   └── data.ts                  # Shared TypeScript interfaces
│   ├── workers/
│   │   └── dataGenerator.worker.ts  # Off-main-thread generation, search, toggle
│   ├── App.tsx                      # Lazy router shell
│   ├── main.tsx
│   └── index.css                    # Tailwind v4 + shimmer + toast animations
├── index.html
├── vite.config.ts                   # PWA, visualizer, manual chunk splits
├── netlify.toml                     # SPA redirects + security headers
└── tailwind.config.js
```

---

## 6. How to Run Locally

```bash
# Clone the repository
git clone https://github.com/UdaraAventude/POC-frontend-app.git
cd POC-frontend-app/frontend-poc

# Install dependencies
npm install

# Start the development server
npm run dev
# → http://localhost:5173

# Build for production
npm run build

# Preview the production build locally (use this for Lighthouse, not npm run dev)
npm run preview
# → http://localhost:4173
```

---

## 7. Performance Demonstrations

### A — React Profiler: Status Toggle < 2ms

1. Open the live URL → **React DevTools → Profiler**
2. Click **Record** → click any row's status pill → **Stop**
3. The flamegraph shows **one small bar** (the toggled row); 49,999 rows are grey
4. Expected commit time: **< 2ms**

### B — Live DOM Node Counter

The Toolbar shows a live DOM node count, refreshed every second:
- **Optimized mode:** `~180` nodes in green (only visible rows rendered)
- **Legacy mode:** `150,000+` nodes in red with pulse animation

### C — INP: 40ms via `startTransition`

1. Open DevTools → **Performance tab → Record**
2. Type `"smith"` quickly in the search box → **Stop**
3. INP interactions show **< 50ms** (green)

**Why it's fast:** Worker search results are wrapped in `startTransition()` — React paints the keyboard input first, then applies the 3,000-row search update as a background task.

### D — Offline Support (PWA)

1. Open the Netlify URL in Chrome
2. DevTools → **Application → Service Workers** — verify `sw.js` is *activated and running*
3. DevTools → **Network** → set dropdown to **Offline**
4. Reload the page → app loads fully from Workbox cache

### E — Install as Desktop App

1. Open `https://peppy-mochi-5b3f2d.netlify.app` in Chrome
2. Look for the **install icon** (⊕) in the address bar
3. Click it → the app installs as a standalone desktop application

---

## 8. Design Decisions

### Why Client-Side Rendering, not SSR?
This is a data-intensive dashboard where the dataset is client-generated. SSR would add hydration cost without any SEO benefit — the data is not publicly indexable.

### Why Web Workers, not `useMemo`?
`useMemo` runs synchronously on the main thread and still blocks the browser. A Worker runs on a separate OS thread — the main thread stays at 60 FPS during generation.

### Why delta messages instead of sending the full array?
Structured-cloning a 50,000-item array takes ~50ms per toggle. By sending only `{ id, newStatus }` on update confirmation, that cost drops to **< 0.1ms** — a 500× reduction.

### Why `startTransition` for search results?
Without it, React treats the incoming search data as an urgent render — blocking the keyboard from updating during a search. `startTransition` makes it interruptible, dropping INP from **5,304ms → 48ms**.

---

## 9. PWA Capabilities

Configured via `vite-plugin-pwa` + Workbox `generateSW`:

| Asset type | Cache Strategy |
|------------|---------------|
| App shell (HTML, JS, CSS) | Pre-cached on install |
| Google Font stylesheets | StaleWhileRevalidate |
| Google Font files | CacheFirst (1 year immutable) |
| Offline fallback | Full app shell from cache |

---

## 10. Deployment

Hosted on **Netlify** (auto-deploys from `main` branch):

```toml
# netlify.toml highlights
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to   = "/index.html"
  status = 200        # SPA routing fix

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "max-age=31536000, immutable"   # 1-year cache for hashed assets
```

---

<div align="center">
<sub>Built as a POC to demonstrate production-grade React performance engineering.</sub>
</div>
