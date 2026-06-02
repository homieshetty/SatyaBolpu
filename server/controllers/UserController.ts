import { Request, Response } from "express";
import { User } from "../models/User.js";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.params.skip) || 10;
    const page = Number(req.params.page) || 1;
    const skip = (page - 1) * limit;
    const fields = req.query.fields?.toString().split(',').join(" ");
    const sortBy = req.query.sortBy?.toString() ?? "name";
    const orderBy = req.query.orderBy?.toString() ?? "asc";

    const usersData = 
      await User
        .find()
        .skip(skip)
        .limit(limit)
        .select(fields ?? "")
        .sort({ [sortBy]: orderBy === "asc" ? 1 : -1 })

    if(!usersData) {
      return res.status(404).json({ msg: "Users not found." });
    }

    const users = usersData.map(data => {
      const { _id, ...rest } = data.toObject();
      return {
        id: _id,
        ...rest
      };
    })

    return res.status(200).json({ users });

  } catch (err: any) {
    console.error("Error while fetching users:", err.message);
    return res.status(500).json({ msg: "Error while fetching users." });
  }
}

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const fields = req.query?.fields?.toString().split(',').join(" ");
    if(!userId) {
      return res.status(404).json({ msg: "User ID required." });
    }

    const userData = await User.findById(userId).select(fields ?? "");
    if(!userData) {
      return res.status(404).json({ msg: "User not found." });
    }

    const { _id, ...rest } = userData.toObject();

    return res.status(200).json({ id: _id, ...rest });
  } catch (err: any) {
    console.error("Error while fetching user:", err.message);
    return res.status(500).json({ msg: "Error while fetching user." });
  }
}