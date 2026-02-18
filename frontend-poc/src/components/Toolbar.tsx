
import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';

interface ToolbarProps {
    query: string;
    onQueryChange: (value: string) => void;
}

export const Toolbar = ({ query, onQueryChange }: ToolbarProps) => {
    const [domCount, setDomCount] = useState<number>(0);

    useEffect(() => {
        const updateDomCount = () => {
            setDomCount(document.querySelectorAll('*').length);
        };

        const timeoutId = window.setTimeout(updateDomCount, 0);
        const intervalId = window.setInterval(updateDomCount, 1000);

        return () => {
            window.clearTimeout(timeoutId);
            window.clearInterval(intervalId);
        };
    }, []);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        onQueryChange(event.target.value);
    };

    return (
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex-1 w-full sm:w-auto">
                <label htmlFor="search-input" className="sr-only">
                    Search by name or email
                </label>
                <input
                    id="search-input"
                    type="text"
                    value={query}
                    onChange={handleChange}
                    placeholder="Search by name or email..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition-colors focus:border-primary-500"
                />
            </div>

            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-md border border-slate-700 w-full sm:w-auto justify-between sm:justify-start">
                <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">DOM Nodes:</span>
                <span className={`text-sm font-mono font-bold ${domCount > 10000 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                    {domCount.toLocaleString()}
                </span>
            </div>
        </div>
    );
};
