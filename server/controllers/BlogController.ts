import { Request, Response } from "express";
import { Blog } from "../models/Blog.js";

export const getBlogs = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy?.toString() ?? "createdAt";
    const orderBy = req.query.orderBy?.toString() ?? "asc";

    const fields = req.query.fields?.toString().split(",").join(" ");

    let query = Blog.find()
      .select(fields ?? "")
      .sort({ [sortBy]: orderBy === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit);

    if(fields?.includes(" userId ")) {
      query  = query.populate('userId');
    }

    const [blogsData, total] = await Promise.all([
      query,
      Blog.countDocuments(),
    ]);

    const blogs = blogsData.map(d => ({
      id: d._id as string,
      title: d.title,
      image: d.coverImage,
      description: d.description,
    }));

    return res.status(200).json({
      blogs,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    console.error("Error while fetching blogs: ", err.message);
    return res.status(500).json({ msg: "Internal Server error while fetching blogs." });
  }
}

export const getBlog = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ msg: "No blog found." });
    }

    return res.status(200).json({ blog });
  } catch (err: any) {
    console.error("Get blogs Error: " + err.message);
    return res.status(500).json({ msg: "Internal Server Error while fetching blogs." });
  }
}