import { useState, useEffect, useCallback, useRef } from 'react';
import type { ListItemData, WorkerRequest, WorkerResponse } from '../types/data';

export const useDataWorker = (count: number = 50000) => {
    const [data, setData] = useState<ListItemData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const workerRef = useRef<Worker | null>(null);

    const ensureWorker = useCallback(() => {
        if (workerRef.current) {
            return workerRef.current;
        }

        const worker = new Worker(
            new URL('../workers/dataGenerator.worker.ts', import.meta.url),
            { type: 'module' }
        );

        worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
            const { type, data: result, message } = event.data;

            if (type === 'SUCCESS' && result) {
                setData(result);
                setIsLoading(false);
            } else if (type === 'ERROR') {
                setError(message || 'Worker request failed');
                setIsLoading(false);
            }
        };

        worker.onerror = (err) => {
            console.error('[Hook] Worker error:', err);
            setError('Worker initialization failed');
            setIsLoading(false);
        };

        workerRef.current = worker;
        return worker;
    }, []);

    const generateData = useCallback(() => {
        const worker = ensureWorker();
        setIsLoading(true);
        setError(null);

        const request: WorkerRequest = {
            type: 'GENERATE',
            count,
        };

        worker.postMessage(request);
    }, [count, ensureWorker]);

    const searchData = useCallback(
        (query: string) => {
            const worker = ensureWorker();
            setIsLoading(true);
            setError(null);

            const request: WorkerRequest = {
                type: 'SEARCH',
                query,
            };

            worker.postMessage(request);
        },
        [ensureWorker]
    );

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

    return { data, isLoading, error, regenerate: generateData, searchData };
};
