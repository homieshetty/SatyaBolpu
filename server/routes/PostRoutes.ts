import express from "express";
import { createDraft, deletePostDetails, deletePostEditorContent, getPost, getPostGroups, getPosts, savePostDetails, savePostEditorContent, uploadPost } from "../controllers/PostController.js";
import { adminMiddleware } from "../middleware/AdminMiddleware.js";

const router = express.Router();

router.get("/", getPosts);
router.get("/post-groups", getPostGroups);
router.get("/:id", getPost);
router.post("/", adminMiddleware, uploadPost);
router.post("/draft/:id", adminMiddleware, createDraft);
router.post("/draft/:id/details", adminMiddleware, savePostDetails);
router.post("/draft/:id/content", adminMiddleware, savePostEditorContent);
router.delete("/draft/:id/details", adminMiddleware, deletePostDetails);
router.delete("/draft/:id/content", adminMiddleware, deletePostEditorContent);

export default router;