import React from 'react';
import { ListItemData } from '../../types/data';
import { CSSProperties } from 'react';

// Define props based on react-window requirements and our data
interface RowProps {
    index: number;
    style: CSSProperties;
    data: ListItemData[];
}

const RowComponent: React.FC<RowProps> = ({ index, style, data }) => {
    // Access the specific item data using the index
    const item = data[index];

    // Safety check in case of index out of bounds (though virtual list handles this usually)
    if (!item) {
        return <div style={style} className="p-4 text-slate-500">Loading...</div>;
    }

    const handleClick = () => {
        console.log(`Clicked Item ID: ${item.id}`);
    };

    return (
        <div style={style} className="px-4 py-2">
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
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br ${
                        item.status === 'active' ? 'from-green-500 to-emerald-700' :
                        item.status === 'pending' ? 'from-amber-400 to-orange-600' :
                        'from-slate-500 to-slate-700'
                    }`}>
                        {item.name.charAt(0)}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                        <p className="text-sm font-semibold text-slate-200 truncate pr-2">
                            {item.name}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                            item.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            item.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                            {item.status}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                        {item.email}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {item.bio}
                    </p>
                </div>
            </div>
        </div>
    );
};

// Custom comparison function for React.memo
const arePropsEqual = (prevProps: RowProps, nextProps: RowProps) => {
    const { style: prevStyle, data: prevData, index: prevIndex } = prevProps;
    const { style: nextStyle, data: nextData, index: nextIndex } = nextProps;

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
    if (prevData === nextData) {
        return true;
    }

    // If data array reference changed, check if the specific item at this index has changed.
    // This allows the Row to skip re-rendering if its specific data is identical 
    // even if other items in the list changed.
    if (prevData[prevIndex] === nextData[nextIndex]) {
        return true;
    }

    return false;
};

export const Row = React.memo(RowComponent, arePropsEqual);
