import type { ListItemData, WorkerRequest, WorkerResponse } from '../types/data';

// ── Static datasets ───────────────────────────────────────────────────────────
const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer',
    'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara',
    'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia',
    'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez',
    'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const statuses: Array<ListItemData['status']> = ['active', 'inactive', 'pending'];
const bios = [
    'Full-stack engineer specializing in high-performance virtualization systems.',
    'Senior architect with 10+ years experience in distributed React applications.',
    'Performance engineer focused on 60 FPS rendering and main-thread optimization.',
    'Frontend lead passionate about Web Workers and off-thread computation.',
    'TypeScript enthusiast, open-source contributor, and accessibility advocate.',
    'Data visualization expert building enterprise-grade dashboard systems.',
    'Lead developer on ultra-large-scale list virtualization POCs.',
    'UX engineer bridging the gap between design pixels and runtime performance.',
];

// ── Data generator ────────────────────────────────────────────────────────────
const generateData = (count: number): ListItemData[] => {
    const data: ListItemData[] = [];

    for (let i = 0; i < count; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
        const name = `${firstName} ${lastName}`;

        data.push({
            id: i + 1,
            name,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@datagrid.io`,
            status: statuses[i % statuses.length],
            bio: bios[i % bios.length],
            avatar: '',     // generated from initials in the UI layer
        });
    }

    return data;
};

// ── Worker-scoped index map for O(1) lookups ──────────────────────────────────
// We maintain a Map<id, array-index> so status toggles are O(1), not O(n).
let cachedData: ListItemData[] = [];
let indexMap: Map<string | number, number> = new Map();

const rebuildIndex = (data: ListItemData[]) => {
    indexMap = new Map(data.map((item, i) => [item.id, i]));
};

// ── Search ────────────────────────────────────────────────────────────────────
const searchData = (query: string): ListItemData[] => {
    const q = query.trim().toLowerCase();
    if (!q) return cachedData;

    return cachedData.filter(
        (item) =>
            item.name.toLowerCase().includes(q) ||
            item.email.toLowerCase().includes(q) ||
            item.status.toLowerCase().includes(q)
    );
};

// ── Status toggle — O(1) lookup, sends ONLY delta (not full array) ────────────
const toggleStatus = (
    id: string | number,
    nextStatus: ListItemData['status'],
    previousStatus: ListItemData['status'],
): WorkerResponse => {
    // O(1) index lookup instead of findIndex O(n)
    const index = indexMap.get(id);
    if (index === undefined) {
        return { type: 'ROLLBACK', rollbackId: id, rollbackStatus: previousStatus };
    }

    // Simulate 10% network/server failure for rollback demo
    if (Math.random() < 0.1) {
        return { type: 'ROLLBACK', rollbackId: id, rollbackStatus: previousStatus };
    }

    // In-place mutation of cached record (worker owns this memory)
    cachedData[index] = { ...cachedData[index], status: nextStatus };

    // ✅ CRITICAL PERF FIX: return ONLY the delta — not the full 50k array.
    // The main thread already has the optimistic update in place; we just confirm it.
    return {
        type: 'STATUS_CONFIRMED',
        confirmedId: id,
        confirmedStatus: nextStatus,
    };
};

// ── Message handler ───────────────────────────────────────────────────────────
self.onmessage = (event: MessageEvent<WorkerRequest>) => {
    const { type } = event.data;

    if (type === 'GENERATE') {
        try {
            const t0 = performance.now();
            cachedData = generateData(event.data.count);
            rebuildIndex(cachedData);
            const dur = (performance.now() - t0).toFixed(2);
            console.log(`[Worker] Generated ${cachedData.length} items in ${dur}ms + index built (off-main-thread ✓)`);

            const res: WorkerResponse = { type: 'SUCCESS', data: cachedData };
            self.postMessage(res);
        } catch (err) {
            self.postMessage({
                type: 'ERROR',
                message: err instanceof Error ? err.message : 'Unknown error',
            } satisfies WorkerResponse);
        }
        return;
    }

    if (type === 'SEARCH') {
        try {
            const t0 = performance.now();
            const results = searchData(event.data.query);
            const dur = (performance.now() - t0).toFixed(2);
            console.log(`[Worker] Search "${event.data.query}" → ${results.length} hits in ${dur}ms`);

            self.postMessage({ type: 'SUCCESS', data: results } satisfies WorkerResponse);
        } catch (err) {
            self.postMessage({
                type: 'ERROR',
                message: err instanceof Error ? err.message : 'Unknown error',
            } satisfies WorkerResponse);
        }
        return;
    }

    if (type === 'UPDATE_STATUS') {
        const { id, previousStatus, nextStatus } = event.data;
        const response = toggleStatus(id, nextStatus, previousStatus);
        self.postMessage(response);
        return;
    }
};
