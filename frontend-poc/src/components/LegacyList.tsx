
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
                <div key={item.id} style={{ height: 88, width: '100%' }}>
                    {/* 
                      Intentionally rendering without virtualization.
                      We pass props directly. Since Row is memoized, we need to be careful.
                      However, rendering 50k items will choke the DOM regardless of memoization.
                    */}
                    <Row
                        index={index}
                        style={{ height: 88, width: '100%' }}
                        data={data}
                        updateItemStatus={onUpdateStatus}
                        ariaAttributes={{
                            role: 'listitem',
                            'aria-posinset': index + 1,
                            'aria-setsize': data.length,
                        }}
                    />
                </div>
            ))}
        </div>
    );
};
