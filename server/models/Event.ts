import mongoose, { Schema } from "mongoose";
import { IDuration, IEvent } from "../types/globals.js";
import { validateExistence } from "../utils/validate.js";
import { Culture } from "./Culture.js";
import { Location } from "./Location.js";
import { User } from "./User.js";

export const durationSchema = new Schema<IDuration>({
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  }
});

const eventSchema = new Schema<IEvent>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: validateExistence(User)
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
  culture: {
    type: Schema.Types.ObjectId,
    ref: "Culture",
    required: true,
    validate: validateExistence(Culture)
  },
  duration: {
    type: durationSchema,
    required: true
  },
  coverImage: {
    type: String
  },
  files: {
    type: [String]
  },
  location: {
    type: Schema.Types.ObjectId,
    ref: "Location",
    required: true,
    validate: validateExistence(Location)
  }
}, { timestamps: true });

export const Event = mongoose.model<IEvent>("Event", eventSchema);
