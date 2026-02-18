import React from 'react';
import type { ListItemData } from '../types/data';
import { Row } from './ListItem/Row';

interface LegacyListProps {
    data: ListItemData[];
    onUpdateStatus: (id: string | number) => void;
}

export const LegacyList: React.FC<LegacyListProps> = ({ data, onUpdateStatus }) => {
    return (
        <div className="h-full w-full overflow-auto">
            {data.map((item, index) => (
                <Row
                    key={item.id}
                    index={index}
                    style={{ height: 88 }}
                    data={data}
                    ariaAttributes={{
                        'aria-posinset': index + 1,
                        'aria-setsize': data.length,
                        role: 'listitem',
                    }}
                    updateItemStatus={(id) => onUpdateStatus(id)}
                />
            ))}
        </div>
    );
};
