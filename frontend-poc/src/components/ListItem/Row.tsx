import React from 'react';
import type { MouseEvent } from 'react';
import type { RowComponentProps } from 'react-window';
import type { VirtualRowData } from '../../types/data';

type RowProps = RowComponentProps<VirtualRowData>;

const getInitials = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
        return '?';
    }

    const parts = trimmed.split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : parts[0]?.[1] ?? '';

    return (first + last).toUpperCase();
};

const getColorFromInitials = (name: string) => {
    let hash = 0;
    for (let index = 0; index < name.length; index += 1) {
        hash = name.charCodeAt(index) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash) % 360;
    return `hsl(${hue} 65% 45%)`;
};

const RowComponent: React.FC<RowProps> = ({ index, style, data, updateItemStatus, ariaAttributes }) => {
    // Access the specific item data using the index
    const item = data[index];

    // Safety check in case of index out of bounds (though virtual list handles this usually)
    if (!item) {
        return <div style={style} className="p-4 text-slate-500">Loading...</div>;
    }

    const handleClick = () => {
        console.log(`Clicked Item ID: ${item.id}`);
    };

    const handleToggleStatus = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        updateItemStatus(item.id);
        console.log(`Toggled Status for Item ID: ${item.id}`);
    };

    const initials = getInitials(item.name);
    const avatarColor = getColorFromInitials(item.name);

    return (
        <div style={style} className="px-4 py-2 box-border" {...ariaAttributes}>
            <div
                onClick={handleClick}
                className="
                    h-full w-full
                    bg-slate-800/40 hover:bg-slate-700/60 
                    border border-slate-700/50 hover:border-primary-500/50 
                    rounded-lg 
                    flex items-center space-x-4 px-4 
                    transition-all duration-200 cursor-pointer shadow-sm
                "
            >
                {/* Avatar Circle */}
                <div className="flex-shrink-0">
                    <div
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: avatarColor }}
                    >
                        {initials}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                        <p className="text-sm font-semibold text-slate-200 truncate pr-2">
                            {item.name}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap ${item.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                item.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                            }`}>
                            {item.status}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                        {item.email}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleToggleStatus}
                    className="rounded-md border border-primary-500/30 bg-primary-500/10 px-3 py-1.5 text-[11px] font-medium text-primary-300 hover:bg-primary-500/20"
                >
                    Toggle Status
                </button>
            </div>
        </div>
    );
};

// Custom comparison function for React.memo
const arePropsEqual = (prevProps: RowProps, nextProps: RowProps) => {
    const { style: prevStyle, data: prevData, index: prevIndex, updateItemStatus: prevUpdateItemStatus } = prevProps;
    const { style: nextStyle, data: nextData, index: nextIndex, updateItemStatus: nextUpdateItemStatus } = nextProps;

    // 1. Index check
    if (prevIndex !== nextIndex) {
        return false;
    }

    // 2. Style check (Shallow comparison)
    // React-window creates new style objects, so reference equality check (prevStyle === nextStyle) 
    // is often false even if values are same. We need shallow comparison.
    // However, for performance, we can just check reference first.
    if (prevStyle !== nextStyle) {
        // Fast shallow check for common properties used in virtualization
        if (
            prevStyle.height !== nextStyle.height ||
            prevStyle.width !== nextStyle.width ||
            prevStyle.top !== nextStyle.top ||
            prevStyle.left !== nextStyle.left
        ) {
            return false;
        }
    }

    // 3. Data check
    // If the data array reference hasn't changed, we don't need to re-render 
    // (assuming immutable updates logic from Dev A).
    if (prevUpdateItemStatus !== nextUpdateItemStatus) {
        return false;
    }

    if (prevData[prevIndex] === nextData[nextIndex]) {
        return true;
    }

    return false;
};

export const Row = React.memo(RowComponent, arePropsEqual);
