import React, { useCallback, useState } from 'react';
import { Toolbar } from '../components/Toolbar';
import { LegacyList } from '../components/LegacyList';
import { EmptyState } from '../components/EmptyState';
import { ToastContainer } from '../components/ToastContainer';
import { useDataWorker } from '../hooks/useDataWorker';

const LegacyPage: React.FC = () => {
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

    return (
        <>
            <Toolbar
                onSearch={handleSearch}
                onQueryChange={setActiveQuery}
                totalItems={data.length}
            />

            <main id="main-content" className="pt-16 px-4 sm:px-6 pb-6 flex-1 flex flex-col">
                <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col py-4 gap-3">

                    <div
                        role="alert"
                        className="flex items-start gap-3 px-4 py-3 rounded-xl border border-red-500/30
                                   bg-red-950/20 backdrop-blur-sm"
                    >
                        <svg
                            className="w-4 h-4 mt-0.5 text-red-400 flex-shrink-0"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                        <div>
                            <p className="text-red-400 text-xs font-semibold">
                                Legacy Mode — No Virtualization
                            </p>
                            <p className="text-red-300/70 text-xs mt-0.5">
                                All 50,000 items are rendered to the DOM simultaneously.
                                Expect &gt;150,000 DOM nodes, visible jank, and high memory pressure.
                                This is intentional — it demonstrates what react-window solves.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-slate-100 tracking-tight">
                                Legacy List — No Virtualization
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Standard .map() · Full DOM · Baseline comparison · Optimistic UI
                            </p>
                        </div>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border
                                         bg-red-500/10 text-red-400 border-red-500/20
                                         text-[10px] font-mono uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" aria-hidden="true" />
                            {isSearching ? 'Filtering…' : 'Legacy Mode'}
                        </span>
                    </div>

                    <div
                        role="region"
                        aria-label="Legacy data records"
                        className="rounded-xl border border-red-900/30 bg-slate-900/40 backdrop-blur-md
                                   shadow-[0_20px_60px_rgba(2,6,23,0.6)] overflow-hidden flex flex-col"
                        style={{ height: 'calc(100vh - 232px)' }}
                    >
                        {error ? (
                            <div className="flex-1 flex items-center justify-center p-12">
                                <div
                                    role="alert"
                                    className="rounded-xl border border-red-500/30 bg-red-950/30
                                               p-6 text-red-300 text-sm max-w-md text-center"
                                >
                                    <p className="font-medium">Worker Error</p>
                                    <p className="text-red-400/70 text-xs mt-1">{error}</p>
                                </div>
                            </div>
                        ) : isLoading ? (
                            <div
                                className="flex-1 flex items-center justify-center gap-3 text-slate-400 text-sm"
                                role="status"
                                aria-label="Generating 50,000 records"
                            >
                                <div className="w-5 h-5 rounded-full border-2 border-red-500/40 border-t-red-400 animate-spin" aria-hidden="true" />
                                <span>Generating 50,000 records…</span>
                            </div>
                        ) : data.length === 0 && activeQuery ? (
                            <EmptyState query={activeQuery} />
                        ) : (
                            <LegacyList data={data} onUpdateStatus={updateItemStatus} />
                        )}
                    </div>

                    {!isLoading && !error && (
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-1">
                            <span>{data.length.toLocaleString()} records · All nodes in DOM · No windowing</span>
                            <span>DOM nodes &gt; 150,000 · Compare with Optimized view →</span>
                        </div>
                    )}
                </div>
            </main>

            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </>
    );
};

export default LegacyPage;
