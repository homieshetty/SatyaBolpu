import { EventDetailsType, FormField, FormFieldOption, NewProps } from "../types/globals";

export const initialDetailsConfig = {
  post: {
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
  },
  culture: {
    title: "",
    description: "",
    coverImage: null,
    galleryImages: [],
    files: []
  },
  event: {
    title: "",
    description: "",
    culture: "",
    coverImage: null,
    duration: {
      start: null,
      end: null
    },
    files: []
  },
  location: {
    name: "",
    attachments: []
  },
  "post-type": {
    name: ""
  },
  "post-group": {
    name: ""
  },
  tag: {
    name: ""
  }
};

export const getInitialDetails = (type: NewProps['type']) => {
  return initialDetailsConfig[type];
};

const titleField = (existingValues: string[]): FormField => ({
  label: "Title",
  name: "title",
  type: "text",
  required: true,
  unique: true,
  existingValues
});

const nameField = (existingValues: string[]): FormField => ({
  label: "Name",
  name: "name",
  type: "text",
  required: true,
  unique: true,
  existingValues
});

const descriptionField: FormField = {
  label: "Description",
  name: "description",
  type: "textarea",
  required: true,
  minWords: 20
};

const coverImageField: FormField = {
  label: "Cover image",
  name: "coverImage",
  type: "file",
  accept: "image/*",
  required: true,
};

const cultureField = (options: FormFieldOption[]): FormField => ({
  label: "Culture",
  name: "culture",
  type: "select",
  required: true,
  options
});

const filesField = (label: string, name: string): FormField => ({
  label,
  name,
  type: "files",
  accept: "image/*,application/pdf"
})

const fieldConfigs = {
  post: (options: Record<string, FormFieldOption[] | string[]>) => [
    titleField(options.titles as string[]),
    {
      label: "Short title",
      name: "shortTitle",
      type: "text",
      required: true,
      unique: true,
      existingValues: options.shortTitles,
      minLength: 3
    },
    cultureField(options.cultures as FormFieldOption[]),
    {
      label: "Post group",
      name: "postGroup",
      type: "select",
      required: true,
      options: options.postGroups as FormFieldOption[]
    },
    {
      label: "Post type",
      name: "postType",
      type: "select",
      required: true,
      options: options.postTypes as FormFieldOption[]
    },
    descriptionField,
    {
      label: "Tags",
      name: "tags",
      type: "multi-select",
      required: true,
      options: options.tags as FormFieldOption[],
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
    coverImageField,
    filesField("Related Files", "files") 
  ],
  culture: (options: Record<string, string[] | FormFieldOption[]>) => [
    titleField(options.titles as string[]),
    descriptionField,
    coverImageField,
    {
      label: "Gallery images",
      name: "galleryImages",
      type: "files",
      accept: "image/*",
      minItems: 15
    },
    filesField("Related files", "files")
  ],
  event: (options: Record<string, FormFieldOption[] | string[]>) => {
    titleField(options.titles as string[]),
    descriptionField,
    cultureField(options.cultures as FormFieldOption[]),
    coverImageField,
    {
      label: "Start date",
      name: "duration.start",
      type: "date",
      required: true,
      validation(formData: any, value: any) {
        if (value && (formData as EventDetailsType).duration.end &&
          new Date(value) > new Date((formData as EventDetailsType).duration.end!)) {
          return "Start date cant be after end date.";
        }
      },
    },
    {
      label: "End date",
      name: "duration.end",
      type: "date",
      required: true,
      validation(formData: any, value: any) {
        if (value && (formData as EventDetailsType).duration.start &&
          new Date(value) < new Date((formData as EventDetailsType).duration.start!)) {
          return "End date cant be before start date.";
        }
      },
    },
    filesField("Related files", "files")
  },
  location: (options: Record<string, string[] | FormFieldOption[]>) => {
    nameField(options.names as string[]),
    filesField("Attachments", "attachments")
  },
  "post-type": (options: Record<string, string[] | FormFieldOption[]>) => {
    nameField(options.names as string[])
  },
  "post-group": (options: Record<string, string[] | FormFieldOption[]>) => {
    nameField(options.names as string[])
  },
  "tag": (options: Record<string, string[] | FormFieldOption[]>) => {
    nameField(options.names as string[])
  }
}

export const getFields = (type: NewProps['type'], options: Record<string, FormFieldOption[] | string[]>): FormField[] => {
  return fieldConfigs[type](options) as FormField[];
};