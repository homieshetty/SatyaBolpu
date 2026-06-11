import mongoose, { Schema } from "mongoose";
import { ILocation } from "../types/globals.js";
import { validateExistence } from "../utils/validate.js";
import { User } from "./User.js";

export const locationSchema = new Schema<ILocation>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: validateExistence(User)
  },
  type: {
    type: String,
    enum: ["Point"],
    required: true,
    default: "Point"
  },
  name: {
    type: String,
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  },
  district: {
    type: String,
    required: true
  },
  taluk: {
    type: String,
  },
  maagane: {
    type: String,
  },
  village: {
    type: String,
    required: true
  },
  attachments: {
    type: [String]
  }
}, { timestamps: true });
locationSchema.index({ district: 1 })

export const Location = mongoose.model<ILocation>("Location", locationSchema);