import mongoose, { Schema } from "mongoose";
import { ILocation } from "../types/globals.js";

export const locationSchema = new Schema<ILocation>({
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
    required: true
  },
  maagane: {
    type: String,
    required: true
  },
  village: {
    type: String,
    required: true
  },
  attachments: {
    type: [String]
  }
}, { _id: false });

export const Location = mongoose.model<ILocation>("Location", locationSchema);