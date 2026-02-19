import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';

interface ToolbarProps {
    onSearch: (query: string) => void;
    onQueryChange: (query: string) => void;
    totalItems: number;
}

export const Toolbar = ({ onSearch, onQueryChange, totalItems }: ToolbarProps) => {
    const [localValue, setLocalValue] = useState('');
    const [domCount, setDomCount] = useState<number>(0);
    const debouncedValue = useDebounce(localValue, 300);

    const navigate = useNavigate();
    const location = useLocation();
    const isLegacy = location.pathname === '/legacy';

    // Fire the search only when debounced value settles
    useEffect(() => {
        onSearch(debouncedValue);
        onQueryChange(debouncedValue);
    }, [debouncedValue, onSearch, onQueryChange]);

    // DOM node counter — updates every second to show the live DOM explosion in Legacy
    useEffect(() => {
        const update = () => setDomCount(document.querySelectorAll('*').length);
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, []);

    const domStatusColor = domCount > 10000
        ? 'text-red-400 animate-pulse'
        : 'text-emerald-400';

    // Toggle between /  (Optimized) and /legacy
    const handleToggle = () => {
        navigate(isLegacy ? '/' : '/legacy');
    };

    return (
        <header
            role="banner"
            className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 h-16 flex items-center justify-between px-4 sm:px-6 shadow-lg"
        >
            {/* ── Left: Logo + Search ──────────────────────────────────────── */}
            <div className="flex items-center gap-3 sm:gap-4">
                {/* Logo mark */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-indigo-500/20 shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1 className="text-slate-100 font-semibold tracking-wide hidden sm:block">
                        DataGrid<span className="text-indigo-400">Pro</span>
                    </h1>
                </div>

                {/* Search input */}
                <div className="relative group">
                    <label htmlFor="global-search" className="sr-only">Search records</label>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
                        <svg
                            className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        id="global-search"
                        type="search"
                        autoComplete="off"
                        className="bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-full
                                   focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
                                   w-52 sm:w-64 pl-10 pr-8 py-2.5 transition-all
                                   placeholder-slate-600 hover:border-slate-600"
                        placeholder="Search 50,000 records…"
                        value={localValue}
                        onChange={(e) => setLocalValue(e.target.value)}
                        aria-label="Search records by name, email or status"
                    />
                    {localValue && (
                        <button
                            type="button"
                            aria-label="Clear search"
                            onClick={() => setLocalValue('')}
                            className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* ── Right: Stats + Legacy Mode toggle ────────────────────────── */}
            <div className="flex items-center gap-4 sm:gap-6">

                {/* Live stats counters */}
                <div className="flex items-center gap-4 sm:gap-5">
                    <div className="flex flex-col items-end text-[10px] font-mono text-slate-400 leading-tight">
                        <span>
                            NODES:{' '}
                            <span className={domStatusColor}>{domCount.toLocaleString()}</span>
                        </span>
                        <span>
                            ITEMS:{' '}
                            <span className="text-slate-100 font-semibold">{totalItems.toLocaleString()}</span>
                        </span>
                    </div>
                </div>

                {/* ── Legacy Mode toggle — inside a dark pill box ──────────── */}
                {/*    Matches the boxed design from the reference screenshot     */}
                <div
                    className={`
                        flex items-center gap-3 px-4 py-2 rounded-xl border
                        bg-[#13172a] transition-all duration-300
                        ${isLegacy
                            ? 'border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                            : 'border-slate-700/60'
                        }
                    `}
                >
                    <span className={`text-xs font-medium whitespace-nowrap transition-colors ${isLegacy ? 'text-red-400' : 'text-slate-400'
                        }`}>
                        Legacy Mode
                    </span>

                    {/* Toggle switch button */}
                    <button
                        type="button"
                        role="switch"
                        aria-checked={isLegacy}
                        aria-label={isLegacy
                            ? 'Switch to Optimized mode (virtualized list)'
                            : 'Switch to Legacy mode (no virtualization — will be slow)'}
                        onClick={handleToggle}
                        className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2
                            transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2
                            focus-visible:ring-offset-2 focus-visible:ring-offset-[#13172a]
                            ${isLegacy
                                ? 'bg-red-500 border-red-500 focus-visible:ring-red-500'
                                : 'bg-slate-600 border-slate-500 focus-visible:ring-indigo-500'
                            }
                        `}
                    >
                        <span className="sr-only">{isLegacy ? 'Legacy mode on' : 'Optimized mode on'}</span>
                        {/* Sliding thumb */}
                        <span
                            aria-hidden="true"
                            className={`
                                pointer-events-none inline-block h-4 w-4 mt-0.5 rounded-full bg-white
                                shadow-md ring-0 transition-transform duration-300 ease-in-out
                                ${isLegacy ? 'translate-x-5' : 'translate-x-0.5'}
                            `}
                        />
                    </button>
                </div>
            </div>
        </header>
    );
};
