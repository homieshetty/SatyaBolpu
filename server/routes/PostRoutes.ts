import express from "express";
import { getPost, getPostGroups, getPosts, uploadPost } from "../controllers/PostController.js";
import { adminMiddleware } from "../middleware/AdminMiddleware.js";

const router = express.Router();

router.get("/", getPosts);
router.get("/post-groups", getPostGroups);
router.get("/:id", getPost);
router.post("/", adminMiddleware, uploadPost);

export default router;