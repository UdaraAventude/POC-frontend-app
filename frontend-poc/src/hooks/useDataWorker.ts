import { useState, useEffect, useCallback, useRef, useTransition } from 'react';
import type { ListItemData } from '../types/data';

// ── Toast notification state (no external lib) ────────────────────────────────
export interface Toast {
    id: number;
    message: string;
    variant: 'success' | 'error' | 'warning';
}

let _toastSeq = 0;

// ── Loading phases ────────────────────────────────────────────────────────────
type LoadingPhase = 'idle' | 'initializing' | 'searching';

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useDataWorker = (count: number = 50000) => {
    const [data, setData] = useState<ListItemData[]>([]);
    const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>('initializing');
    const [error, setError] = useState<string | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);

    const workerRef = useRef<Worker | null>(null);
    const indexMapRef = useRef<Map<string | number, number>>(new Map());

    // ── KEY FIX: startTransition marks search result renders as interruptible ──
    // React will yield to user input (typing, clicking) before rendering search
    // results, dropping the INP from ~5000ms → target <200ms.
    const [, startTransition] = useTransition();

    const isLoading = loadingPhase === 'initializing';
    const isSearching = loadingPhase === 'searching';

    // ── Toast helpers ─────────────────────────────────────────────────────────
    const pushToast = useCallback((message: string, variant: Toast['variant']) => {
        const id = ++_toastSeq;
        setToasts((prev) => [...prev, { id, message, variant }]);
        window.setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, []);

    const dismissToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // ── Worker setup ──────────────────────────────────────────────────────────
    useEffect(() => {
        const worker = new Worker(
            new URL('../workers/dataGenerator.worker.ts', import.meta.url),
            { type: 'module' }
        );
        workerRef.current = worker;

        worker.onmessage = (event: MessageEvent) => {
            const {
                type, data: result, message,
                rollbackId, rollbackStatus,
                confirmedId, confirmedStatus,
            } = event.data;

            if (type === 'SUCCESS' && result) {
                // Wrap in startTransition: this render is non-urgent.
                // React will paint any pending user input first, then apply data.
                startTransition(() => {
                    setData(result);
                    setLoadingPhase('idle');
                    indexMapRef.current = new Map(
                        (result as ListItemData[]).map((item: ListItemData, i: number) => [item.id, i])
                    );
                });

            } else if (type === 'STATUS_CONFIRMED') {
                // Confirmed delta: only patch the single changed item (O(1))
                const index = indexMapRef.current.get(confirmedId);
                if (index !== undefined) {
                    setData((prev) => {
                        if (prev[index]?.status === confirmedStatus) return prev;
                        const next = prev.slice();
                        next[index] = { ...next[index], status: confirmedStatus };
                        return next;
                    });
                }

            } else if (type === 'ERROR') {
                setError(message ?? 'Worker error');
                setLoadingPhase('idle');

            } else if (type === 'ROLLBACK') {
                const index = indexMapRef.current.get(rollbackId);
                if (index !== undefined) {
                    setData((prev) => {
                        const next = prev.slice();
                        next[index] = { ...next[index], status: rollbackStatus };
                        return next;
                    });
                }
                pushToast(
                    `Update failed for #${String(rollbackId).slice(-4)} — rolled back automatically.`,
                    'error'
                );
            }
        };

        worker.onerror = (err) => {
            console.error('[useDataWorker] Worker error:', err);
            setError('Worker failed to initialize');
            setLoadingPhase('idle');
        };

        worker.postMessage({ type: 'GENERATE', count });

        return () => {
            console.log('[useDataWorker] Worker terminated → lifecycle clean ✓');
            worker.terminate();
            workerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count]);

    // ── Search ────────────────────────────────────────────────────────────────
    const searchData = useCallback((query: string) => {
        const worker = workerRef.current;
        if (!worker) return;
        setLoadingPhase('searching');
        worker.postMessage({ type: 'SEARCH', query });
    }, []);

    // ── Optimistic status toggle — O(1) via index map ─────────────────────────
    const updateItemStatus = useCallback((id: string | number) => {
        const index = indexMapRef.current.get(id);
        if (index === undefined) return;

        setData((prev) => {
            const item = prev[index];
            if (!item) return prev;

            const prevStatus = item.status;
            const nextStatus: ListItemData['status'] = prevStatus === 'active' ? 'inactive' : 'active';

            const next = prev.slice();            // O(n) shallow clone but native speed
            next[index] = { ...item, status: nextStatus };

            workerRef.current?.postMessage({
                type: 'UPDATE_STATUS',
                id,
                previousStatus: prevStatus,
                nextStatus,
            });

            return next;
        });
    }, []);

    return {
        data,
        isLoading,
        isSearching,
        error,
        searchData,
        updateItemStatus,
        toasts,
        dismissToast,
    };
};
