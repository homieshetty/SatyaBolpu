import mongoose, { Schema } from "mongoose";
import { IBlog } from "../types/globals.js";
import { validateExistence } from "../utils/validate.js";
import { Location } from "./Location.js";
import { User } from "./User.js";

const blogSchema = new Schema<IBlog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: validateExistence(User)
  },
  title: {
    type: String,
    required: true,
    minLength: 5
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
    ref: "Location",
    validate: validateExistence(Location)
  }
}, { timestamps: true });

export const Blog = mongoose.model<IBlog>("Blog", blogSchema);