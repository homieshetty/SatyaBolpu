import { Model, Schema } from "mongoose";
import { IBlog, ICulture, IEvent, ILocation, IPost, IPostGroup, IPostType, ITag } from "../types/globals.js";
import { Culture } from "../models/Culture.js";
import { PostGroup } from "../models/PostGroup.js";
import { PostType } from "../models/PostType.js";
import { Tag } from "../models/Tag.js";
import { Location } from "../models/Location.js";
import { User } from "../models/User.js";

export const validateDates = (start: Date, end: Date) => {
  return new Date(start) <= new Date(end);
}

const existsInDB = async (id: Schema.Types.ObjectId, model: Model<any>) => {
  return await model.findById(id);
}

const allExistInDb = async (ids: Schema.Types.ObjectId[], model: Model<any>) => {
  const count = await model.countDocuments({
    _id: { $in: ids }
  });

  return count === ids.length;
}

export const validateData = {
  post: {
    details: (post: IPost) =>
      post.title && post.title.length > 5 && post.postGroup && post.postType &&
      post.description && post.description.split(' ').length > 20 &&
      post.coverImage && post.tags.length >= 1,
    content: (post: IPost) =>
      post.content && post.content.split(' ').length > 300
  },
  culture: {
    details: (culture: ICulture) =>
      culture.title && culture.title.length > 5 && culture.description &&
      culture.description.split(' ').length > 20 && culture.coverImage &&
      culture.galleryImages.length >= 15,
    content: (culture: ICulture) =>
      culture.content && culture.content.split(' ').length > 20
  },
  blog: {
    details: (blog: IBlog) =>
      blog.title && blog.title.length > 5,
    content: (blog: IBlog) =>
      blog.content && blog.content.split(' ').length > 20
  },
  event:
    (event: IEvent) =>
      event.title && event.title.length > 5 && event.culture && event.description &&
      event.description.split(' ').length > 20 && event.duration.start && event.duration.end &&
      event.coverImage && event.location,
  location: {
    details: (location: ILocation) =>
      location.name,
    location: (location: ILocation) =>
      location.district && // location.taluk && location.maagane &&
      location.village && location.coordinates?.[0] && location.coordinates?.[1]
  },
  "post-type":
    (postType: IPostType) =>
      postType.name
  ,
  "post-group":
    (postGroup: IPostGroup) =>
      postGroup.name,
  tag:
    (tag: ITag) =>
      tag.name
}

export const validateForeignFields = {
  post: async (post: IPost) => {
    return (
      await existsInDB(post.userId, User) &&
        await existsInDB(post.culture, Culture) &&
        await existsInDB(post.postGroup, PostGroup) &&
        await existsInDB(post.postType, PostType) &&
        await allExistInDb(post.tags, Tag) &&
        post.location ? await existsInDB(post.location, Location) : await Promise.resolve(true)
    )
  },

  culture: async (culture: ICulture) => {
    return await existsInDB(culture.userId, User);
  },

  event: async (event: IEvent) => {
    return (
      await existsInDB(event.userId, User) &&
      await existsInDB(event.culture, Culture) &&
      await existsInDB(event.location, Location)
    )
  },

  location: async (location: ILocation) => {
    return await existsInDB(location.userId, User);
  },

  blog: async (blog: IBlog) => {
    return (
      await existsInDB(blog.userId, User) &&
        blog.location ? await existsInDB(blog.location, Location) : await Promise.resolve(true)
    )
  },

  "post-type": async (_: IPostType) => {
    return await Promise.resolve(true);
  },

  "post-group": async (_: IPostGroup) => {
    return await Promise.resolve(true)
  },

  "tag": async (_: ITag) => {
    return await Promise.resolve(true)
  }
}