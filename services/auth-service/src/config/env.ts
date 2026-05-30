import { z, MongoEnvSchema, RabbitMQEnvSchema, validateEnv } from "@repo/config/env";

const AuthEnvSchema = z.object({
  AUTH_PORT: z.string().optional(),
  MONGO_URI: z.string().optional(),
  AUTH_MONGO_URI: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  CLIENT_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const CombinedSchema = MongoEnvSchema.merge(RabbitMQEnvSchema).merge(AuthEnvSchema);

// Fallbacks for mongo uri logic
const rawEnv = {
  ...process.env,
  MONGO_URI: process.env.AUTH_MONGO_URI || process.env.MONGO_URI,
};

export const env = validateEnv(CombinedSchema, rawEnv) as any;
