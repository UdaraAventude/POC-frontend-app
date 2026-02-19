import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Code-split both pages so each route is its own chunk
const OptimizedPage = lazy(() => import('./pages/OptimizedPage'));
const LegacyPage = lazy(() => import('./pages/LegacyPage'));

// Route-level loading fallback
const PageShell = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center" aria-busy="true" aria-label="Loading page">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500/40 border-t-indigo-400 animate-spin" aria-hidden="true" />
      <p className="text-xs text-slate-500 font-mono">Loading…</p>
    </div>
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Suspense fallback={<PageShell />}>
        <Routes>
          <Route path="/" element={<OptimizedPage />} />
          <Route path="/legacy" element={<LegacyPage />} />
          {/* Catch-all → redirect to optimized view */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
