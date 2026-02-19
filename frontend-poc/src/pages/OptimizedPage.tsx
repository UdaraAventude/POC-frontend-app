import React, { useCallback, useState } from 'react';
import { Profiler } from 'react';
import type { ProfilerOnRenderCallback } from 'react';
import { ListContainer } from '../components/VirtualList/ListContainer';
import { Row } from '../components/ListItem/Row';
import { Toolbar } from '../components/Toolbar';
import { EmptyState } from '../components/EmptyState';
import { ToastContainer } from '../components/ToastContainer';
import { useDataWorker } from '../hooks/useDataWorker';

// ── Skeleton shimmer rows (only on initial load, not search) ──────────────────
const SkeletonRow = ({ index }: { index: number }) => (
    <div className={`flex items-center px-5 h-16 border-b border-slate-800/40 ${index % 2 === 0 ? 'bg-slate-900' : 'bg-[#0c1220]'}`}>
        <div className="flex items-center gap-3 w-1/4 min-w-[180px]">
            <div className="w-7 h-7 rounded-full shimmer flex-shrink-0" />
            <div className="space-y-1.5 min-w-0 flex-1">
                <div className="h-2.5 rounded shimmer w-3/4" />
                <div className="h-2 rounded shimmer w-1/3" />
            </div>
        </div>
        <div className="flex-1 min-w-[200px] pr-4">
            <div className="h-2.5 rounded shimmer w-2/3" />
        </div>
        <div className="w-1/3 hidden lg:block pr-4">
            <div className="h-2 rounded shimmer w-4/5" />
        </div>
        <div className="w-36 flex justify-end">
            <div className="h-5 rounded-full shimmer w-16" />
        </div>
    </div>
);

// ── Column header ─────────────────────────────────────────────────────────────
const TableHeader = ({ isSearching }: { isSearching: boolean }) => (
    <div
        role="row"
        aria-label="Column headers"
        className="flex items-center px-5 py-2.5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm
                   text-[10px] font-mono uppercase tracking-widest text-slate-500 select-none"
    >
        <span className="w-0.5 mr-5 invisible" aria-hidden="true" />
        <div className="flex items-center gap-3 w-1/4 min-w-[180px]">
            <span className="w-7 invisible" aria-hidden="true" />
            <span>Name</span>
        </div>
        <div className="flex-1 min-w-[200px]"><span>Email</span></div>
        <div className="w-1/3 hidden lg:block"><span>Bio</span></div>
        <div className="w-36 flex items-center justify-end gap-2">
            <span>Status</span>
            {/* Subtle searching spinner — only during worker search, not full skeleton */}
            {isSearching && (
                <div
                    className="w-3 h-3 rounded-full border border-indigo-500/40 border-t-indigo-400 animate-spin"
                    aria-label="Searching…"
                    title="Filtering via Web Worker…"
                />
            )}
        </div>
    </div>
);

// ── Optimized Page (route: /) ──────────────────────────────────────────────────
const OptimizedPage: React.FC = () => {
    const {
        data, isLoading, isSearching, error,
        searchData, updateItemStatus,
        toasts, dismissToast,
    } = useDataWorker(50000);

    const [activeQuery, setActiveQuery] = useState('');

    const handleSearch = useCallback(
        (query: string) => { searchData(query); },
        [searchData]
    );

    // Stable reference — useCallback prevents re-creating on each render
    const onRenderCallback = useCallback<ProfilerOnRenderCallback>((id, phase, actualDuration) => {
        if (phase === 'update') {
            const ok = actualDuration < 2;
            const color = ok ? '#34d399' : '#f87171';
            const label = ok ? `✓ ${actualDuration.toFixed(2)}ms — under 2ms goal` : `⚠ ${actualDuration.toFixed(2)}ms — over budget`;
            console.log(`%c[Profiler: ${id}] ${label}`, `color: ${color}; font-weight: bold;`);
        }
    }, []);

    return (
        <>
            <Toolbar
                onSearch={handleSearch}
                onQueryChange={setActiveQuery}
                totalItems={data.length}
            />

            <main id="main-content" className="pt-16 px-4 sm:px-6 pb-6 flex-1 flex flex-col">
                <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col py-4 gap-3">

                    {/* Panel header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-slate-100 tracking-tight">
                                Optimized Virtual List
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Web Worker · react-window · Debounce 300ms · Optimistic UI / Rollback
                            </p>
                        </div>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border
                                         bg-emerald-500/10 text-emerald-400 border-emerald-500/20
                                         text-[10px] font-mono uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                            Optimized Mode
                        </span>
                    </div>

                    {/* Data panel */}
                    <div
                        role="region"
                        aria-label="Data table"
                        className="rounded-xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-md
                                   shadow-[0_20px_60px_rgba(2,6,23,0.6)] overflow-hidden grid-bg flex flex-col"
                        style={{ height: 'calc(100vh - 180px)' }}
                    >
                        {error ? (
                            <div className="flex-1 flex items-center justify-center p-12">
                                <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-6 text-red-300 text-sm max-w-md text-center" role="alert">
                                    <p className="font-medium">Worker Error</p>
                                    <p className="text-red-400/70 text-xs mt-1">{error}</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Column headers — always visible; shows spinner during search */}
                                <TableHeader isSearching={isSearching} />

                                <div
                                    className="flex-1 min-h-0"
                                    role="table"
                                    aria-label="Records table"
                                    aria-rowcount={data.length}
                                    aria-busy={isLoading || isSearching}
                                >
                                    {isLoading ? (
                                        /* Initial generation → full skeleton */
                                        <div aria-label="Generating data" aria-busy="true">
                                            {Array.from({ length: 14 }, (_, i) => (
                                                <SkeletonRow key={i} index={i} />
                                            ))}
                                            <div className="flex items-center justify-center py-5 gap-2 text-slate-600 text-xs font-mono">
                                                <div className="w-4 h-4 rounded-full border-2 border-indigo-500/40 border-t-indigo-400 animate-spin" aria-hidden="true" />
                                                <span>Generating 50,000 records off-main-thread…</span>
                                            </div>
                                        </div>
                                    ) : data.length === 0 && activeQuery ? (
                                        /* Worker returned zero matches */
                                        <EmptyState query={activeQuery} />
                                    ) : (
                                        /* Fully loaded — virtualized, memoized, 60 FPS */
                                        <Profiler id="VirtualList" onRender={onRenderCallback}>
                                            <ListContainer
                                                data={data}
                                                RowComponent={Row}
                                                onUpdateStatus={updateItemStatus}
                                            />
                                        </Profiler>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer metadata strip */}
                    {!isLoading && !error && (
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 px-1">
                            <span>
                                {data.length.toLocaleString()} records · 64px rows · overscan 5 · &lt;300 DOM nodes
                            </span>
                            <span>react-window · Worker · Debounce 300ms · Optimistic UI · PWA</span>
                        </div>
                    )}
                </div>
            </main>

            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </>
    );
};

export default OptimizedPage;
