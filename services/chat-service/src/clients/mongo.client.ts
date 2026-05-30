import { env } from '../config/env.js';
import { MongoClient } from 'mongodb';

let client: MongoClient | null = null;

const mongoUri = env.MONGO_URI;
if (!mongoUri) {
    throw new Error('CHAT_MONGO_URI or MONGO_URI is not defined');
}

export const getMongoClient = async (): Promise<MongoClient> => {
    if (!client) {
        client = new MongoClient(mongoUri);
        await client.connect();
        console.log('MongoDB connection established');
    }
    return client;
};

export const closeMongo = async () => {
    if (client) {
        await client.close();
        client = null;
    }
};
