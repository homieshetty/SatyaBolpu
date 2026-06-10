import { ICulture, ILocation, IPost } from "../types/globals";

export const validateCultureDetails = (culture: ICulture) => {
  return culture.title && culture.description &&
  culture.coverImage && culture.galleryImages.length >= 15;
}

export const validatePostDetails = (post: IPost) => {
  return post.title && post.shortTitle && post.postGroup && post.postType && 
  post.description && post.coverImage && post.tags.length >= 1 && post.location;
}

export const validateLocationDetails = (location: ILocation) => {
  return location.name; 
}

export const validateLocationFields = (location: ILocation) => {
  return location.district && //location.taluk && location.maagane &&
   location.village && location.coordinates?.[0] && location.coordinates?.[1];
}

export const validateLocation = (location: ILocation) => {
  return validateLocationDetails(location) && validateLocationFields(location);
}