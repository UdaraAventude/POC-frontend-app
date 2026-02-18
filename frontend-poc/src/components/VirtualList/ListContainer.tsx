import React from 'react';
import { List } from 'react-window';
import type { RowComponentProps } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import type { ListItemData } from '../../types/data';

type VirtualRowProps = {
  data: ListItemData[];
};

interface ListContainerProps {
  data: ListItemData[];
  RowComponent: React.ComponentType<RowComponentProps<VirtualRowProps>>;
}

export const ListContainer: React.FC<ListContainerProps> = ({ data, RowComponent }) => {
  const renderRow = React.useCallback(
    (props: RowComponentProps<VirtualRowProps>) => <RowComponent {...props} />,
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
              rowProps={{ data }}
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
