import { z, MongoEnvSchema, RabbitMQEnvSchema, validateEnv } from "@repo/config/env";

const PaymentEnvSchema = z.object({
  PORT: z.string().optional(),
  MONGO_URI: z.string().optional(),
  PAYMENT_MONGO_URI: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  CLIENT_URL: z.string().url().optional(),
});

const CombinedSchema = MongoEnvSchema.merge(RabbitMQEnvSchema).merge(PaymentEnvSchema);

// Fallbacks for mongo uri logic
const rawEnv = {
  ...process.env,
  MONGO_URI: process.env.PAYMENT_MONGO_URI || process.env.MONGO_URI,
};

export const env = validateEnv(CombinedSchema, rawEnv) as any;
