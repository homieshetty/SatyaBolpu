import { Request, Response } from "express";
import { Location } from "../models/Location.js";
import { Types } from "mongoose";
import { validateData } from "../utils/validate.js";
import { LocationDraft } from "../models/Draft.js";
import { AuthRequest } from "../types/globals.js";

export const getLocations = async (req: Request, res: Response) => {
  try {
    const fields = req.query.fields?.toString().split(",").join(" ");
    const filterOptions: Record<string, any> = {};

    const districts = req.query.districts ? req.query.districts.toString().split(",") : [];
    const taluks = req.query.taluks ? req.query.taluks.toString().split(",") : [];
    const maaganes = req.query.maaganes ? req.query.maaganes.toString().split(",") : [];
    const villages = req.query.villages ? req.query.villages.toString().split(",") : [];

    if (districts.length) filterOptions.districts = { $in: districts.map(district => new Types.ObjectId(district)) };
    if (taluks.length) filterOptions.taluks = { $in: taluks.map(taluk => new Types.ObjectId(taluk)) };
    if (maaganes.length) filterOptions.maaganes = { $in: maaganes.map(maagane => new Types.ObjectId(maagane)) };
    if (villages.length) filterOptions.villages = { $in: villages.map(village => new Types.ObjectId(village)) };

    const locations = await Location.find(filterOptions).select(fields ?? "");
    if (!locations) {
      return res.status(404).json({ msg: "Failed to fetch locations." });
    }

    return res.status(200).json({
      locations: locations.map(loc => {
        const { _id, ...rest } = loc.toObject();
        return {
          id: _id,
          ...rest
        };
      })
    });
  } catch (err: any) {
    console.error("Error while fetching locations:", err.message);
    return res.status(500).json({ msg: "Internal Server error while fetching locations." });
  }
}

export const getLocation = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const locationRes = await Location.findById(id)
    if (!locationRes) {
      return res.status(404).json({ msg: "Location not found." });
    }

    const location = locationRes.toObject();
    return res.status(200).json({
      location: {
        district: location.district,
        taluk: location.taluk,
        maagane: location.maagane,
        village: location.village,
        name: location.name,
        coordinates: location.coordinates,
        attachments: location.attachments
      }
    });
  } catch (err: any) {
    console.error("Error while fetching location:", err.message);
    return res.status(500).json({ msg: "Internal Server error while fetching location." });
  }
}

export const uploadLocation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { details, location } = req.body;

    const validator = validateData['location'];
    if (!details || !validator['details'](details) || !validator['location'](location)) {
      return res.status(400).json({ msg: "Missing Required Field" });
    }

    const exists = await Location.findOne({ name: details.name });
    if (exists) {
      return res.status(409).json({ msg: `Location '${details.name}' already exists.` });
    }

    const newLocation = await Location.create({
      userId,
      name: details.name,
      type: "Point",
      ...location
    });

    const { _id, __v, ...rest } = newLocation.toObject();
    return res.status(201).json({ location: { id: _id, ...rest } });

  } catch (err: any) {
    console.error("Error while uploading location: ", err.message);
    return res.status(500).json({ msg: "Internal Server error while uploading location." });
  }
};