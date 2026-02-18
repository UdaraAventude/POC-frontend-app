
import { useEffect, useState } from 'react';
import { useDataWorker } from './hooks/useDataWorker'
import { useDebounce } from './hooks/useDebounce'
import { ListContainer } from './components/VirtualList/ListContainer'
import { Row } from './components/ListItem/Row'
import { LegacyList } from './components/LegacyList'
import { Toolbar } from './components/Toolbar'
import { Profiler } from 'react';
import type { ProfilerOnRenderCallback } from 'react';
import './index.css'

function App() {
  const { data, isLoading, error, searchData, updateItemStatus } = useDataWorker(50000);
  const [query, setQuery] = useState('');
  const [isLegacyMode, setIsLegacyMode] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const skeletonRows = Array.from({ length: 7 }, (_, index) => index);

  useEffect(() => {
    searchData(debouncedQuery);
  }, [debouncedQuery, searchData]);

  const onRenderCallback: ProfilerOnRenderCallback = (
    id,
    phase,
    actualDuration
  ) => {
    if (phase === 'update') {
      console.log(`[Profiler: ${id}] Phase: ${phase}`);
      console.log(`Actual Duration: ${actualDuration.toFixed(4)}ms`);

      if (actualDuration < 2) {
        console.log('%c Performance Goal Met! (< 2ms)', 'color: green; font-weight: bold;');
      } else {
        console.warn(`Performance Warning: Render took ${actualDuration.toFixed(4)}ms`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <header className="max-w-7xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent mb-2">
          High-Performance Virtualization POC
        </h1>
        <p className="text-slate-400 text-lg">
          Rendering 50,000 items with React-Window and Web Workers.
        </p>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm relative">
          {/* Metrics Overlay */}
          <div className="absolute top-4 right-4 z-10 bg-black/80 border border-slate-700 p-3 rounded-lg text-xs font-mono shadow-lg backdrop-blur-md">
            <div className="text-slate-400 mb-1">Items in Memory</div>
            <div className="text-emerald-400 font-bold text-lg">{data.length.toLocaleString()}</div>
            <div className="mt-2 text-slate-500">Check Console for Profiler</div>
          </div>

          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
            <h2 className="text-xl font-semibold">Data Stream</h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={isLegacyMode}
                  onChange={(event) => setIsLegacyMode(event.target.checked)}
                  className="h-4 w-4 accent-amber-400"
                />
                Enable Legacy Mode (Caution: Lag)
              </label>
              <div className="text-sm px-3 py-1 bg-primary-500/10 text-primary-400 rounded-full border border-primary-500/20">
                {data.length.toLocaleString()} Items Loaded
              </div>
            </div>
          </div>

          <Toolbar query={query} onQueryChange={setQuery} />

          <div className="h-[600px] w-full bg-slate-900/30">
            {isLoading ? (
              <div className="h-full w-full overflow-hidden">
                {skeletonRows.map((index) => (
                  <div key={index} className="h-[88px] px-4 py-2">
                    <div className="h-full w-full rounded-lg border border-slate-800/80 bg-slate-800/30 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="h-full w-full flex items-center justify-center p-6">
                <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl text-red-400">
                  <p>{error}</p>
                </div>
              </div>
            ) : isLegacyMode ? (
              <LegacyList data={data} onUpdateStatus={updateItemStatus} />
            ) : (
              <Profiler id="VirtualList" onRender={onRenderCallback}>
                <ListContainer
                  data={data}
                  RowComponent={Row}
                  onUpdateStatus={updateItemStatus}
                />
              </Profiler>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
