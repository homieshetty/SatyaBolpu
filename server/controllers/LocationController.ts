import { Request, Response } from "express";
import { Location } from "../models/Location.js";
import { Types } from "mongoose";
import { validateLocationDetails, validateLocationFields } from "../utils/validate.js";
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

export const createDraft = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const location = (await Location.findById(id))?.toObject();
    if (!location) {
      return res.status(404).json("Location not found.");
    }

    await Location.findByIdAndDelete(id);

    const { _id } = await LocationDraft.create({ ...location });
    return res.status(201).json({ _id });

  } catch (err: any) {
    console.error("Error while creating location draft: ", err.message);
    return res.status(500).json({ msg: "Internal Server error while creating location draft." });
  }
}

export const saveLocationDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { formData: details } = req.body;
    if (!id || !details || !validateLocationDetails(details)) {
      return res.status(400).json({ msg: "Missing required field." });
    }

    const exists = await Location.findOne({ name: details.name });
    if (exists) {
      return res.status(409).json({ msg: `Location '${details.name} already exists.` });
    }

    const draft = await LocationDraft.findByIdAndUpdate(
      id,
      details,
      { new: true }
    );

    const { _id, __v, ...rest } = draft!.toObject();
    return res.status(201).json({ location: { id: _id, ...rest } });

  } catch (err: any) {
    console.error("Error while uploading location:", err.message);
    return res.status(500).json({ msg: "Internal Server error while uploading location." });
  }
}

export const deleteLocationDetails = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ msg: "Missing required field." });
    }

    await LocationDraft.findByIdAndUpdate(
      id,
      {
        $unset: {
          name: ""
        }
      }
    );
    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Error while deleting location details: " + err.message);
    return res.status(500).json({ msg: "Internal Server Error while deleting location details." });
  }
}

export const saveLocation = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { location } = req.body;

    if (!location || !id) {
      return res.status(400).json({ msg: "Missing Required Field" });
    }

    const draft = await LocationDraft.findByIdAndUpdate(
      id,
      {
        type: "Point",
        district: location.district,
        taluk: location.taluk,
        maagane: location.maagane,
        village: location.village,
        coordinates: location.coordinates
      },
      { new: true }
    );

    const { _id, __v, ...rest } = draft!.toObject();
    return res.status(201).json({ location: { id: _id, ...rest } });

  } catch (err: any) {
    console.error("Error while saving location: ", err.message);
    return res.status(500).json({ msg: "Internal Server error while saving location." });
  }
}

export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ msg: "Missing required field." });
    }

    await LocationDraft.findByIdAndUpdate(
      id,
      {
        $unset: {
          type: "",
          district: "",
          taluk: "",
          maagane: "",
          village: "",
          coordinates: ""
        }
      }
    );
    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Error while deleting location: " + err.message);
    return res.status(500).json({ msg: "Internal Server Error while deleting location." });
  }
}

export const uploadLocation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { details, location } = req.body;

    if (!details || !validateLocationDetails(details) || !validateLocationFields(location)) {
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