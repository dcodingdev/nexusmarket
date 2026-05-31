"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.z = exports.validateEnv = exports.BaseServerEnvSchema = exports.RedisEnvSchema = exports.RabbitMQEnvSchema = exports.MongoEnvSchema = void 0;
var zod_1 = require("zod");
Object.defineProperty(exports, "z", { enumerable: true, get: function () { return zod_1.z; } });
var dotenv = require("dotenv");
var path = require("path");
var url_1 = require("url");
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path.dirname(__filename);
var rootEnvPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: rootEnvPath });
exports.MongoEnvSchema = zod_1.z.object({
    MONGO_URI: zod_1.z.string().min(1, "MONGO_URI is required"),
});
exports.RabbitMQEnvSchema = zod_1.z.object({
    RABBITMQ_URL: zod_1.z.string().min(1, "RABBITMQ_URL is required"),
});
exports.RedisEnvSchema = zod_1.z.object({
    REDIS_URL: zod_1.z.string().min(1, "REDIS_URL is required"),
});
exports.BaseServerEnvSchema = zod_1.z.object({
    PORT: zod_1.z.string().optional(),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
});
/**
 * Validates the given environment variables against the provided schema.
 * Throws an error with details if validation fails.
 */
var validateEnv = function (schema, env) {
    var result = schema.safeParse(env);
    if (!result.success) {
        console.error("? Invalid environment variables:", result.error.format());
        throw new Error("Invalid environment variables");
    }
    return result.data;
};
exports.validateEnv = validateEnv;
