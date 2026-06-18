import { Request, Response } from "express";
import { Culture } from "../models/Culture.js";
import { AuthRequest } from "../types/globals.js";
import { validateData } from "../utils/validate.js";

export const getCultures = async (req: Request, res: Response) => {
  try {
    const fields = req.query?.fields?.toString().split(",").join(" ");
    const sortBy = req.query?.sortBy?.toString() ?? "title";
    const orderBy = req.query?.orderBy?.toString() ?? "asc";

    let query = 
      Culture
        .find()
        .select(fields ?? "")
        .sort({ [sortBy]: orderBy === "asc" ? 1 : -1 });

    if(fields?.includes(" userId ")) {
      query = query.populate('userId');
    }
    const culturesData = await Promise.resolve(query.lean());
    if (!culturesData) {
      return res.status(404).json({ msg: "No cultures found." });
    }

    const cultures = culturesData.map(culture => {
      const { _id, ...rest } = culture;

      return {
        ...rest,
        id: _id
      };
    });

    return res.status(200).json({ cultures });
  } catch (err: any) {
    console.error("Get Cultures Error: " + err.message);
    return res.status(500).json({ msg: "Internal Server Error while fetching cultures." });
  }
}

export const getCulture = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const culture = await Culture.findById(id);
    if (!culture) {
      return res.status(404).json({ msg: "No culture found." });
    }

    return res.status(200).json({ culture });
  } catch (err: any) {
    console.error("Get Cultures Error: " + err.message);
    return res.status(500).json({ msg: "Internal Server Error while fetching cultures." });
  }
}

export const uploadCulture = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { details, content } = req.body;
    const validator = validateData['culture'];
    if (!details || !validator['details'](details) || !validator['content'](content)) {
      return res.status(400).json({ msg: "Missing required field." });
    }

    const exists = await Culture.findOne({ title: details.title });
    if (exists) {
      return res.status(409).json({ msg: `Culture '${details.title}' already exists.` })
    }

    const newCulture = await Culture.create({
      userId,
      ...details,
      content: content,
      posts: 0
    });
    const { _id, __v, ...rest } = newCulture.toObject();
    return res.status(201).json({ culture: { id: _id, ...rest } });

  } catch (err: any) {
    console.error("Upload Cultures Error: " + err.message);
    return res.status(500).json({ msg: "Internal Server Error while uploading culture." });
  }
}
