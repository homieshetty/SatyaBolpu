import { ReactNodeViewRenderer } from "@tiptap/react"
import { Image } from "@tiptap/extension-image"
import ImageComponent from "./ImageComponent"

export const ResizableImage = Image.extend({
  name: "image",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      ...this.parent?.(),

      width: {
        default: "300px",
        parseHTML: (el: HTMLElement) =>
          el.getAttribute("width") ?? el.style.width ?? "300px",
        renderHTML: (attrs) => ({
          width: attrs.width,
        }),
      },

      align: {
        default: "center",
        parseHTML: (el: HTMLElement) =>
          el.getAttribute("align") ?? "center",
        renderHTML: (attrs) => ({
          align: attrs.align,
        }),
      },

      mode: {
        default: "block",
        parseHTML: (el: HTMLElement) =>
          el.getAttribute("mode") ?? "block",
        renderHTML: (attrs) => ({
          "mode": attrs.mode,
        }),
      },

      caption: {
        default: "",
        parseHTML: (el: HTMLElement) => {
          const captionEl = el.querySelector("p.caption")
          return captionEl?.textContent ?? ""
        },
        renderHTML: (attrs) => ({
          caption: attrs.caption,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: "div.file",
        priority: 100,
        getAttrs: (el: HTMLElement) => {
          const img = el.querySelector("img")
          if (!img) return false

          return {
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt"),
            width: el.getAttribute("width") || el.style.width || "300px",
            align: el.getAttribute("align") ?? "center",
            mode: el.getAttribute("mode") ?? "block",
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, width, align, mode, caption } = HTMLAttributes
    const blockAlignStyles = {
      left: "margin-right: auto;",
      right: "margin-left: auto;",
      center: "margin-left: auto; margin-right: auto;"
    };
    const floatAlignStyles = {
      left: "float: left; margin: 8px;",
      right: "float: right; margin: 8px;"
    };
    const alignStyle = 
      mode === "block" ? 
        blockAlignStyles[align as keyof typeof blockAlignStyles] : 
        floatAlignStyles[align as keyof typeof floatAlignStyles];

    const children: any[] = [
      ["img", { src, alt, class: "w-full h-full object-cover" }],
    ]

    if (mode === "block" && caption) {
      children.push([
        "p",
        { class: "caption text-center text-sm text-gray-400 mt-2" },
        caption,
      ])
    }

    return [
      "div",
      {
        class: "file",
        style: `width: ${width}; display: block; ${alignStyle}`,
        mode,
        align,
      },
      ...children,
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent)
  },
})