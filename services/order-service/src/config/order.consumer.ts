import { consumeEvent, RMQ_NAMES, RMQEvent } from "@repo/rabbitmq";
import { Order } from "../modules/order.model.js"; // Adjust path as needed
import axios from "axios";
import logger from "@repo/logger";

const STOCK_SERVICE_URL = process.env.STOCK_SERVICE_URL || "http://product-service:4002/api/stock";

export const initOrderConsumers = async () => {
  const queueName = "order-service-queue";
  const exchange = RMQ_NAMES.getExchange("payment", "payment", "topic");

  // Fixes the 'Parameter msg implicitly has any type' error by using RMQEvent
  await consumeEvent(exchange, "payment.success", queueName, async (msg: RMQEvent) => {
    try {
      const { orderId, paymentId } = msg.data;

      const order = await Order.findByIdAndUpdate(
        orderId,
        { orderStatus: "PAID", paymentId },
        { new: true }
      );

      if (order && order.items.length > 0) {
        const batchItems = order.items.map((item: any) => ({
          productId: item.product,
          amount: item.quantity,
        }));
        await axios.post(`${STOCK_SERVICE_URL}/batch/confirm`, { items: batchItems });
      }
    } catch (error) {
      logger.error({ err: error }, "Error processing payment.success");
    }
  });
};