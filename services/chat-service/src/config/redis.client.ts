import { env } from '../config/env.js';
import { Redis } from 'ioredis';

let redis: Redis | null = null;

const redisUrl = env.REDIS_URL;
if (!redisUrl) {
    throw new Error('REDIS_URL is not defined');
}

export const getRedisClient = (): Redis => {
    if (!redis) {
        redis = new Redis(redisUrl, {
            lazyConnect: true,
        });

        redis.on('error', (error: Error) => {
            console.error('Redis connection error', error);
        });

        redis.on('connect', () => {
            console.log('Redis connection established');
        });

        redis.on('reconnect', () => {
            console.log('Redis reconnecting...');
        });

        redis.on('close', () => {
            console.log('Redis connection closed');
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
