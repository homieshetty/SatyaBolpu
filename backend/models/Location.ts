import mongoose, { Schema } from "mongoose";
import { ILocation } from "../types/globals.js";

export const locationSchema = new Schema<ILocation>({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
    default: "Point"
  },

  coordinates: {
    type: [Number],
    required: true
  },

  district: {
    type: String,
    required: true
  },
  taluk: String,
  village: {
    type: String,
    required: true
  }
}, { _id: false });

export const Location = mongoose.model<ILocation>("Location", locationSchema);