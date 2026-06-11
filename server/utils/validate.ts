import { Model, Schema } from "mongoose";
import { ICulture, IEvent, ILocation, IPost } from "../types/globals.js";

export const validateExistence = (model: Model<any>) => {
  return {
    validator: async function (value: Schema.Types.ObjectId | Schema.Types.ObjectId[]) {
      if(Array.isArray(value)) {
        const count = await model.countDocuments({
          _id: { $in: value }
        });

        return count === value.length;
      } else {
        await model.exists({ _id: value });
      }
    },
    message: `${model.modelName} does not exist.`
  }
}

export const validateCultureDetails = (culture: ICulture) => {
  return culture.title && culture.description &&
  culture.coverImage && culture.galleryImages.length >= 15;
}

export const validatePostDetails = (post: IPost) => {
  return post.title && post.shortTitle && post.postGroup && post.postType && 
  post.description && post.coverImage && post.tags.length >= 1;
}

export const validateEventData = (event: IEvent) => {
  return event.culture && event.description && event.duration.start &&
  event.duration.end && event.title && event.coverImage && event.location;
}

export const validateLocationDetails = (location: ILocation) => {
  return location.name;
}

export const validateLocationFields = (location: ILocation) => {
  return location.district && // location.taluk && location.maagane &&
  location.village && location.coordinates?.[0] && location.coordinates?.[1]  
}

export const validateLocation = (location: ILocation) => {
  return validateLocationDetails(location) && validateLocationFields(location);
}

export const validateDates = (start: Date, end: Date) => {
  return new Date(start) <= new Date(end); 
}