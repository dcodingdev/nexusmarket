import { RMQ_NAMES, consumeEvent, RMQEvent } from "@repo/rabbitmq";
import { Product } from "../modules/products/product.model.js";
import { Stock } from "../modules/stock/stock.model.js";
import logger from "@repo/logger";

export const initProductConsumers = async () => {
  const exchange = RMQ_NAMES.getExchange("system", "core", "topic");
  const queueName = "product-service-sync-queue";

  /**
   * 1. USER SYNC: Update vendor names if a user profile changes
   */
  await consumeEvent(exchange, "user.updated", queueName, async (msg: RMQEvent) => {
    const { id, name } = msg.data;
    await Product.updateMany(
      { "vendor.id": id },
      { $set: { "vendor.name": name } }
    );
    logger.info(`Synced vendor name for user ${id}`);
  });

  /**
   * 2. ORDER CREATED: Reserve stock
   */
  await consumeEvent(exchange, "order.created", queueName, async (msg: RMQEvent) => {
    if (msg.data.items && msg.data.items.length > 0) {
      const bulkOps = msg.data.items.map((item: any) => ({
        updateOne: {
          filter: { productId: item.product },
          update: { $inc: { reservedQuantity: item.quantity } }
        }
      }));
      await Stock.bulkWrite(bulkOps);
    }
    logger.info(`Reserved stock for order ${msg.data.orderId}`);
  });

  /**
   * 3. ORDER PAID: Finalize stock (Deduct both physical and reserved)
   */
  await consumeEvent(exchange, "payment.success", queueName, async (msg: RMQEvent) => {
    // In payment.success, we might need to fetch the order details first 
    // or ensure payment.success payload includes items
    if (msg.data.items && msg.data.items.length > 0) {
      const bulkOps = msg.data.items.map((item: any) => ({
        updateOne: {
          filter: { productId: item.product },
          update: {
            $inc: {
              reservedQuantity: -item.quantity,
              quantity: -item.quantity,
            },
          }
        }
      }));
      await Stock.bulkWrite(bulkOps);
      logger.info(`Stock finalized for paid order ${msg.data.orderId}`);
    }
  });

  /**
   * 4. ORDER CANCELLED: Release stock
   */
  await consumeEvent(exchange, "order.cancelled", queueName, async (msg: RMQEvent) => {
    if (msg.data.items && msg.data.items.length > 0) {
      const bulkOps = msg.data.items.map((item: any) => ({
        updateOne: {
          filter: { productId: item.product },
          update: { $inc: { reservedQuantity: -item.quantity } }
        }
      }));
      await Stock.bulkWrite(bulkOps);
    }
    logger.info(`Released reservation for cancelled order ${msg.data.orderId}`);
  });
};