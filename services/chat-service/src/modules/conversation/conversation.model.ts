import { mongoose, Schema, Document, AggregatePaginateModel } from "@repo/database";

export interface IConversation extends Omit<Document, '_id'> {
  _id: string;
  title?: string;
  participantIds: string[];
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    _id: { type: String, required: true },
    title: { 
      type: String, 
      trim: true,
      default: null 
    },
    participantIds: [
      { 
        type: String, 
        required: true
      }
    ],
    lastMessageAt: { 
      type: Date, 
      default: null 
    },
    lastMessagePreview: { 
      type: String, 
      default: null 
    },
  },
  { 
    timestamps: true,
    _id: false, // We are providing our own string _id
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance
conversationSchema.index({ participantIds: 1 });
conversationSchema.index({ lastMessageAt: -1, updatedAt: -1 });

export const ConversationModel = mongoose.model<
  IConversation,
  AggregatePaginateModel<IConversation>
>("Conversation", conversationSchema);
