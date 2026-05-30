import { z, MongoEnvSchema, RedisEnvSchema, validateEnv } from "@repo/config/env";

const ChatEnvSchema = z.object({
  CHAT_PORT: z.string().optional(),
  MONGO_URI: z.string().optional(),
  CHAT_MONGO_URI: z.string().optional(),
  FRONTEND_URL: z.string().url().optional(),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
});

const CombinedSchema = MongoEnvSchema.merge(RedisEnvSchema).merge(ChatEnvSchema);

// Fallbacks for mongo uri logic
const rawEnv = {
  ...process.env,
  MONGO_URI: process.env.CHAT_MONGO_URI || process.env.MONGO_URI,
};

export const env = validateEnv(CombinedSchema, rawEnv) as any;
