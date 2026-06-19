import { Request } from 'express';
import { Schema, Document } from 'mongoose';

export interface IPhone extends Document {
  dialCode: number;
  number: number;
}

export interface IUser extends Document {
  name: string;
  uname: string;
  email: string;
  phone: IPhone;
  image: string;
  role: 'user' | 'admin';
  verified: boolean;
  password: string;
}

export interface IDraft extends Document {
  userId: Schema.Types.ObjectId;
  draftType: 'post' | 'culture' | 'event' | 'location';
}

export type IDraftBase = IDraft &
  ((IPost & { locationSpecific: boolean }) | ICulture | IEvent | ILocation);

export interface ICulture extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  description: string;
  coverImage: string;
  galleryImages: string[];
  files?: string[];
  content: string;
}

export interface ILocation extends Document {
  userId: Schema.Types.ObjectId;
  type: 'Point';
  name: string;
  district: string;
  taluk: string;
  maagane: string;
  village: string;
  coordinates: number[2];
  attachments: string[];
  likes: number;
  comments: number;
}

export interface IPost extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  culture: Schema.Types.ObjectId;
  postGroup: Schema.Types.ObjectId;
  postType: Schema.Types.ObjectId;
  description: string;
  tags: Schema.Types.ObjectId[];
  coverImage: string;
  files?: string[];
  content: string;
  location?: Schema.Types.ObjectId;
  likes: number;
  comments: number;
}

export interface IDuration extends Document {
  start: Date;
  end: Date;
}

export interface IEvent extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  description: string;
  duration: IDuration;
  culture: Schema.Types.ObjectId;
  coverImage?: string;
  files?: string[];
  location: Schema.Types.ObjectId;
  likes: number;
  comments: number;
}

export interface IBlog extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  description?: string;
  coverImage?: string;
  files?: string;
  content: string;
  location?: Schema.Types.ObjectId;
  likes: number;
  comments: number;
}

export interface ITag extends Document {
  name: string;
}

export interface IPostGroup extends Document {
  name: string;
  postCount: number;
}

export interface IPostType extends Document {
  name: string;
}

export interface ILike extends Document {
  userId: Schema.Types.ObjectId;
  entityId: Schema.Types.ObjectId;
  entityType: 'Post' | 'Blog' | 'Event' | 'Location';
}

export interface IComment extends Document {
  userId: Schema.Types.ObjectId;
  entityId: Schema.Types.ObjectId;
  entityType: 'Post' | 'Blog' | 'Event' | 'Location';
  text: string;
  parentComment: Schema.Types.ObjectId | null;
  likes: number;
  replies: number;
}

export type CardDataType = {
  id: string;
  title: string;
  images?: string[];
  description: string;
};

export interface AuthRequest extends Request {
  user?: any;
}

export type CreateType =
  | 'post'
  | 'culture'
  | 'event'
  | 'blog'
  | 'tag'
  | 'post-type'
  | 'location'
  | 'post-group';
export type CreateData =
  | IPost
  | ICulture
  | IEvent
  | ILocation
  | IBlog
  | ITag
  | IPostGroup
  | IPostType;
