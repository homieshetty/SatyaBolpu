import mongoose, { Schema } from "mongoose";
import { IBlog } from "../types/globals.js";

const blogSchema = new Schema<IBlog>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String
  },
  coverImage: {
    type: String
  },
  files: {
    type: [String]
  },
  content: {
    type: String,
    required: true
  },
  location: {
    type: Schema.Types.ObjectId,
    ref: "Location"
  }
}, { timestamps: true });

export const Blog = mongoose.model<IBlog>("Blog", blogSchema);