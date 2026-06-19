import mongoose, { Schema } from 'mongoose';
import { ICulture } from '../types/globals.js';
import { User } from './User.js';
import { validateExistence } from '../utils/db.js';

const cultureSchema = new Schema<ICulture>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      validate: validateExistence(User),
    },
    title: {
      type: String,
      minLength: 5,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    galleryImages: {
      type: [String],
      required: true,
    },
    files: {
      type: [String],
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const Culture = mongoose.model<ICulture>('Culture', cultureSchema);
