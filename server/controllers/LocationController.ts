import { Request, Response } from "express";
import { Location } from "../models/Location.js";
import { Types } from "mongoose";

export const getLocations = async (req: Request, res: Response) => {
  try {
    const fields = req.query.fields?.toString().split(",").join(" ");
    const filterOptions: Record<string, any> = {};

    const districts = req.query.cultures ? req.query.cultures.toString().split(",") : [];
    const taluks = req.query.tags ? req.query.tags.toString().split(",") : [];
    const villages = req.query.villages ? req.query.villages.toString().split(",") : [];

    if (districts.length) filterOptions.culture = { $in: districts.map(district => new Types.ObjectId(district)) }; 
    if (taluks.length) filterOptions.tags = { $in: taluks.map(taluk => new Types.ObjectId(taluk)) };
    if (villages.length) filterOptions.postType = { $in: villages.map(village => new Types.ObjectId(village)) };

    const locations = await Location.find(filterOptions).select(fields ?? "");
    if(!locations) {
      return res.status(404).json({ msg: "Failed to fetch locations." });
    }

    return res.status(200).json({ 
      locations: locations.map(l => ({
        district: l.district,
        taluk: l.taluk,
        maagane: l.maagane,
        village: l.village,
        name: l.name,
        lat: l.coordinates[0],
        lng: l.coordinates[1],
        attachments: l.attachments
      }))
    });
  } catch (err: any) {
    console.error( "Error while fetching locations:", err.message);
    return res.status(500).json({ msg: "Internal Server error while fetching locations." });
  }
}

export const getLocation = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const locationRes = await Location.findById(id)
    if(!locationRes) {
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
        lat: location.coordinates[0],
        lng: location.coordinates[1],
        attachments: location.attachments
      }
    });
  } catch (err: any) {
    console.error( "Error while fetching location:", err.message);
    return res.status(500).json({ msg: "Internal Server error while fetching location." });
  }
}