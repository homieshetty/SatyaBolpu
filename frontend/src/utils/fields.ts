import { CultureDetailsType, EventDetailsType, FormField, FormFieldOption, PostDetailsType } from "../types/globals";

export const initialPostDetails: PostDetailsType = {
  title: "",
  shortTitle: "",
  culture: "",
  postGroup: "",
  postType: "",
  description: "",
  tags: [],
  locationSpecific: false,
  coverImage: null,
  files: []
};

export const initialCultureDetails: CultureDetailsType = {
  title: "",
  description: "",
  coverImage: null,
  galleryImages: [],
  files: []
};

export const initialEventDetails: EventDetailsType = {
  title: "",
  description: "",
  culture: "",
  coverImage: null,
  duration: {
    start: null,
    end: null
  },
  files: []
};

export const getPostFields = (options: Record<string, FormFieldOption[]>): FormField<PostDetailsType>[] => {
  return [
    {
      label: "Title",
      name: "title",
      type: "text",
      required: true,
      unique: true,
      existingValues: options.titles,
      minLength: 5
    },
    {
      label: "Short title",
      name: "shortTitle",
      type: "text",
      required: true,
      unique: true,
      existingValues: options.shortTitles,
      minLength: 3
    },
    {
      label: "Culture",
      name: "culture",
      type: "select",
      required: true,
      options: options.cultures
    },
    {
      label: "Post group",
      name: "postGroup",
      type: "select",
      required: true,
      options: options.postGroups
    },
    {
      label: "Post type",
      name: "postType",
      type: "select",
      required: true,
      options: options.postTypes
    },
    {
      label: "Description",
      name: "description",
      type: "textarea",
      required: true,
      minWords: 20
    },
    {
      label: "Tags",
      name: "tags",
      type: "multi-select",
      required: true,
      options: options.tags,
      minItems: 1
    },
    {
      label: "Is the post location specific?",
      name: "locationSpecific",
      type: "radio",
      defaultValue: "false",
      options: [
        {
          label: "Yes",
          value: "true"
        },
        {
          label: "No",
          value: "false"
        }
      ]
    },
    {
      label: "Cover image",
      name: "coverImage",
      type: "file",
      accept: "image/*",
      required: true
    },
    {
      label: "Related files",
      name: "files",
      type: "files",
      accept: "image/*,application/pdf"
    }
  ];
};

export const getCultureFields = (options: Record<string, FormFieldOption[]>): FormField<CultureDetailsType>[] => {
  return [
    {
      label: "Title",
      name: "title",
      type: "text",
      minLength: 5,
      unique: true,
      existingValues: options.titles,
      required: true
    },
    {
      label: "Description",
      name: "description",
      type: "textarea",
      minWords: 20,
      required: true
    },
    {
      label: "Cover image",
      name: "coverImage",
      type: "file",
      accept: "image/*",
      required: true
    },
    {
      label: "Gallery images",
      name: "galleryImages",
      type: "files",
      accept: "image/*",
      minItems: 15
    },
    {
      label: "Related files",
      name: "files",
      type: "files",
      accept: "image/*,application/pdf"
    }
  ]
}

export const getEventFields = (options: Record<string, FormFieldOption[]>): FormField<EventDetailsType>[] => {
  return [
    {
      label: "Title",
      name: "title",
      type: "text",
      minLength: 5,
      unique: true,
      existingValues: options.titles,
      required: true
    },
    {
      label: "Description",
      name: "description",
      type: "textarea",
      minWords: 20,
      required: true
    },
    {
      label: "Culture",
      name: "culture",
      type: "select",
      required: true,
      options: options.cultures
    },
    {
      label: "Cover image",
      name: "coverImage",
      type: "file",
      accept: "image/*",
      required: true
    },
    {
      label: "Start date",
      name: "duration.start",
      type: "date",
      required: true,
      validation(formData, value) {
        if(value && formData.duration.end &&
          value > formData.duration.end) {
            return "Start date cant be after end date.";
        }
      },
    },
    {
      label: "End date",
      name: "duration.end",
      type: "date",
      required: true,
      validation(formData, value) {
        if(value && formData.duration.start &&
          value < formData.duration.start) {
            return "End date cant be before start date.";
        }
      },
    },
    {
      label: "Related files",
      name: "files",
      type: "files",
      accept: "image/*,application/pdf"
    }
  ]
}