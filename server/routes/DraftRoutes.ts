import express from "express";
import { moveToDraft, deleteDraft, getDraft, getDrafts, createDraft, updateDraft, removeFromDraft, getDraftType } from "../controllers/DraftController.js";
import { adminMiddleware } from "../middleware/AdminMiddleware.js";

const router = express.Router();

router.get("/", adminMiddleware, getDrafts);
router.post("/", adminMiddleware, createDraft);
router.delete("/:id", adminMiddleware, deleteDraft);
router.get("/:id", adminMiddleware, getDraftType);
router.get("/:type/:id", adminMiddleware, getDraft);
router.patch("/:type/:id", adminMiddleware, moveToDraft);
router.post("/:type/:id/:step", adminMiddleware, updateDraft);
router.delete("/:type/:id/:step", adminMiddleware, removeFromDraft);

export default router;