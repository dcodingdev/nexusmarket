import { z, MongoEnvSchema, RabbitMQEnvSchema, validateEnv } from "@repo/config/env";

const OrderEnvSchema = z.object({
  PORT: z.string().optional(),
  MONGO_URI: z.string().optional(),
  ORDER_MONGO_URI: z.string().optional(),
});

const CombinedSchema = MongoEnvSchema.merge(RabbitMQEnvSchema).merge(OrderEnvSchema);

// Fallbacks for mongo uri logic
const rawEnv = {
  ...process.env,
  MONGO_URI: process.env.ORDER_MONGO_URI || process.env.MONGO_URI,
};

export const env = validateEnv(CombinedSchema, rawEnv) as any;
