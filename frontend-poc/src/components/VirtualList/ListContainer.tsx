
import React from 'react';
import type { ReactElement } from 'react';
import { List } from 'react-window';
import type { RowComponentProps } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import type { ListItemData } from '../../types/data';

interface ListContainerProps {
  data: ListItemData[];
  RowComponent: (props: RowComponentProps<{ data: ListItemData[] }>) => ReactElement | null;
}

export const ListContainer: React.FC<ListContainerProps> = ({ data, RowComponent }) => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <AutoSizer renderProp={({ height, width }: { height: number | undefined; width: number | undefined }) => {
        if (typeof height !== 'number' || typeof width !== 'number') {
          return null;
        }

        return (
          <List
            style={{ height, width }}
            rowCount={data.length}
            rowHeight={70}
            rowComponent={RowComponent}
            rowProps={{ data }}
            overscanCount={5}
          />
        );
      }} />
    </div>
  );
};
