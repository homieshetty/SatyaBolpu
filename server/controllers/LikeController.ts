import { Request, Response } from 'express';
import { AuthRequest } from '../types/globals.js';
import { Like } from '../models/Like.js';
import { Post } from '../models/Post.js';
import { Blog } from '../models/Blog.js';
import { Event } from '../models/Event.js';
import { Model } from 'mongoose';
import { ModelMap } from '../utils/constants.js';

export const getLikes = async (req: Request, res: Response) => {
  try {
    const { id: entityId, type: entityType } = req.params;
    if (!entityId) {
      return res.status(400).json({ msg: 'Missing field.' });
    }

    const likes = await Like.countDocuments({ entityId, entityType });
    if (!likes) {
      return res.json(200).json({ msg: 'Could not fetch likes.' });
    }
    return res.status(200).json({ likes });
  } catch (err: any) {
    console.error('Error while fetching likes: ', err.message);
    return res
      .status(500)
      .json({ msg: 'Internal server error while fetching likes.' });
  }
};

export const like = async (req: AuthRequest, res: Response) => {
  try {
    const { _id: userId } = req.user;
    const { id: entityId, type: entityType } = req.body;
    if (!userId) {
      return res.status(401).json({ msg: 'Unauthorized.' });
    }

    if (!entityId || !entityType) {
    }

    const liked = Promise.all([
      Like.create({
        userId,
        entityId,
        entityType,
      }),
      (ModelMap[entityType as keyof typeof ModelMap] as Model<any>).updateOne(
        { _id: entityId },
        { $inc: { likes: 1 } },
      ),
    ]);

    if (!liked) {
      return res.json(200).json({ msg: 'Could not like entity.' });
    }

    return res.status(200).json({ status: 'success' });
  } catch (err: any) {
    console.error('Error while liking: ', err.message);
    return res.status(500).json({ msg: 'Internal server error while liking.' });
  }
};

export const dislike = async (req: AuthRequest, res: Response) => {
  try {
    const { _id: userId } = req.user;
    const { id: entityId, type: entityType } = req.body;
    if (!userId) {
      return res.status(401).json({ msg: 'Unauthorized.' });
    }

    if (!entityId || !entityType) {
      return res.status(400).json({ msg: 'Missing field.' });
    }

    const disliked = Promise.all([
      Like.deleteOne({
        userId,
        entityId,
        entityType,
      }),
      (ModelMap[entityType as keyof typeof ModelMap] as Model<any>).updateOne(
        { _id: entityId },
        { $inc: { likes: -1 } },
      ),
    ]);

    if (!disliked) {
      return res.json(200).json({ msg: 'Could not dislike entity.' });
    }

    return res.status(200).json({ status: 'success' });
  } catch (err: any) {
    console.error('Error while disliking: ', err.message);
    return res
      .status(500)
      .json({ msg: 'Internal server error while disliking.' });
  }
};
