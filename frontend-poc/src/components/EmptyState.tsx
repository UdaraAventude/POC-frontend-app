import React from 'react';

interface EmptyStateProps {
    query: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ query }) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[320px] gap-5 select-none">
        <svg
            width="80" height="80" viewBox="0 0 80 80" fill="none"
            aria-hidden="true"
            className="opacity-30"
        >
            <circle cx="36" cy="36" r="28" stroke="#6366f1" strokeWidth="3" />
            <circle cx="36" cy="36" r="18" fill="#1e293b" />
            <path d="M36 24v12l8 4" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="57" y1="57" x2="70" y2="70" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
            <circle cx="54" cy="18" r="10" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
            <path d="M50 14l8 8M58 14l-8 8" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        </svg>

        <div className="text-center space-y-1" role="status" aria-live="polite">
            <p className="text-slate-300 font-semibold text-base">No results found</p>
            <p className="text-slate-400 text-sm">
                No records match{' '}
                <code className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-indigo-400 text-xs">
                    {query}
                </code>
            </p>
            <p className="text-slate-500 text-xs mt-2">Try a different name, email, or status</p>
        </div>
    </div>
);
