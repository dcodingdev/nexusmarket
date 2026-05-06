import { Redis } from 'ioredis';

let redis: Redis | null = null;

export const getRedisClient = (): Redis => {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
        throw new Error('REDIS_URL is not defined');
    }

    if (!redis) {
        redis = new Redis(redisUrl, {
            lazyConnect: true,
            maxRetriesPerRequest: null,
            family: 4,
        });

        redis.on('error', (error: Error) => {
            console.error('Redis connection error', error);
        });

        redis.on('connect', () => {
            console.log('Redis connection established');
        });
    }

    return redis;
};

export const connectRedis = async () => {
    const client = getRedisClient();
    if (client.status === 'ready' || client.status === 'connecting') {
        return;
    }
    await client.connect();
};

export const closeRedis = async () => {
    if (!redis) return;
    await redis.quit();
    redis = null;
};
