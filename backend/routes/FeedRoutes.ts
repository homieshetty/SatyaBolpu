import express from "express";
import { getFeed } from "../controllers/FeedController.js";

const router = express.Router();

router.get("/", getFeed);

export default router;