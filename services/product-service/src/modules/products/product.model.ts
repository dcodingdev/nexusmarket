
import { mongoose, Schema, Document, AggregatePaginateModel } from "@repo/database";

export interface IProduct extends Document {
  name: string;
  description: string;
  category: string;

  vendor: {
    id: mongoose.Types.ObjectId;
    name: string;
  };

  mainImage: { url: string; localPath: string };
  subImages: { url: string; localPath: string }[];

  price: number;
  discountPrice?: number;

  isAvailable: boolean;
  isDraft: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, index: true },

    description: { type: String, required: true },

    category: { 
      type: String, 
      required: true, 
      index: true 
    },


    // ✅ Vendor snapshot (decoupled from auth-service)
    vendor: {
      id: { 
        type: Schema.Types.ObjectId, 
        required: true, 
        index: true 
      },
      name: { 
        type: String, 
        required: true 
      }
    },

    mainImage: {
      url: { type: String, required: true },
      localPath: { type: String, required: true },
    },

    subImages: [
      { 
        url: { type: String, required: true }, 
        localPath: { type: String, required: true } 
      },
    ],

    price: { 
      type: Number, 
      default: 0, 
      min: 0 
    },


    isAvailable: { type: Boolean, default: true },
    isDraft: { type: Boolean, default: false },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/**
 * Indexes for performance
 */
productSchema.index({ price: 1 });
productSchema.index({ isDraft: 1 });
productSchema.index({ createdAt: -1 });

export const Product = mongoose.model<
  IProduct,
  AggregatePaginateModel<IProduct>
>("Product", productSchema);