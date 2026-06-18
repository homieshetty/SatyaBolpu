import { Request, Response } from "express";
import { Post } from "../models/Post.js";
import { Tag } from "../models/Tag.js";
import { AuthRequest } from "../types/globals.js";
import { PostDraft } from "../models/Draft.js";
import { PostGroup } from "../models/PostGroup.js";
import { PostType } from "../models/PostType.js";
import { Types } from "mongoose";
import { Culture } from "../models/Culture.js";
import { Location } from "../models/Location.js";
import { validateData, validateForeignFields } from "../utils/validate.js";

export const getPosts = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy?.toString() ?? "createdAt";
    const orderBy = req.query.orderBy?.toString() ?? "asc";

    const fields = req.query.fields?.toString().split(",").join(" ");

    const cultures = req.query.cultures ? req.query.cultures.toString().split(",") : [];
    const tags = req.query.tags ? req.query.tags.toString().split(",") : [];
    const postTypes = req.query.postTypes ? req.query.postTypes.toString().split(",") : [];

    const filterOptions: Record<string, any> = {};

    if (cultures.length) filterOptions.culture = { $in: cultures.map(c => new Types.ObjectId(c)) }; 
    if (tags.length) filterOptions.tags = { $in: tags.map(tag => new Types.ObjectId(tag)) };
    if (postTypes.length) filterOptions.postType = { $in: postTypes.map(pt => new Types.ObjectId(pt)) };

    let query = Post.find(filterOptions)
      .select(fields ?? "")
      .sort({ [sortBy]: orderBy === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit);

    if(fields?.includes(" userId ")) {
      query  = query.populate('userId');
    }

    const [postsData, total] = await Promise.all([
      query.lean(),
      Post.countDocuments(filterOptions),
    ]);

    const posts = postsData.map(post => {
      const { _id, coverImage, ...rest } = post;

      return {
        ...rest,
        image: coverImage,
        id: _id
      };
    });

    return res.status(200).json({
      posts,
      total,
      totalPages: Math.ceil(total / limit),
    });

  } catch (err: any) {
    console.error("Error while fetching posts: ", err.message);
    return res.status(500).json({ msg: "Internal Server error while fetching posts." });
  }
};

export const getPostGroups = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy?.toString() ?? "createdAt";
    const orderBy = req.query.orderBy === "asc" ? 1 : -1;

    const cultures = req.query.cultures ? req.query.cultures.toString().split(",") : [];
    const tags = req.query.tags ? req.query.tags.toString().split(",") : [];
    const postTypes = req.query.postTypes ? req.query.postTypes.toString().split(",") : [];

    const filterOptions: Record<string, any> = {};

    if (cultures.length) filterOptions.culture = { $in: cultures.map(c => new Types.ObjectId(c)) }; 
    if (tags.length) filterOptions.tags = { $in: tags.map(tag => new Types.ObjectId(tag)) };
    if (postTypes.length) filterOptions.postType = { $in: postTypes.map(pt => new Types.ObjectId(pt)) };

    const data = await PostGroup.aggregate([
      {
        $match: {
          postCount: {
            $gt: 0
          }
        }
      },

      {
        $lookup: {
          from: "posts",
          let: {
            postGroupId: "$_id"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$postGroup", "$$postGroupId"]
                },
                ...filterOptions
              }
            },

            {
              $project: {
                _id: 0,
                id: "$_id",
                title: 1
              }
            },

            {
              $sort: {
                "title": 1
              }
            }

          ],
          as: "posts"
        }
      },

      {
        $match: {
          "posts.0": {
            $exists: true
          }
        }
      },

      {
        $sort: {
          [sortBy]: orderBy
        }
      },

      {
        $facet: {
          data: [
            {
              $skip: skip
            },

            {
              $limit: limit
            }
          ],

          totalCount: [
            {
              $count: "count"
            }
          ]
        }
      }
    ]);

    if (!data) {
      return res.status(500).json({ msg: "No posts found." });
    }

    const postGroups = data[0]?.data;
    const total = data[0]?.totalCount?.[0]?.count ?? 0;

    return res.status(200).json({ postGroups, total, totalPages: Math.ceil(total / limit) });
  } catch (err: any) {
    console.error("Error while fetching posts: ", err.message);
    return res.status(500).json({ msg: "Internal Server error while fetching posts." });
  }
}

export const getPost = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const postRes = await Post
      .findOne({ _id: id })
      .populate("culture")
      .populate("postType")
      .populate("postGroup")
      .populate("tags", "name")
      .populate("location");

    if (!postRes) {
      return res.status(500).json({ msg: "No posts found." });
    }

    const post = postRes.toObject();
    return res.status(200).json({
      post: {
        ...post,
        culture: (post.culture as any).title,
        postGroup: (post.postGroup as any).name,
        postType: (post.postType as any).name,
        tags: post.tags.map((t: any) => t.name)
      }
    });
  } catch (err: any) {
    console.error(`Error while fetching post with id ${req.params.id}: `, err.message);
    return res.status(500).json({ msg: `Internal Server error while fetching post with id ${req.params.id}.` });
  }
}

export const createDraft = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const post = await Post.findById(id).lean();
    if (!post) {
      return res.status(404).json("Post not found.");
    }

    await Post.findByIdAndDelete(id);

    const { _id } = await PostDraft.create({ ...post });
    return res.status(201).json({ _id });

  } catch (err: any) {
    console.error("Error while creating post draft: ", err.message);
    return res.status(500).json({ msg: "Internal Server error while creating post draft." });
  }
}

export const uploadPost = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { details, content } = req.body;
    const validator = validateData['post'];
    if (!details || !validator['details'](details) || !validator['content'](content)) {
      return res.status(400).json({ msg: "Missing Required Field" });
    }

    const exists = await Post.findOne({ title: details.title });
    if(exists) {
      return res.status(409).json({ msg: `Post '${details.title}' already exists.` });
    }

    if(!validateForeignFields['post'](details)) {
      return res.status(400).json("Foreign fields error.");
    }

    const newPost = await Post.create({
      userId,
      ...details,
      content
    });

    await PostGroup.updateOne(
      { _id: newPost.postGroup },
      {
        $inc: {
          postCount: 1
        }
      }
    );

    const { _id, __v, ...rest } = newPost.toObject();
    return res.status(201).json({ post: { id: _id, ...rest } });

  } catch (err: any) {
    console.error("Error while uploading Post: ", err.message);
    return res.status(500).json({ msg: "Internal Server error while uploading post." });
  }
};