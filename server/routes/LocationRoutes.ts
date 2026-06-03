import express from "express";
import { createDraft, deleteLocation, deleteLocationDetails, getLocation, getLocations, saveLocation, saveLocationDetails, uploadLocation } from "../controllers/LocationController.js";
import { adminMiddleware } from "../middleware/AdminMiddleware.js";

const router = express.Router();

router.get("/", getLocations);
router.get("/:id", getLocation);
router.post("/", adminMiddleware, uploadLocation);
router.post("/draft", adminMiddleware, createDraft);
router.post("/draft/:id/details", adminMiddleware, saveLocationDetails);
router.post("/draft/:id/location", adminMiddleware, saveLocation);
router.delete("/draft/:id/details", adminMiddleware, deleteLocationDetails);
router.delete("/draft/:id/location", adminMiddleware, deleteLocation);

export default router;