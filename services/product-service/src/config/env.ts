import { z, MongoEnvSchema, RabbitMQEnvSchema, validateEnv } from "@repo/config/env";

const ProductEnvSchema = z.object({
  PRODUCT_PORT: z.string().optional(),
  MONGO_URI: z.string().optional(),
  PRODUCT_MONGO_URI: z.string().optional(),
});

const CombinedSchema = MongoEnvSchema.merge(RabbitMQEnvSchema).merge(ProductEnvSchema);

// Fallbacks for mongo uri logic
const rawEnv = {
  ...process.env,
  MONGO_URI: process.env.PRODUCT_MONGO_URI || process.env.MONGO_URI,
};

export const env = validateEnv(CombinedSchema, rawEnv) as any;
