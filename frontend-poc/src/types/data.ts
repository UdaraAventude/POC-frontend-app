export interface ListItemData {
    id: string | number;
    name: string;
    email: string;
    status: 'active' | 'inactive' | 'pending';
    bio: string;
    avatar: string;
}

export interface WorkerResponse {
    type: 'SUCCESS' | 'ERROR';
    data?: ListItemData[];
    message?: string;
}

export interface WorkerRequest {
    type: 'GENERATE';
    count: number;
}
