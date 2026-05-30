import { z } from 'zod';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, '../../../.env');

dotenv.config({ path: rootEnvPath });

export const MongoEnvSchema = z.object({
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
});

export const RabbitMQEnvSchema = z.object({
  RABBITMQ_URL: z.string().min(1, "RABBITMQ_URL is required"),
});

export const RedisEnvSchema = z.object({
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
});

export const BaseServerEnvSchema = z.object({
  PORT: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Validates the given environment variables against the provided schema.
 * Throws an error with details if validation fails.
 */
export const validateEnv = <T extends z.ZodTypeAny>(schema: T, env: unknown): z.infer<T> => {
  const result = schema.safeParse(env);
  if (!result.success) {
    console.error("? Invalid environment variables:", result.error.format());
    throw new Error("Invalid environment variables");
  }
  return result.data;
};

export { z };
