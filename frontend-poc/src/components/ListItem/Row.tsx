import React from 'react';
import clsx from 'clsx';
import type { RowComponentProps } from 'react-window';
import type { VirtualRowData } from '../../types/data';

type RowProps = RowComponentProps<VirtualRowData>;

const getInitials = (name: string) =>
    name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

const getColorFromInitials = (name: string) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'];
    let hash = 0;

    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
};

const RowComponent: React.FC<RowProps> = ({ index, style, data, updateItemStatus, ariaAttributes }) => {
    const item = data[index];

    if (!item) {
        return (
            <div style={style} className="px-6 py-3 text-slate-500" {...ariaAttributes}>
                Loading...
            </div>
        );
    }

    const isEven = index % 2 === 0;

    // Three-way status styling
    const statusConfig = {
        active: { pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
        inactive: { pill: 'bg-slate-700/30 text-slate-400 border-slate-700', dot: 'bg-slate-500' },
        pending: { pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
    } as const;
    const { pill: statusClasses, dot: dotClass } = statusConfig[item.status] ?? statusConfig.inactive;

    return (
        <div
            style={style}
            className={clsx(
                'flex items-center px-5 border-b border-slate-800/40 transition-all duration-150 group relative',
                'border-l-2 border-l-transparent hover:border-l-indigo-500/60',
                isEven ? 'bg-slate-900' : 'bg-[#0c1220]',
                'hover:bg-slate-800/50'
            )}
            {...ariaAttributes}
        >
            <div className="flex items-center gap-3 w-1/4 min-w-[180px]">
                <div
                    className={clsx(
                        'w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-md',
                        getColorFromInitials(item.name)
                    )}
                >
                    {getInitials(item.name)}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors truncate leading-tight">
                        {item.name}
                    </p>
                    <p className="text-[9px] text-slate-600 font-mono tracking-wider mt-0.5">{item.id.toString().slice(-8)}</p>
                </div>
            </div>

            <div className="flex-1 min-w-[200px] truncate">
                <p className="text-sm text-slate-400 truncate">{item.email}</p>
            </div>

            <div className="w-1/3 hidden lg:block pr-4">
                <p className="text-xs text-slate-500 truncate italic">{item.bio}</p>
            </div>

            <div className="w-36 flex items-center justify-end gap-2.5 flex-shrink-0">
                {/* Status pill with leading dot */}
                <span
                    className={clsx(
                        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border uppercase tracking-wider',
                        statusClasses
                    )}
                >
                    <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', dotClass)} />
                    {item.status}
                </span>
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        updateItemStatus(item.id);
                    }}
                    className="p-1 rounded-md text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Toggle Status"
                    aria-label={`Toggle status for ${item.name}`}
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

const arePropsEqual = (prevProps: RowProps, nextProps: RowProps) => {
    if (prevProps.index !== nextProps.index) {
        return false;
    }

    if (prevProps.updateItemStatus !== nextProps.updateItemStatus) {
        return false;
    }

    const prevItem = prevProps.data[prevProps.index];
    const nextItem = nextProps.data[nextProps.index];

    if (prevItem !== nextItem) {
        return false;
    }

    return prevProps.style.top === nextProps.style.top;
};

export const Row = React.memo(RowComponent, arePropsEqual);
