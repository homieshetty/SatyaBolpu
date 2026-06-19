import mongoose, { Schema, Types } from 'mongoose';
import { IComment } from '../types/globals.js';

const commentSchema = new Schema<IComment>({
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
    enum: ['Post', 'Event', 'Location', 'Event'],
    required: true,
  },
  text: {
    type: String,
    required: true,
    maxLength: 1000,
  },
  parentComment: {
    type: Types.ObjectId,
    ref: 'Comment',
    default: null,
    required: true,
  },
  likes: {
    type: Number,
    required: true,
    default: 0,
  },
  replies: {
    type: Number,
    required: true,
    default: 0,
  },
});

export const Comment = mongoose.model<IComment>('Comment', commentSchema);
