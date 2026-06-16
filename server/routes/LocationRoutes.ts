import express from "express";
import { getLocation, getLocations, uploadLocation } from "../controllers/LocationController.js";
import { adminMiddleware } from "../middleware/AdminMiddleware.js";

const router = express.Router();

router.get("/", getLocations);
router.get("/:id", getLocation);
router.post("/", adminMiddleware, uploadLocation);

export default router;