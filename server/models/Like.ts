import mongoose, { Schema, Types } from 'mongoose';
import { ILike } from '../types/globals.js';

export const likeSchema = new Schema<ILike>(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    entityId: {
      type: Types.ObjectId,
      refPath: 'entityType',
      required: true,
    },
    entityType: {
      type: String,
      enum: ['Post', 'Blog', 'Event', 'Location', 'Comment'],
      required: true,
    },
  },
  { timestamps: true },
);

likeSchema.index(
  {
    userId: 1,
    entityId: 1,
    entityType: 1,
  },
  {
    unique: true,
  },
);

export const Like = mongoose.model<ILike>('Like', likeSchema);
