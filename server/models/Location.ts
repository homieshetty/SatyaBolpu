import mongoose, { Schema } from "mongoose";
import { ILocation } from "../types/globals.js";

export const locationSchema = new Schema<ILocation>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

export const Location = mongoose.model<ILocation>("Location", locationSchema);