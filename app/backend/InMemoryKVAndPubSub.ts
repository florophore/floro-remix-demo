import fs from 'fs';
import path from 'path';

const cacheFile = path.join(__dirname, '..', '.dumb_cache.json')

if (!fs.existsSync(cacheFile)) {
    fs.writeFileSync(cacheFile, JSON.stringify({}), 'utf-8')
}
const initCacheJson = fs.readFileSync(cacheFile, 'utf8');
const initCache = JSON.parse(initCacheJson);


/**
 * Use Redis/Memcached/(equivalent) if you are load balancing your app.
 * This is simply for demoing and is not adequate for production
 * usage or anything beyond a single instance/single threaded demo
 */

export default class InMemoryKVAndPubSub{

    /**
     * PUBSUB API
     */

    private static subscribers: {
        [key: string]: Array<(...args: unknown[]) => void>
    } = {};

    public static subscribe<T extends unknown[]>(key: string, callback: (...args: T) => void): () => void {
        if (!this.subscribers[key]) {
            this.subscribers[key] = [];
        }

        this.subscribers[key].push(callback as (...args: unknown[]) => void);

        // unsubscribe
        return () => {
            const index = this.subscribers[key].indexOf(callback as (...args: unknown[]) => void)
            this.subscribers[key].splice(index, 1);
        }
    }

    public static publish<T extends unknown[]>(key: string, ...args: T) {
        for (const callback of this.subscribers?.[key] ?? []) {
            callback(...args);
        }
    }

    /**
     * CACHE API
     */

    private static cache: {
        [key: string]: string
    } = initCache;

    public static async set(key: string, value: string) {
        this.cache[key] = value;
        await fs.promises.writeFile(cacheFile, JSON.stringify(this.cache, null, 2), 'utf-8')
    }

    public static get(key: string) {
        return this.cache?.[key] ?? null;
    }

    public static async delete(key: string) {
        delete this.cache?.[key];
        await fs.promises.writeFile(cacheFile, JSON.stringify(this.cache, null, 2), 'utf-8')
    }
}