import mongoose, { Schema } from "mongoose";
import { ICulture } from "../types/globals.js";

const cultureSchema = new Schema<ICulture>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
    required: true
  },
  galleryImages: {
    type: [String],
    required: true
  },
  files: {
    type: [String],
  },
  content: {
    type: String,
    required: true,
  }
}, { timestamps: true });

export const Culture = mongoose.model<ICulture>("Culture", cultureSchema);
