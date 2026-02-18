
import { useState, useEffect, useCallback, useRef } from 'react';
import type { ListItemData } from '../types/data';

export const useDataWorker = (count: number = 50000) => {
    const [data, setData] = useState<ListItemData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const workerRef = useRef<Worker | null>(null);

    // Initialize worker
    useEffect(() => {
        workerRef.current = new Worker(
            new URL('../workers/dataGenerator.worker.ts', import.meta.url),
            { type: 'module' }
        );

        workerRef.current.onmessage = (event: MessageEvent) => {
            const { type, data: result, message } = event.data;
            if (type === 'SUCCESS' && result) {
                setData(result);
                setIsLoading(false);
            } else if (type === 'ERROR') {
                setError(message || 'Worker error');
                setIsLoading(false);
            }
        };

        workerRef.current.onerror = (err) => {
            console.error('Worker error:', err);
            setError('Worker initialization failed');
            setIsLoading(false);
        };

        // Initial generation
        workerRef.current.postMessage({ type: 'GENERATE', count });

        return () => {
            workerRef.current?.terminate();
        };
    }, [count]);

    const searchData = useCallback((query: string) => {
        if (workerRef.current) {
            setIsLoading(true);
            workerRef.current.postMessage({ type: 'SEARCH', payload: query });
        }
    }, []);

    // NEW Logic for Dev B: efficiently update a single item
    const updateItemStatus = useCallback((id: string | number) => {
        setData(prevData => {
            // Find index first to avoid mapping if not found (though map is fine for V8 optimization)
            // Using map creates a new array reference, which is what we want for immutability.
            return prevData.map(item => {
                if (item.id === id) {
                    const newStatus = item.status === 'active' ? 'inactive' : 'active';
                    return { ...item, status: newStatus };
                }
                return item;
            });
        });
    }, []);

    return { data, isLoading, error, searchData, updateItemStatus };
};
