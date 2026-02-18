import type { ChangeEvent } from 'react';

interface ToolbarProps {
    query: string;
    onQueryChange: (value: string) => void;
}

export const Toolbar = ({ query, onQueryChange }: ToolbarProps) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        onQueryChange(event.target.value);
    };

    return (
        <div className="p-4 border-b border-slate-800 bg-slate-900/80">
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
    );
};
