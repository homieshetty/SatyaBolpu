import { Request, Response} from "express";
import { Event } from "../models/Event.js";
import { AuthRequest, IEvent } from "../types/globals.js";
import { Culture } from "../models/Culture.js";
import { EventDraft } from "../models/Draft.js";
import { Types } from "mongoose";
import { Location } from "../models/Location.js";
import { validateDates, validateEventDetails, validateLocation } from "../utils/validate.js";

export const getEvents = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy?.toString() ?? "createdAt";
    const orderBy = req.query.orderBy?.toString() ?? "asc";

    const fields = req.query.fields?.toString().split(",").join(" ");
    const cultures = req.query.cultures ? req.query.cultures.toString().split(",") : [];

    const filterOptions: Record<string, any> = {};
    if (cultures.length) filterOptions.culture = { $in: cultures.map(c => new Types.ObjectId(c)) }; 

    let query = 
      Event
        .find(filterOptions)
        .select(fields ?? "")
        .sort({ [sortBy]: orderBy === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit);

    if(fields?.includes(" userId ")) {
      query  = query.populate('userId');
    }

    const [eventsData, total] = await Promise.all([
      query,
      Event.countDocuments(filterOptions),
    ]);

    const events = eventsData.map(event => {
      const { _id, ...rest } = event.toObject();

      return {
        ...rest,
        id: _id
      };
    });

    if (!events) {
      return res.status(500).json({ msg: "No events found." });
    }

    return res.status(200).json({ events, total, totalPages: Math.ceil(total / limit) });
  } catch(err: any) {
    console.error("Get Events Error: " + err.message);
    return res.status(500).json({ msg: "Internal Server Error while fetching events." });
  }
}

export const getEvent = async (req: Request, res: Response) => {
  try {
    let { id } = req.params;
    const event: IEvent | null = await Event.findOne({ _id: id }).populate("culture", "title").populate("loaction");
    if(!event) {
      return res.status(404).json({ msg: "No event found." });
    }

    return res.status(200).json({ event : { 
      ...event,  
      culture: (event.culture as any).title,
      duration: {
        start: event.duration.start.toISOString().split("T")[0],
        end: event.duration.end.toISOString().split("T")[0]
      }
    }});
  } catch(err: any) {
    console.error("Get Events Error: " + err.message);
    return res.status(500).json({ msg: "Internal Server Error while fetching events." });
  }
}

export const saveEventDetails = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { formData: details } = req.body;
    if (!id || !details || !validateEventDetails(details)) {
      return res.status(400).json({ msg: "Missing required field." });
    }

    if(!validateDates(details.start, details.end)) {
      return res.status(500).json({ msg: "Start date cant be after end date." });
    }

    const exists = await Event.findOne({ title: details.title });
    if (exists) {
      return res.status(409).json({ msg: `Event '${details.title}' already exists.` })
    }

    const culture = await Culture.findById(details.culture);
    if(!culture) {
      return res.status(400).json({ msg: "Culture not found." });
    }

    const draft = await EventDraft.findByIdAndUpdate(
      id,
      details,
      { new: true }
    );

    const { _id, __v, ...rest } = draft!.toObject();
    return res.status(201).json({ culture: { id: _id, ...rest } });

  } catch (err: any) {
    console.error("Error while saving event details: " + err.message);
    return res.status(500).json({ msg: "Internal Server Error while saving event details." });
  }
}

export const deleteEventDetails = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if(!id) {
      return res.status(400).json({ msg: "Missing required field." });
    }

    await EventDraft.findByIdAndUpdate(
      id,
      { 
        $unset: { 
          title: "",
          description: "",
          duration: "",
          culture: "",
          coverImage: "",
          files: ""
       } 
      }
    );
    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Error while deleting event details: " + err.message);
    return res.status(500).json({ msg: "Internal Server Error while deleting event details." });
  }
}

export const saveEventLocation = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { location } = req.body;

    if (!location || !id) {
      return res.status(400).json({ msg: "Missing Required Field" });
    }

    let draft;
    draft = await EventDraft.findByIdAndUpdate(
      id,
      { 
        location: {
          type: "Point",
          ...location
        }
      },
      { new: true }
    );

    const { _id, __v, ...rest } = draft!.toObject();
    return res.status(201).json({ event: { id: _id, ...rest } });

  } catch (err: any) {
    console.error("Error while saving event location: ", err.message);
    return res.status(500).json({ msg: "Internal Server error while saving event location." });
  }
}

export const deleteEventLocation = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if(!id) {
      return res.status(400).json({ msg: "Missing required field." });
    }

    await EventDraft.findByIdAndUpdate(
      id,
      { 
        $unset: { 
          location: ""
       } 
      }
    );
    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Error while deleting event location: " + err.message);
    return res.status(500).json({ msg: "Internal Server Error while deleting event location." });
  }
}

export const createDraft = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const event = (await Event.findById(id))?.toObject();
    if(!event) {
      return res.status(404).json("Event not found.");
    }

    const { _id } = await EventDraft.create({ ...event });
    return res.status(201).json({ _id });

  } catch (err: any) {
    console.error("Error while creating event draft: ", err.message);
    return res.status(500).json({ msg: "Internal Server error while creating event draft." });
  }
}

export const uploadEvent = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { details, location } = req.body;
    if(!details || !validateEventDetails(details) || !validateLocation(location)) {
      return res.status(400).json({ msg: "Missing required field." });
    }

    if(!validateDates(details.start, details.end)) {
      return res.status(500).json({ msg: "Start date cant be after end date." });
    }

    const exists = await Event.findOne({ title: details.title });
    if (exists) {
      return res.status(409).json({ msg: `Event '${details.title}' already exists.` })
    }

    const culture = await Culture.findById(details.culture);
    if(!culture) {
      return res.status(400).json({ msg: "Culture not found." });
    }

    const { _id: locationId } = await Location.create({ 
      userId,
      type: "Point",
      district: location.district,
      taluk: location.taluk,
      maagane: location.maagane,
      village: location.village,
      coordinates: [location.lat, location.lng]
    });

    const newEvent = await Event.create({
      ...details,
      location: locationId
    });
    const { _id, __v, ...rest } = newEvent.toObject();
    return res.status(201).json({ event: { id: _id, ...rest } });

  } catch(err: any) {
    console.error("Upload Events Error: " + err.message);
    return res.status(500).json({ msg: "Internal Server Error while uploading event." });
  }
}