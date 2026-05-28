import { Node } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"
import IframeComponent from "./IframeComponent"

export const Iframe = Node.create({
  name: "iframeEmbed",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      html: {
        default: "",
      },
      caption: {
        default: "",
        parseHTML: (element: HTMLElement) => {
          const captionElement = element.querySelector("p.caption")
          return captionElement?.textContent ?? ""
        },
        renderHTML: (attributes: Record<string, any>) => ({
          caption: attributes.caption,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: "div[data-iframe-embed]",
        getAttrs: dom => ({
          html: dom.innerHTML,
        }),
      },
    ]
  },


renderHTML({ HTMLAttributes }) {
  const { caption, html } = HTMLAttributes;

  return [
    "div",
    { 
        class: "w-fit mx-auto",
    },
    [
      "div",
      {
        "data-iframe-embed": "true",
      },
      html
    ],
    [
      "p",
      {
        class: "caption text-center text-[1rem] text-gray-300 mt-2"
      },
      caption || ""
    ]
  ];
},

  addNodeView() {
    return ReactNodeViewRenderer(IframeComponent)
  },
})

