import mongoose, { Schema } from 'mongoose';
import { durationSchema } from './Event.js';
import {
  IBlog,
  ICulture,
  IDraftBase,
  IEvent,
  ILocation,
  IPost,
} from '../types/globals.js';
import { Culture } from './Culture.js';
import { PostGroup } from './PostGroup.js';
import { PostType } from './PostType.js';
import { Tag } from './Tag.js';
import { Location } from './Location.js';
import { User } from './User.js';
import { validateExistence } from '../utils/db.js';

const draftSchema = new Schema<IDraftBase>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      validate: validateExistence(User),
    },
    draftType: {
      type: String,
      enum: ['post', 'culture', 'event', 'location', 'blog'],
      required: true,
    },
  },
  {
    discriminatorKey: 'draftType',
    timestamps: true,
  },
);
export const Draft = mongoose.model<IDraftBase>('Draft', draftSchema);
draftSchema.index({ userId: 1, type: 1 });

export const locationDraftSchema = new Schema<ILocation>(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    name: {
      type: String,
    },
    coordinates: {
      type: [Number],
    },
    district: {
      type: String,
    },
    taluk: {
      type: String,
    },
    maagane: {
      type: String,
    },
    village: {
      type: String,
    },
    attachments: {
      type: [String],
    },
  },
  { timestamps: true },
);
export const LocationDraft = Draft.discriminator<ILocation>(
  'location',
  locationDraftSchema,
);

export const postDraftSchema = new Schema<
  IPost & { locationSpecific: boolean }
>(
  {
    title: {
      type: String,
      minLength: 5,
    },
    culture: {
      type: Schema.Types.ObjectId,
      ref: 'Culture',
      validate: validateExistence(Culture),
    },
    postGroup: {
      type: Schema.Types.ObjectId,
      ref: 'PostGroup',
      validate: validateExistence(PostGroup),
    },
    postType: {
      type: Schema.Types.ObjectId,
      ref: 'PostType',
      validate: validateExistence(PostType),
    },
    description: {
      type: String,
    },
    tags: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
      validate: validateExistence(Tag) as any,
    },
    locationSpecific: {
      type: Boolean,
    },
    coverImage: {
      type: String,
    },
    files: {
      type: [String],
    },
    content: {
      type: String,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      validate: validateExistence(Location),
    },
  },
  { timestamps: true },
);
export const PostDraft = Draft.discriminator<
  IPost & { locationSpecific: boolean }
>('post', postDraftSchema);

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    culture: {
      type: Schema.Types.ObjectId,
      ref: 'Culture',
      validate: validateExistence(Culture),
    },
    duration: {
      type: durationSchema,
    },
    coverImage: {
      type: String,
    },
    files: {
      type: [String],
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      validate: validateExistence(Location),
    },
  },
  { timestamps: true },
);
export const EventDraft = Draft.discriminator<IEvent>('event', eventSchema);

const cultureSchema = new Schema<ICulture>(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    galleryImages: {
      type: [String],
    },
    files: {
      type: [String],
    },
    content: {
      type: String,
    },
  },
  { timestamps: true },
);
export const CultureDraft = Draft.discriminator<ICulture>(
  'culture',
  cultureSchema,
);

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: true,
      minLength: 5,
    },
    description: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    files: {
      type: [String],
    },
    content: {
      type: String,
      required: true,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      validate: validateExistence(Location),
    },
  },
  { timestamps: true },
);

export const BlogDraft = Draft.discriminator<IBlog>('blog', blogSchema);
