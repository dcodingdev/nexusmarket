import { mongoose } from '@repo/database';
import { UserRole } from '@repo/types';

export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId; // ✅ correct type
  email: string;
  password: string;
  name: string;
  role: UserRole;
  isSuspended: boolean;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  shopDetails?: {
    shopName?: string;
    taxId?: string;
    description?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    password: { 
      type: String, 
      required: true, 
      select: false 
    },
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    role: { 
      type: String, 
      enum: Object.values(UserRole), 
      default: UserRole.CUSTOMER 
    },
    isSuspended: {
      type: Boolean,
      default: false
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zip: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    shopDetails: {
      shopName: { type: String, trim: true },
      taxId: { type: String, trim: true },
      description: { type: String, trim: true }
    }
  },
  { 
    timestamps: true
  }
);

// Indexes for search and sort performance
UserSchema.index({ name: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>('User', UserSchema);