import { CultureState, EventDetailsType, EventState, FormField, FormFieldOption, LocationState, NewProps, NewState, PostGroupState, PostState, PostTypeState, TagState } from "../types/globals";

export const getInitialDetails = (type: NewProps['type'], state: NewState) => {
  return (
    type === "post" ?
      (state as PostState).details ??
      {
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
      } :
      type === "culture" ?
        (state as CultureState).details ??
        {
          title: "",
          description: "",
          coverImage: null,
          galleryImages: [],
          files: []
        } :
        type === "event" ?
          (state as EventState).details ??
          {
            title: "",
            description: "",
            culture: "",
            coverImage: null,
            duration: {
              start: null,
              end: null
            },
            files: []
          } :
          type === "tag" ?
            (state as TagState) ??
            {
              tag: ""
            } :
            type === "post-group" ?
              (state as PostGroupState) ??
              {
                name: ""
              } :
              type === "post-type" ?
                (state as PostTypeState) ??
                {
                  name: ""
                } :
                type === "location" ?
                  (state as LocationState).details ??
                  {
                    name: "",
                  } :
                  null
  )
};

export const getFields = <T>(type: NewProps['type'], options: Record<string, FormFieldOption[] | string[]>): FormField<T>[] => {
  return (
    type === "post" ?
      [
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
          options: options.cultures as FormFieldOption[]
        },
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
      ] :
      type === "culture" ?
        [
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
        ] :
        type === "event" ?
          [
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
              options: options.cultures as FormFieldOption[]
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
                if (value && (formData as EventDetailsType).duration.end &&
                  value > (formData as EventDetailsType).duration.end!) {
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
                if (value && (formData as EventDetailsType).duration.start &&
                  value < (formData as EventDetailsType).duration.start!) {
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
          ] : 
          type === "location" ?
            [
              {
                label: "Name",
                name: "name",
                type: "text",
                required: true,
                unique: true,
                existingValues: options.names
              }
            ] : 
              []
  )
};