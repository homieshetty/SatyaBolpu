import mongoose, { Schema } from "mongoose";
import { IPost } from "../types/globals.js";
import { User } from "./User.js";
import { Culture } from "./Culture.js";
import { PostGroup } from "./PostGroup.js";
import { PostType } from "./PostType.js";
import { Location } from "./Location.js";
import { Tag } from "./Tag.js";
import { validateExistence } from "../utils/validate.js";

const postSchema = new Schema<IPost>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    validate: validateExistence(User)
  },
  title: {
    type: String,
    unique: true,
    minLength: 5,
    required: true
  },
  culture: {
    type: Schema.Types.ObjectId,
    ref: "Culture",
    required: true,
    validate: validateExistence(Culture)
  },
  postGroup: {
    type: Schema.Types.ObjectId,
    ref: "PostGroup",
    required: true,
    validate: validateExistence(PostGroup)
  },
  postType: {
    type: Schema.Types.ObjectId,
    ref: "PostType",
    required: true,
    validate: validateExistence(PostType)
  },
  description: {
    type: String,
    required: true
  },
  tags: {
    type: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    required: true,
    validate:[
      validateExistence(Tag) as any,
      {
        validator: function (val: Schema.Types.ObjectId[]) {
          return val && val.length > 0;
        },
        message: "At least one tag required"
      }
    ]
  },
  coverImage: {
    type: String,
    required: true
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

postSchema.index({ postGroup: 1 });
postSchema.index({ postType: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ location: "2dsphere" });

export const Post = mongoose.model<IPost>("Post" ,postSchema);