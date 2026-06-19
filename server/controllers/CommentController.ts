import { Response } from 'express';
import { AuthRequest } from '../types/globals.js';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { ModelMap } from '../utils/constants.js';
import { Model } from 'mongoose';

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { _id: userId } = req.user;
    const { text, entityId, entityType, parentComment } = req.body;
    if (!userId) {
      return res.status(401).json({ msg: 'Unauthorized.' });
    }

    if (!text || !parentComment || !entityId || !entityType) {
      return res.status(400).json({ msg: 'Missing required field.' });
    }

    const commented = Promise.all([
      Comment.create({
        userId,
        entityId,
        entityType,
        text,
        parentComment,
      }),
      (ModelMap[entityType as keyof typeof ModelMap] as Model<any>).updateOne(
        { _id: entityId },
        { $inc: { comments: 1 } },
      ),
    ]);

    if (!commented) {
      return res.json(200).json({ msg: 'Could not comment.' });
    }

    if (parentComment !== null) {
      await Comment.updateOne({ _id: parentComment }, { $inc: { replies: 1 } });
    }

    return res.status(200).json({ status: 'success' });
  } catch (err: any) {
    console.error('Error while adding comment: ', err.message);
    return res
      .status(500)
      .json({ msg: 'Internal Server error while adding comment.' });
  }
};
