// ── Core data shape ──────────────────────────────────────────────────────────
export interface ListItemData {
    id: string | number;
    name: string;
    email: string;
    status: 'active' | 'inactive' | 'pending';
    bio: string;
    avatar: string;
}

// ── Virtual list row data passed via react-window ─────────────────────────────
export interface VirtualRowData {
    data: ListItemData[];
    updateItemStatus: (id: string | number) => void;
}

// ── Worker communication ──────────────────────────────────────────────────────
export interface WorkerResponse {
    type: 'SUCCESS' | 'ERROR' | 'ROLLBACK' | 'STATUS_CONFIRMED';
    data?: ListItemData[];
    message?: string;
    /** For STATUS_CONFIRMED: the single item that changed (avoids 50k transfer) */
    confirmedId?: string | number;
    confirmedStatus?: ListItemData['status'];
    /** ID of the item to roll back when type === 'ROLLBACK' */
    rollbackId?: string | number;
    /** Original status to restore on rollback */
    rollbackStatus?: ListItemData['status'];
}

export type WorkerRequest =
    | { type: 'GENERATE'; count: number }
    | { type: 'SEARCH'; query: string }
    | {
        type: 'UPDATE_STATUS';
        id: string | number;
        /** Current (pre-toggle) status — sent so worker can confirm or rollback */
        previousStatus: ListItemData['status'];
        /** The optimistic status already shown in the UI */
        nextStatus: ListItemData['status'];
    };

// ── Optimistic UI ─────────────────────────────────────────────────────────────
export interface OptimisticUpdate {
    id: string | number;
    previousStatus: ListItemData['status'];
}
