import { Request, Response } from "express";
import { AuthRequest, ICulture, IEvent, ILocation, IPost } from "../types/globals.js";
import { Draft } from "../models/Draft.js";

export const getDrafts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;

    const drafts =
      (await Draft
        .find({ userId })
        .sort({ createdAt: -1 })
      ).map(d => ({
        id: d._id as string,
        title: (d.draftType === "location" ? (d as ILocation).name : (d as any).title)
      }));

    if (!drafts) {
      return res.status(500).json({ msg: "No drafts found." });
    }

    return res.status(200).json({ drafts });
  } catch (err: any) {
    console.error("Error while fetching drafts: ", err.message);
    return res.status(500).json({ msg: "Internal Server error while fetching drafts." });
  }
}

export const getDraft = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        msg: "Missing required field."
      });
    }

    const draft = await Draft.findById(id);

    if (!draft) {
      return res.status(404).json({ msg: "Draft not found." });
    }

    let draftRes;

    if (draft.draftType === "culture") {
      const d = draft.toObject() as ICulture;

      draftRes = {
        type: "culture",
        details: {
          title: d?.title ?? "",
          description: d?.description ?? "",
          coverImage: d?.coverImage ?? null,
          galleryImages: d?.galleryImages ?? [],
          files: d?.files ?? []
        },
        content: d.content ?? ""
      };
    }

    else if (draft.draftType === "event") {
      const d = draft.toObject() as IEvent;

      draftRes = {
        type: "event",
        details: {
          title: d?.title ?? "",
          culture: d?.culture ?? "",
          description: d?.description ?? "",
          duration:
            d?.duration?.start && d?.duration?.end
              ? {
                  start: d.duration.start
                    .toISOString()
                    .split("T")[0],

                  end: d.duration.end
                    .toISOString()
                    .split("T")[0]
                }
              : {
                  start: null,
                  end: null
                },

          coverImage: d?.coverImage ?? "",
          files: d?.files ?? []
        },

        location: {
          name: d?.location?.name ?? "",
          district: d?.location?.district ?? "",
          taluk: d?.location?.taluk ?? "",
          maagane: d?.location?.maagane ?? "",
          village: d?.location?.village ?? "",
          coordinates: d?.location?.coordinates ?? []
        }
      };
    }

    else if (draft.draftType === "post") {
      const d = draft.toObject() as (IPost & { locationSpecific: boolean });

      draftRes = {
        type: "post",
        details: {
          title: d?.title ?? "",
          shortTitle: d?.shortTitle ?? "",
          culture: d?.culture ?? "",
          postGroup: d?.postGroup ?? "",
          postType: d?.postType ?? "",
          description: d?.description ?? "",
          tags: d?.tags ?? [],
          coverImage: d?.coverImage ?? "",
          files: d?.files ?? [],
          locationSpecific: d?.locationSpecific
        },

        location: {
          name: d?.location?.name ?? "",
          district: d?.location?.district ?? "",
          taluk: d?.location?.taluk ?? "",
          maagane: d?.location?.maagane ?? "",
          village: d?.location?.village ?? "",
          coordinates: d?.location?.coordinates ?? []
        },

        content: d?.content ?? ""
      };
    } else if (draft.draftType === "location") {
      const d = draft.toObject() as ILocation;

      draftRes = {
        type: "location",
        details: {
          name: d?.name ?? "",
        },
        location: {
          district: d?.district ?? "",
          taluk: d?.taluk ?? "",
          maagane: d?.maagane ?? "",
          village: d?.village ?? "",
          coordinates: d?.coordinates ?? []
        }
      };
    }

    return res.status(200).json({ draft: draftRes });

  } catch (err: any) {
    console.error( "Error while fetching draft:", err.message);
    return res.status(500).json({ msg: "Internal Server error while fetching draft." });
  }
};

export const createDraft = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { type: draftType } = req.body;
    const { _id } = (await Draft.create({ userId, draftType })).toObject();
    return res.status(201).json({ id: _id });
  } catch(err: any) {
    console.error("Error while creating draft: " + err.message);
    return res.status(500).json({ msg: "Internal Server Error while creating draft." });
  }
}

export const deleteDraft = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ msg: "Missing required field." });
    }

    await Draft.deleteOne({ _id: id });
    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Error while deleting draft: " + err.message);
    return res.status(500).json({ msg: "Internal Server Error while deleting draft." });
  }
}