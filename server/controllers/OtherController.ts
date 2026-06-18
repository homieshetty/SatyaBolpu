import { Request, Response } from "express";
import { Tag } from "../models/Tag.js";
import { PostType } from "../models/PostType.js";
import { PostGroup } from "../models/PostGroup.js";

export const getTags = async (req: Request, res: Response) => {
  try {
    const sortBy = req.query.sortBy?.toString() ?? "name";
    const orderBy = req.query.orderBy?.toString() ?? "asc";
    const tagsData = 
      await Tag.find({}, "name")
        .collation({ locale: "en", strength: 2 })
        .sort({ [sortBy]: orderBy === "asc" ? 1 : -1 })
        .lean();
    if (!tagsData) {
      res.status(404).json({ msg: "No tags found" });
    }

    const tags = tagsData.map(tag => {
      const { _id, ...rest } = tag;
      return {
        id: _id,
        ...rest
      };
    });

    return res.status(200).json({ tags })
  } catch (err: any) {
    console.error("Error while fetching tags: " + err);
    return res.status(500).json({ msg: "Internal server error while fetching tags" });
  }
}

export const addTag = async (req: Request, res: Response) => {
  try {
    const { name } = req.body?.formData;

    if(!name) {
      return res.status(400).json({ msg: "Missing required field 'tag'" });
    }

    const doesExist = await Tag.findOne({ name });
    if(doesExist) {
      return res.status(400).json({ msg: "Tag already exists" });
    }
  
    const newTag = await Tag.create({ name });
    return res.status(200).json({ name: newTag.name });
  } catch (err: any) {
    console.error(`Error while adding tag : ${err}`);
    return res.status(500).json({ msg: "Internal sever error while adding tag." });
  }
}

export const getPostTypes = async (req: Request, res: Response) => {
  try {
    const sortBy = req.query?.sortBy?.toString() ?? "name";
    const orderBy = req.query?.orderBy?.toString() ?? "asc";

    const postTypesData = 
      await PostType.find({}, "name")
        .collation({ locale: "en", strength: 2 })
        .sort({ [sortBy]: orderBy === "asc" ? 1 : -1 })
        .lean();
    if (!postTypesData) {
      res.status(404).json({ msg: "No post types found." });
    }

    const postTypes = postTypesData.map(postType => {
      const { _id, ...rest } = postType;
      return {
        id: _id,
        ...rest
      };
    });

    return res.status(200).json({ postTypes });
  } catch (err: any) {
    console.error("Error while fetching post types: " + err);
    return res.status(500).json({ msg: "Internal server error while fetching post types." });
  }
}

export const addPostType = async (req: Request, res: Response) => {
  try {
    const { name } = req.body?.formData;

    if(!name) {
      return res.status(400).json({ msg: "Missing required field." });
    }

    const doesExist = await PostType.findOne({ name: name });
    if(doesExist) {
      return res.status(400).json({ msg: "Post type already exists." });
    }
  
    const postType = await PostType.create({ name });
    return res.status(200).json({ name: postType.name });
  } catch (err: any) {
    console.error(`Error while adding post type. : ${err}`);
    return res.status(500).json({ msg: "Internal server error while adding post type." });
  }
}

export const getPostGroups = async (req: Request, res: Response) => {
  try {
    const sortBy = req.query?.sortBy?.toString() ?? "name";
    const orderBy = req.query?.orderBy?.toString() ?? "asc";

    const postGroupsData = 
      await PostGroup.find({}, "name")
        .collation({ locale: "en", strength: 2 })  
        .sort({ [sortBy]: orderBy === "asc" ? 1 : -1 })
        .lean();
    if (!postGroupsData) {
      res.status(404).json({ msg: "No post groups found." });
    }

    const postGroups = postGroupsData.map(postGroup => {
      const { _id, ...rest } = postGroup;
      return {
        id: _id,
        ...rest
      };
    });

    return res.status(200).json({ postGroups });
  } catch (err: any) {
    console.error("Error while fetching post groups: " + err);
    return res.status(500).json({ msg: "Internal server error while fetching post groups." });
  }
}

export const addPostGroup = async (req: Request, res: Response) => {
  try {
    const { name } = req.body?.formData;

    if(!name) {
      return res.status(400).json({ msg: "Missing required field." });
    }

    const doesExist = await PostGroup.findOne({ name: name });
    if(doesExist) {
      return res.status(400).json({ msg: "Post group already exists." });
    }

    const postGroup = await PostGroup.create({ name, postCount: 0 });
    return res.status(200).json({ name: postGroup.name });
  } catch (err: any) {
    console.error(`Error while adding post group. : ${err}`);
    return res.status(500).json({ msg: "Internal server error while adding post group." });
  }
}