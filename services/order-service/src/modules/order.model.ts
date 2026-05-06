import { mongoose, Schema, Document } from "@repo/database";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  vendor: mongoose.Types.ObjectId;
  quantity: number;
  priceAtPurchase: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
}

// Now 'Document' is recognized as a Type from your repo
export interface IOrder extends Document {
  customer: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  orderStatus: "PENDING" | "PAID" | "COMPLETED" | "CANCELLED";
  paymentId?: mongoose.Types.ObjectId;
}

const orderSchema = new Schema<IOrder>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        vendor: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        quantity: { type: Number, required: true, min: 1 },
        priceAtPurchase: { type: Number, required: true },
        status: {
          type: String,
          enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
          default: "PENDING",
        },
      },
    ],
    totalAmount: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ["PENDING", "PAID", "COMPLETED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

orderSchema.plugin(aggregatePaginate);

export const Order = mongoose.model<IOrder, mongoose.AggregatePaginateModel<IOrder>>(
  "Order", 
  orderSchema
);