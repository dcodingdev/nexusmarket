import { mongoose, Schema, Document, AggregatePaginateModel } from "@repo/database";

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    product: { 
      type: Schema.Types.ObjectId, 
      ref: "Product", 
      required: true, 
      index: true 
    },
    customer: { 
      type: Schema.Types.ObjectId, 
      required: true, 
      index: true 
    },
    rating: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 5 
    },
    comment: { 
      type: String, 
      required: true, 
      trim: true 
    },
    isVerified: { 
      type: Boolean, 
      default: false 
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance
reviewSchema.index({ createdAt: -1 });

export const Review = mongoose.model<IReview, AggregatePaginateModel<IReview>>(
  "Review",
  reviewSchema
);
