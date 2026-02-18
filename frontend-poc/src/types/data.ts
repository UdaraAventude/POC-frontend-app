export interface ListItemData {
    id: string | number;
    name: string;
    email: string;
    status: 'active' | 'inactive' | 'pending';
    bio: string;
    avatar: string;
}

export interface VirtualRowData {
    data: ListItemData[];
    updateItemStatus: (id: string | number) => void;
}

export interface WorkerResponse {
    type: 'SUCCESS' | 'ERROR';
    data?: ListItemData[];
    message?: string;
}

export type WorkerRequest =
    | {
          type: 'GENERATE';
          count: number;
      }
    | {
          type: 'SEARCH';
          query: string;
      };
