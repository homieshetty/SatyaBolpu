import { Request, Response } from 'express';
import {
  CreateData,
  CreateType,
  AuthRequest,
  ILocation,
} from '../types/globals.js';
import { validateData } from '../utils/validate.js';
import { validateForeignFields } from '../utils/validate.js';
import { Draft } from '../models/Draft.js';
import { Model } from 'mongoose';
import { DraftModelMap, ModelMap } from '../utils/constants.js';

const fields = {
  post: {
    details: [
      'title',
      'culture',
      'postGroup',
      'postType',
      'description',
      'tags',
      'coverImage',
      'files',
    ],
    content: ['content'],
    location: ['location'],
  },

  culture: {
    details: ['title', 'description', 'coverImage', 'galleryImages', 'files'],
    content: ['content'],
  },

  blog: {
    details: ['title', 'description', 'coverImage', 'files'],
    content: ['content'],
    location: ['location'],
  },

  location: {
    details: ['name'],
    location: [
      'district',
      'taluk',
      'maagane',
      'village',
      'coordinates',
      'attachments',
    ],
  },
};

export const createDraft = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { type: draftType } = req.body;
    if (!draftType) {
      return res.status(400).json({ msg: 'Missing required field.' });
    }

    const { _id } = (await Draft.create({ userId, draftType })).toObject();
    return res.status(201).json({ id: _id });
  } catch (err: any) {
    console.error('Error while creating draft: ' + err.message);
    return res
      .status(500)
      .json({ msg: 'Internal Server Error while creating draft.' });
  }
};

export const getDrafts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({ msg: 'Missing user id.' });
    }

    const drafts = (await Draft.find({ userId }).sort({ createdAt: -1 })).map(
      (d) => ({
        id: d._id as string,
        title:
          d.draftType === 'location' ? (d as ILocation).name : (d as any).title,
      }),
    );

    if (!drafts) {
      return res.status(500).json({ msg: 'No drafts found.' });
    }

    return res.status(200).json({ drafts });
  } catch (err: any) {
    console.error('Error while fetching drafts: ', err.message);
    return res
      .status(500)
      .json({ msg: 'Internal Server error while fetching drafts.' });
  }
};

export const getDraftType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ msg: 'Missing required field.' });
    }

    const draft = await Draft.findById(id).select('draftType');
    if (!draft) {
      return res.status(400).json({ msg: 'Draft not found.' });
    }

    return res.status(200).json({ type: draft.draftType });
  } catch (err: any) {
    console.error('Fetch Error:', err.message);
    return res.status(500).json({ msg: `Fetch error: ${err.message}` });
  }
};

export const getDraft = async (req: Request, res: Response) => {
  try {
    const { id, type } = req.params;

    if (!id || !type) {
      return res.status(400).json({ msg: 'Missing required field.' });
    }

    const DraftModel = DraftModelMap[
      type as keyof typeof DraftModelMap
    ] as Model<any>;
    const refs = Object.keys(DraftModel.schema.paths).filter(
      (path) => DraftModel.schema.paths[path].options?.ref,
    );

    let query = Draft.findById(id);
    refs.forEach((path) => {
      if (path === 'userId') return;
      query = query.populate(path);
    });

    const draft = await query.lean<Record<string, any>>();
    if (!draft) {
      return res.status(400).json({ msg: 'Draft not found.' });
    }

    const selectedFields = fields[type as keyof typeof fields] as Record<
      string,
      string[]
    >;

    return res.status(200).json({
      draft: Object.fromEntries(
        Object.entries(selectedFields).map(([key, fieldKeys]) => [
          key,
          fieldKeys.length > 1
            ? Object.fromEntries(
                fieldKeys.map((fieldKey) => [fieldKey, draft[fieldKey]]),
              )
            : draft[fieldKeys[0]],
        ]),
      ),
    });
  } catch (err: any) {
    console.error('Fetch Error:', err.message);
    return res.status(500).json({ msg: `Fetch error: ${err.message}` });
  }
};

