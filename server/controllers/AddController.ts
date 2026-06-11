import { Response } from "express";
import { AuthRequest } from "../types/globals.js";

export const upsert = (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { type, draft = false, data } = req.body;
    if(draft) {

    }

  } catch (err: any) {
    console.error("Upsert Error:", err.message);
    return res.status(500).json({ msg: `Upsert error: ${err.message}` });
  }
}