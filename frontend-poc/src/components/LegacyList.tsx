
import React from 'react';
import type { ListItemData } from '../types/data';

interface LegacyListProps {
    data: ListItemData[];
    onUpdateStatus: (id: string | number) => void;
}

// ── Memoized single-item row wrapper ─────────────────────────────────────────
// Even in Legacy mode (where the DOM explodes) we can avoid cascading
// re-renders: each LegacyRow only re-renders when ITS item reference changes.
interface LegacyRowProps {
    item: ListItemData;
    index: number;
    onUpdateStatus: (id: string | number) => void;
}

const getInitials = (name: string) =>
    name.split(' ').map((p) => p[0]).join('').substring(0, 2).toUpperCase();

const getColor = (name: string) => {
    const palette = [
        'bg-blue-500', 'bg-purple-500', 'bg-pink-500',
        'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
    ];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return palette[Math.abs(h) % palette.length];
};

const statusConfig = {
    active: { pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
    inactive: { pill: 'bg-slate-700/30 text-slate-400 border-slate-700', dot: 'bg-slate-500' },
    pending: { pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
} as const;

const LegacyRow = React.memo<LegacyRowProps>(({ item, index, onUpdateStatus }) => {
    const isEven = index % 2 === 0;
    const { pill, dot } = statusConfig[item.status] ?? statusConfig.inactive;

    return (
        <div
            style={{ height: 64, width: '100%' }}
            className={`flex items-center px-5 border-b border-slate-800/40 group
                        border-l-2 border-l-transparent hover:border-l-red-500/40
                        transition-all duration-150 ${isEven ? 'bg-slate-900' : 'bg-[#0c1220]'}
                        hover:bg-slate-800/40`}
            role="listitem"
            aria-label={`${item.name}, ${item.email}, status: ${item.status}`}
        >
            {/* Avatar */}
            <div className="flex items-center gap-3 w-1/4 min-w-[180px]">
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center
                                 text-[10px] font-bold text-white shadow-md ${getColor(item.name)}`}>
                    {getInitials(item.name)}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors truncate leading-tight">
                        {item.name}
                    </p>
                    <p className="text-[9px] text-slate-600 font-mono tracking-wider mt-0.5">
                        {item.id.toString().slice(-8)}
                    </p>
                </div>
            </div>

            {/* Email */}
            <div className="flex-1 min-w-[200px] truncate">
                <p className="text-sm text-slate-400 truncate">{item.email}</p>
            </div>

            {/* Bio */}
            <div className="w-1/3 hidden lg:block pr-4">
                <p className="text-xs text-slate-500 truncate italic">{item.bio}</p>
            </div>

            {/* Status + toggle */}
            <div className="w-36 flex items-center justify-end gap-2.5 flex-shrink-0">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full
                                  text-[10px] font-medium border uppercase tracking-wider ${pill}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                    {item.status}
                </span>
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onUpdateStatus(item.id); }}
                    className="p-1 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-500/10
                               transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Toggle Status"
                    aria-label={`Toggle status for ${item.name}`}
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>
        </div>
    );
}, (prev, next) =>
    prev.item === next.item &&
    prev.index === next.index &&
    prev.onUpdateStatus === next.onUpdateStatus
);

LegacyRow.displayName = 'LegacyRow';

// ── Legacy List container ─────────────────────────────────────────────────────
export const LegacyList: React.FC<LegacyListProps> = ({ data, onUpdateStatus }) => {
    return (
        <div
            className="h-full w-full overflow-auto"
            role="list"
            aria-label="Legacy record list — no virtualization"
        >
            {data.map((item, index) => (
                <LegacyRow
                    key={item.id}
                    item={item}
                    index={index}
                    onUpdateStatus={onUpdateStatus}
                />
            ))}
        </div>
    );
};