export const updateDraft = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { id, type, step } = req.params;
    const { data }: { data: CreateData } = req.body;

    if (!id || !type || !step) {
      return res.status(400).json({ msg: 'Missing required field.' });
    }

    if (!data) {
      return res.status(400).json({ msg: 'Missing body.' });
    }

    if (!userId) {
      return res.json(404).json({ msg: 'Missing user id.' });
    }

    const validator = validateData[type as CreateType] as Record<
      string,
      (
        data:
          | CreateData['details']
          | CreateData['content']
          | CreateData['location'],
      ) => boolean
    >;
    if (!validator[step](data)) {
      return res.status(404).json({ msg: 'Validation failed.' });
    }

    const foreignValidator = validateForeignFields[type as CreateType] as (
      data:
        | CreateData['details']
        | CreateData['content']
        | CreateData['location'],
    ) => Promise<boolean>;
    if (data.details && !(await foreignValidator(data))) {
      return res.status(404).json({ msg: 'Foreign validation failed.' });
    }

    if (!id) {
      return res.json(404).json({ msg: 'Missing draft id.' });
    }

    let finalData = { ...data };
    if (data.details) {
      finalData = {
        userId,
        ...finalData,
      } as CreateData & { userId: string };
    }
    const DraftModel = DraftModelMap[
      type as keyof typeof DraftModelMap
    ] as Model<any>;
    const draft = await DraftModel.findByIdAndUpdate(id, finalData, {
      new: true,
    });

    if (!draft) {
      return res.status(500).json({ msg: 'Error whie updating draft.' });
    }

    const selectedFields = fields[type as keyof typeof fields] as Record<
      string,
      string[]
    >;

    return res.status(200).json({
      draft: Object.fromEntries(
        Object.entries(selectedFields).map(([key, fieldKeys]) => [
          key,
          Object.fromEntries(
            fieldKeys.map((fieldKey) => [fieldKey, draft[fieldKey]]),
          ),
        ]),
      ),
    });
  } catch (err: any) {
    console.error('Update Error:', err.message);
    return res.status(500).json({ msg: `Update error: ${err.message}` });
  }
};

export const removeFromDraft = async (req: Request, res: Response) => {
  try {
    const { id, type, step } = req.params;
    if (!id || !type || !step) {
      return res.status(400).json({ msg: 'Missing required field.' });
    }

    const DraftModel = DraftModelMap[
      type as keyof typeof DraftModelMap
    ] as Model<any>;
    const deleteFields = fields[type as keyof typeof fields] as Record<
      string,
      {}
    >;
    await DraftModel.findByIdAndUpdate(id, {
      $unset: {
        ...deleteFields[step],
      },
    });

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Delete Error:', err.message);
    return res.status(500).json({ msg: `Delete error: ${err.message}` });
  }
};

export const moveToDraft = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { type }: { type: CreateType } = req.body;
    if (!id || !type) {
      return res.status(400).json({ msg: 'Missing required field.' });
    }

    const Model = ModelMap[type as keyof typeof ModelMap] as Model<any>;
    const data = await Model.findById(id).lean();
    if (!data) {
      return res.status(404).json(`${type} not found.`);
    }

    const DraftModel = DraftModelMap[
      type as keyof typeof DraftModelMap
    ] as Model<any>;
    const { _id } = await DraftModel.create({ ...data });
    return res.status(201).json({ _id });
  } catch (err: any) {
    console.error('Error while creating pdraft: ', err.message);
    return res
      .status(500)
      .json({ msg: 'Internal Server error while creating draft.' });
  }
};

export const deleteDraft = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ msg: 'Missing required field.' });
    }

    await Draft.deleteOne({ _id: id });
    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Error while deleting draft: ' + err.message);
    return res
      .status(500)
      .json({ msg: 'Internal Server Error while deleting draft.' });
  }
};
