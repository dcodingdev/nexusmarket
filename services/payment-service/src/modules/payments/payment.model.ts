import { mongoose, Schema, Document } from "@repo/database";

export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  gateway: "STRIPE" | "PAYPAL";
  transactionId?: string;
  metadata?: Record<string, any>;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
      default: "PENDING",
      index: true
    },
    gateway: { type: String, enum: ["STRIPE", "PAYPAL", "RAZORPAY"], required: true }, // Kept in schema for backwards compatibility with existing DB records
    transactionId: { type: String, unique: true, sparse: true },
    metadata: { type: Object },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);