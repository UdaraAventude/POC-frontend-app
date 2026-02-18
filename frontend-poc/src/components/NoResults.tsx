import React from 'react';

export const NoResults: React.FC = () => {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center text-center px-6">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-slate-800/70 border border-slate-700 mb-4">
                <svg
                    className="h-7 w-7 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" />
                    <path d="M7.5 11h7" />
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-200">No results found</h3>
            <p className="mt-1 text-sm text-slate-500">Try a different search term.</p>
        </div>
    );
};
