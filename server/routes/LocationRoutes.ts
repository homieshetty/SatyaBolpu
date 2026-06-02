import express from "express";
import { getLocation, getLocations } from "../controllers/LocationController.js";

const router = express.Router();

router.get("/", getLocations);
router.get("/:id", getLocation);

export default router;