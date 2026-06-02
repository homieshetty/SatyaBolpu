import { Request, Response } from "express";
import { Post } from "../models/Post.js";


export const getFeed = async (req: Request, res: Response) => {
  try {
    const feed = await Post.aggregate([
      { $project: { createdAt: 1, type: { $literal: 'post' }, doc: '$$ROOT' } },

      {
        $unionWith: {
          coll: 'cultures',
          pipeline: [
            { $project: { createdAt: 1, type: { $literal: 'culture' }, doc: '$$ROOT' } }
          ]
        }
      },

      {
        $unionWith: {
          coll: 'events',
          pipeline: [
            { $project: { createdAt: 1, type: { $literal: 'event' }, doc: '$$ROOT' } }
          ]
        }
      },

      {
        $unionWith: {
          coll: 'blogs',
          pipeline: [
            { $project: { createdAt: 1, type: { $literal: 'blog' }, doc: '$$ROOT' } }
          ]
        }
      },

      { $sort: { createdAt: -1 } },
      { $limit: 5 }
    ]);
    if(!feed) {
      return res.status(500).json({ msg: "Empty feed." });
    }

    return res.status(200).json({ feed });
  } catch (err: any) {
    console.error("Error while fetching feed: ", err.message);
    return res.status(500).json({ msg: "Internal Server error while fetching feed." });
  }
}