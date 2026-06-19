import { Request, Response } from 'express';
import { Event } from '../models/Event.js';
import { AuthRequest, IEvent } from '../types/globals.js';
import { Types } from 'mongoose';
import { validateData, validateDates } from '../utils/validate.js';
import { validateForeignFields } from '../utils/validate.js';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy?.toString() ?? 'createdAt';
    const orderBy = req.query.orderBy?.toString() ?? 'asc';

    const fields = req.query.fields?.toString().split(',').join(' ');
    const cultures = req.query.cultures
      ? req.query.cultures.toString().split(',')
      : [];

    const filterOptions: Record<string, any> = {};
    if (cultures.length)
      filterOptions.culture = {
        $in: cultures.map((c) => new Types.ObjectId(c)),
      };

    let query = Event.find(filterOptions)
      .select(fields ?? '')
      .sort({ [sortBy]: orderBy === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit);

    if (fields?.includes(' userId ')) {
      query = query.populate('userId');
    }

    const [eventsData, total] = await Promise.all([
      query.lean(),
      Event.countDocuments(filterOptions),
    ]);

    const events = eventsData.map((event) => {
      const { _id, coverImage, ...rest } = event;

      return {
        image: coverImage,
        id: _id,
        ...rest,
      };
    });

    if (!events) {
      return res.status(500).json({ msg: 'No events found.' });
    }

    return res
      .status(200)
      .json({ events, total, totalPages: Math.ceil(total / limit) });
  } catch (err: any) {
    console.error('Get Events Error: ' + err.message);
    return res
      .status(500)
      .json({ msg: 'Internal Server Error while fetching events.' });
  }
};

export const getEvent = async (req: Request, res: Response) => {
  try {
    let { id } = req.params;
    const event: IEvent | null = await Event.findOne({ _id: id })
      .populate('culture', 'title')
      .populate('loaction');
    if (!event) {
      return res.status(404).json({ msg: 'No event found.' });
    }

    return res.status(200).json({
      event: {
        ...event,
        culture: (event.culture as any).title,
        duration: {
          start: event.duration.start.toISOString().split('T')[0],
          end: event.duration.end.toISOString().split('T')[0],
        },
      },
    });
  } catch (err: any) {
    console.error('Get Events Error: ' + err.message);
    return res
      .status(500)
      .json({ msg: 'Internal Server Error while fetching events.' });
  }
};

export const uploadEvent = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { formData: eventData } = req.body;
    if (!eventData || !validateData['event'](eventData)) {
      return res.status(400).json({ msg: 'Missing required field.' });
    }

    if (!validateDates(eventData.duration.start, eventData.duration.end)) {
      return res
        .status(500)
        .json({ msg: 'Start date cant be after end date.' });
    }

    const exists = await Event.findOne({ title: eventData.title });
    if (exists) {
      return res
        .status(409)
        .json({ msg: `Event '${eventData.title}' already exists.` });
    }

    if (!validateForeignFields['event'](eventData)) {
      return res.status(400).json('Foreign fields error.');
    }

    const newEvent = await Event.create({ userId, ...eventData });
    const { _id, __v, ...rest } = newEvent.toObject();
    return res.status(201).json({ event: { id: _id, ...rest } });
  } catch (err: any) {
    console.error('Upload Events Error: ' + err.message);
    return res
      .status(500)
      .json({ msg: 'Internal Server Error while uploading event.' });
  }
};
