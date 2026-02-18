
import React from 'react';
import { List } from 'react-window';
import type { RowComponentProps } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import type { ListItemData, VirtualRowData } from '../../types/data';

interface ListContainerProps {
  data: ListItemData[];
  RowComponent: React.ComponentType<RowComponentProps<VirtualRowData>>;
  onUpdateStatus: (id: string | number) => void;
}

export const ListContainer: React.FC<ListContainerProps> = ({ data, RowComponent, onUpdateStatus }) => {
  // We need to pass the update function down via the itemData (which is rowProps in v2)
  // We must memoize this object to prevent unnecessary re-renders of the List
  const rowProps = React.useMemo(() => ({
    data,
    updateItemStatus: onUpdateStatus
  }), [data, onUpdateStatus]);

  const renderRow = React.useCallback(
    (props: RowComponentProps<VirtualRowData>) => <RowComponent {...props} />,
    [RowComponent]
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <AutoSizer
        renderProp={({ height, width }) => {
          if (height == null || width == null) {
            return null;
          }

          return (
            <List
              rowCount={data.length}
              rowHeight={88}
              rowProps={rowProps}
              rowComponent={renderRow}
              overscanCount={5}
              style={{ height, width }}
            />
          );
        }}
      />
    </div>
  );
};
