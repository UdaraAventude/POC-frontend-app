import { useState, useEffect, useCallback, useRef } from 'react';
import type { ListItemData, WorkerRequest, WorkerResponse } from '../types/data';

export const useDataWorker = (count: number = 50000) => {
    const [data, setData] = useState<ListItemData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const workerRef = useRef<Worker | null>(null);

    const generateData = useCallback(() => {
        if (workerRef.current) {
            workerRef.current.terminate();
        }

        setIsLoading(true);
        setError(null);

        // Initialize the worker using Vite's worker support
        // Note: In Vite, we should use new URL(...) for worker instantiation
        const worker = new Worker(
            new URL('../workers/dataGenerator.worker.ts', import.meta.url),
            { type: 'module' }
        );

        workerRef.current = worker;

        worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
            const { type, data: result, message } = event.data;

            if (type === 'SUCCESS' && result) {
                setData(result);
                setIsLoading(false);
            } else if (type === 'ERROR') {
                setError(message || 'Failed to generate data');
                setIsLoading(false);
            }

            // We can terminate after single generation if it's a one-off task,
            // but usually we keep it for the lifecycle if needed.
            // For this POC, we'll keep it available until unmount.
        };

        worker.onerror = (err) => {
            console.error('[Hook] Worker error:', err);
            setError('Worker initialization failed');
            setIsLoading(false);
        };

        const request: WorkerRequest = {
            type: 'GENERATE',
            count,
        };

        worker.postMessage(request);
    }, [count]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            generateData();
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
            if (workerRef.current) {
                console.log('[Hook] Terminating worker on unmount');
                workerRef.current.terminate();
            }
        };
    }, [generateData]);

    return { data, isLoading, error, regenerate: generateData };
};
