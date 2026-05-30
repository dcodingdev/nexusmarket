import { logger } from '@repo/logger';
import amqp from 'amqplib';
import type { Channel, ChannelModel, ConsumeMessage, Options } from 'amqplib';

export const RMQ_NAMES = {
  getExchange: (domain: string, service: string, type: 'topic' | 'direct' = 'topic') => 
    `${domain}.${service}.${type}`.toLowerCase(),

  getRoutingKey: (domain: string, entity: string, action: string) => 
    `${domain}.${entity}.${action}`.toLowerCase(),

  getQueue: (domain: string, service: string, action: string, consumer: string) => 
    `${domain}.${service}.${action}.${consumer}`.toLowerCase()
};

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

// Adding a proper type for the event message to fix the 'any' errors
export interface RMQEvent<T = any> {
  event: string;
  data: T;
  meta: {
    messageId: string;
    timestamp: string;
    source: string;
    version: number;
  };
}

export const connectRMQ = async (uri: string, retries = 5, delay = 2000) => {
  if (connection && channel) return { connection, channel };
  
  for (let i = 0; i < retries; i++) {
    try {
      connection = await amqp.connect(uri);
      channel = await connection.createChannel();
      logger.info('🐇 RabbitMQ Connected');
      return { connection, channel };
    } catch (error) {
      if (i === retries - 1) {
        logger.error({ err: error }, '❌ RabbitMQ Connection Failed after max retries');
        throw error;
      }
      logger.warn(`🐇 RabbitMQ Connection Attempt ${i + 1} failed. Retrying in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
      delay *= 1.5; // Exponential backoff
    }
  }
  throw new Error('RabbitMQ Connection Failed');
};


export const publishEvent = async (exchange: string, routingKey: string, payload: any) => {
  if (!channel) throw new Error('RabbitMQ channel not initialized');
  await channel.assertExchange(exchange, 'topic', { durable: true });
  return channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(payload)));
};

/**
 * 📥 NEW: consumeEvent 
 * This was missing from your repo, causing the "Cannot find name" error.
 */
export const consumeEvent = async (
  exchange: string,
  routingKey: string,
  queueName: string,
  onMessage: (msg: RMQEvent) => Promise<void>
) => {
  if (!channel) throw new Error('RabbitMQ channel not initialized');

  await channel.assertExchange(exchange, 'topic', { durable: true });
  const q = await channel.assertQueue(queueName, { durable: true });
  await channel.bindQueue(q.queue, exchange, routingKey);

  channel.consume(q.queue, async (msg: ConsumeMessage | null) => {
    if (msg) {
      try {
        const content: RMQEvent = JSON.parse(msg.content.toString());
        await onMessage(content);
        channel?.ack(msg);
      } catch (error) {
        logger.error({ err: error }, '❌ Error processing RMQ message');
        // Optional: negative ack (requeue: false) to move to DLQ if configured
        channel?.nack(msg, false, false); 
      }
    }
  });
};


export async function stopConsumers() {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    connection = null;
    channel = null;
    logger.info('🛑 RabbitMQ: Connections closed gracefully');
  } catch (error) {
    logger.error({ err: error }, '❌ Error during RabbitMQ shutdown');
  }
}