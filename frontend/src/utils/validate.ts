import { ICulture, IEvent, IPost } from "../types/globals";

export const validateCultureDetails = (culture: ICulture) => {
  return culture.title && culture.description &&
  culture.coverImage && culture.galleryImages.length >= 15;
}

export const validatePostDetails = (post: IPost) => {
  return post.title && post.shortTitle && post.postGroup && post.postType && 
  post.description && post.coverImage && post.tags.length >= 1;
}

export const validateEventDetails = (event: IEvent) => {
  return event.culture && event.description && event.duration.start &&
  event.duration.end && event.title && event.coverImage;
}