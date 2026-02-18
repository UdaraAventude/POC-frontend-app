import type { ListItemData, WorkerRequest, WorkerResponse } from '../types/data';

const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const statuses: Array<ListItemData['status']> = ['active', 'inactive', 'pending'];

const generateData = (count: number): ListItemData[] => {
    const data: ListItemData[] = [];

    for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `${firstName} ${lastName}`;

        data.push({
            id: i + 1,
            name,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            bio: `Professional ${lastName} with expertise in modern frontend engineering. Currently working on high-performance virtualization systems.`,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        });
    }

    return data;
};

let cachedData: ListItemData[] = [];

const searchData = (query: string): ListItemData[] => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        return cachedData;
    }

    return cachedData.filter((item) => {
        return (
            item.name.toLowerCase().includes(normalizedQuery) ||
            item.email.toLowerCase().includes(normalizedQuery)
        );
    });
};

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
    const { type } = event.data;

    if (type === 'GENERATE') {
        try {
            const startTime = performance.now();
            const items = generateData(event.data.count);
            cachedData = items;
            const endTime = performance.now();

            console.log(`[Worker] Generated ${items.length} items in ${(endTime - startTime).toFixed(2)}ms`);

            const response: WorkerResponse = {
                type: 'SUCCESS',
                data: items,
            };

            self.postMessage(response);
        } catch (error) {
            const response: WorkerResponse = {
                type: 'ERROR',
                message: error instanceof Error ? error.message : 'Unknown error occurred',
            };
            self.postMessage(response);
        }
    }

    if (type === 'SEARCH') {
        try {
            const startTime = performance.now();
            const results = searchData(event.data.query);
            const endTime = performance.now();

            console.log(`[Worker] Search "${event.data.query}" returned ${results.length} items in ${(endTime - startTime).toFixed(2)}ms`);

            const response: WorkerResponse = {
                type: 'SUCCESS',
                data: results,
            };

            self.postMessage(response);
        } catch (error) {
            const response: WorkerResponse = {
                type: 'ERROR',
                message: error instanceof Error ? error.message : 'Unknown error occurred',
            };
            self.postMessage(response);
        }
    }
};
