import { Event } from '../models/Event.js';
import { Post } from '../models/Post.js';
import { Culture } from '../models/Culture.js';
import { Location } from '../models/Location.js';
import { Blog } from '../models/Blog.js';
import {
  BlogDraft,
  CultureDraft,
  LocationDraft,
  PostDraft,
} from '../models/Draft.js';
import { Comment } from '../models/Comment.js';

export const ModelMap = {
  post: Post,
  event: Event,
  culture: Culture,
  location: Location,
  blog: Blog,
  comment: Comment,
};

export const DraftModelMap = {
  post: PostDraft,
  culture: CultureDraft,
  location: LocationDraft,
  blog: BlogDraft,
};
