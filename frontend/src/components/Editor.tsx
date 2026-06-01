import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontSize } from "./EditorExtensions/FontSize";
import { Placeholder } from "@tiptap/extension-placeholder";
import { RiAttachmentLine } from "react-icons/ri";
import { GrBlockQuote } from "react-icons/gr";
import { MdCancel, MdPreview } from "react-icons/md";
import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaBold, FaItalic, FaUnderline, FaUndo, FaRedo, FaSave } from "react-icons/fa";
import { ResizableImage } from "./EditorExtensions/Image";
import { Video } from "./EditorExtensions/Video";
import { Audio } from "./EditorExtensions/Audio";
import Button from "./Button";
import { Iframe } from "./EditorExtensions/Iframe";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Title from "./Title";
import useApi from "../hooks/useApi";
import { CultureState, PostState } from "../types/globals";
import { BASE_URL } from "../App";
import DOMPurify from "dompurify";
import { CustomKeyboardExtensions } from "./EditorExtensions/CustomKeyboardExtensions";

const Editor = ({ 
  state,
  setState,
  endpoint 
} : {
  state: PostState | CultureState,
  setState: React.Dispatch<React.SetStateAction<typeof state>>,
  endpoint: string 
}) => {
  const { id } = useParams();
  const { state: authState } = useAuth();
  const api = useApi(endpoint, { auto: false });
  const uploadApi = useApi("/upload/single", { auto: false });

  const [editorMode, setEditorMode] = useState<"editing" | "preview">("editing");
  const [title, setTitle] = useState<string>("Title");
  const [body, setBody] = useState<string>("");
  const [fontSize, setFontSize] = useState<string>("normal");
  const [showAttachmentMenu, setShowAttachmentMenu] = useState<boolean>(false);
  const [askEmbedUrl, setAskEmbedUrl] = useState<boolean>(false);
  const [embedUrl, setEmbedUrl] = useState<string>("");

  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const attachmentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (attachmentRef.current && !attachmentRef.current.contains(e.target as Node)) {
        setShowAttachmentMenu(false);
      }
    }

    window.addEventListener("mousedown", handleClick);

    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  const editor = useEditor({
    parseOptions: {
      preserveWhitespace: 'full'
    },
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      ResizableImage,
      CustomKeyboardExtensions,
      Video,
      Audio,
      Iframe,
      Placeholder.configure({
        placeholder: "...",
        emptyEditorClass: "is-editor-empty",
        showOnlyWhenEditable: true,
      })
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setFontSize(
        editor.getAttributes("textStyle").fontSize || "normal"
      );
    }
  }, []);

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline")
    })
  })

  useEffect(() => {
    if(!editor) return;
    setTitle(state.details?.title ?? "Title");
    editor.commands.setContent(state.content ?? "");
  }, [editor, state]);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [title, editorMode]);

  const handleFontSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (editor) {
      setFontSize(e.target.value);
      editor.chain().focus().setFontSize(e.target.value).run();
    }
  }

  const actions = useMemo(() => ({
    bold: () => editor?.chain().focus().toggleBold().run(),
    italic: () => editor?.chain().focus().toggleItalic().run(),
    underline: () => editor?.chain().focus().toggleUnderline().run(),
  }), [editor]);

  const handleChangeTitle = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if(!titleRef.current) return;
    titleRef.current.style.height = 'auto';
    titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
    setTitle(e.target.value);
  }

  const handleClick = useCallback((button: "bold" | "italic" | "underline") => {
    actions[button]();
  }, [editor]);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type.split("/")[0];
      const url = URL.createObjectURL(file);
      if (type === "image") {
        editor?.commands.insertContent({
          type: "image",
          attrs: {
            src: url,
            mode: "block"
          }
        })
      } else if (type === "video") {
        editor?.commands.insertContent({
          type: "video",
          attrs: {
            src: url,
            controls: true
          }
        })
      } else if (type == "audio") {
        editor?.commands.insertContent({
          type: "audio",
          attrs: {
            src: url,
            controls: true
          }
        })
      }
    }
  }

  const handleEmbedUrl = () => {
    if (embedUrl) {
      setAskEmbedUrl(false)
      editor.commands.insertContent({
        type: "iframeEmbed",
        attrs: {
          html: embedUrl
        }
      })
    }
  }

  const formatHtml = (html: string) => {
    return html
      .replace(/<p>(.*?)<\/p>/gi, (_, content) => content.trim() === "" ? "<br>" : `${content}<br>`)
      .replace(/(<br>\s*)+$/g, "");
  };

  // const decodeHtml = (html: string) => {
  //   const txt = document.createElement("textarea")
  //   txt.innerHTML = html;
  //   return txt.value;
  // }

  const uploadFiles = async (content: string): Promise<string> => {
    if (!content.trim()) return "";
    if(content === "<p></p>") return "";

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    if(!doc.body.innerText.trim()) return "";

    const elements = doc.querySelectorAll("img, video, audio");
    for(const el of elements) {
      const src = el.getAttribute("src");
      if (!src?.startsWith("blob:") && !src?.startsWith("data:")) continue;
      const blob = await fetch(src).then(res => res.blob());
      const formData = new FormData();
      formData.append("file", blob);
      const res = await uploadApi.post(formData);
      el.setAttribute("src", `${BASE_URL}${res.path}`);
    }

    return doc.body.innerHTML;
  }

  const handleSave = useCallback(async () => {
  if (!editor || !state) return;

  const content = await uploadFiles(editor.getHTML());
  if (title !== state.details?.title) {
    await api.refetch({
      endpoint: `/${endpoint}/draft/${id}/details`,
      method: "POST",
      body: {
        details: {
          ...state.details,
          title
        }
      }
    });
  }

  const res = await api.refetch({
    endpoint: `/${endpoint}/draft/${id}/content`,
    method: "POST",
    body: { content }
  });

  if (!res) {
    toast.error("Error while saving.");
    return;
  }

  setState(prev => ({ ...prev, content }));
  toast.success("Saved successfully.");

}, [editor, title, state, api, id]);

  const handlePreview = useCallback(() => {
    if (editor) {
      setEditorMode((prev) => prev === "editing" ? "preview" : "editing");
      setBody(editor.getHTML());
    }
  }, [editor]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        const key = e.key.toLowerCase();

        if (key === "p") {
          e.preventDefault()
          handlePreview()
        } else if (key === "s") {
          e.preventDefault();
          handleSave();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [editor, handleSave, handlePreview, handleClick, editorMode]);

  useEffect(() => {
    const videos = document.querySelectorAll("video");
    videos.forEach((vid) => {
      vid.pause();
      vid.currentTime = 0;
    });

    const audios = document.querySelectorAll("audio");
    audios.forEach((aud) => {
      aud.pause();
      aud.currentTime = 0;
    });

    const iframes = document.querySelectorAll("iframe");
    iframes.forEach((iframe) => {
      const src = iframe.src;
      iframe.src = "";
      iframe.src = src;
    });
  }, [editorMode]);

  if (!authState.token || authState.user?.role !== "admin")
    return <Navigate to={"/404"} replace />

  return (
    <div className="w-full relative">
      <div 
        className={`w-full relative flex-col items-center justify-center py-20 bg-black
          ${askEmbedUrl ? "pointer-events-none" : ""} 
          ${editorMode === "preview" ? "hidden" : "flex"}`}
      >
        <div 
          className={`w-full h-full absolute top-0 z-10 bg-white bg-opacity-50 overflow-hidden
            pointer-events-none ${askEmbedUrl ? "" : "hidden"}`}
        ></div>
        {
          askEmbedUrl &&
          <div 
            className="fixed w-2/3 md:w-1/2 lg:w-1/3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
              flex flex-col gap-5 items-center justify-center bg-black text-primary text-center p-5
              rounded-xl pointer-events-auto z-50"
          >
            <MdCancel
              className={`absolute text-[2rem] right-0 top-0 cursor-pointer m-5 bg-black 
                text-primary rounded-full hover:scale-110 z-50`}
              onClick={() => {
                setAskEmbedUrl(false);
              }} 
            />
            <label htmlFor="url" className="font-black text-[1.5rem]">Enter Embed Url</label>
            <input
              type="url"
              name="url"
              className="w-4/5 p-2 text-black"
              onInput={(e) => setEmbedUrl((e.target as HTMLInputElement).value)}
            />
            <Button
              content="Submit"
              className="text-[1.2rem]"
              onClick={handleEmbedUrl} 
            />
          </div>
        }
        <div className="w-full flex flex-col justify-center items-center">
          <textarea
            style={{
              padding: 0,
              margin: 0,
              border: 'none',
              outline: 'none',
              boxSizing: 'content-box',
              lineHeight: 1
            }}
            className="text-primary w-4/5 text-4xl sm:text-6xl text-center font-bold bg-black overflow-hidden
              text-wrap focus:outline-none resize-none whitespace-pre-wrap wrap-break-word"
            value={title}
            rows={1}
            ref={titleRef}
            onChange={handleChangeTitle}
          />

          <div className="flex items-center justify-center w-4/5 sm:w-2/3 lg:w-1/2 mx-auto">
            <div className="w-1/2 border-t-2 border-solid border-primary"></div>
            <span className="mx-4 text-xl text-primary font-bold">ॐ</span>
            <div className="w-1/2 border-t-2 border-solid border-primary grow"></div>
          </div>
        </div>

        <EditorContent
          editor={editor}
          className="text-white text-[1.5rem]/[1.75rem] w-[90%] p-5 wrap-break-word text-justify whitespace-pre-wrap"
        />

        <div className="flex md:flex-row flex-col gap-5 sticky bottom-10 items-center justify-center">
          <div className="flex items-center justify-center gap-2 bg-white p-3 rounded-full">

            <div className="relative flex flex-col items-center justify-center" ref={attachmentRef}>
              <button
                className={`text-[1.2rem] cursor-pointer hover:scale-110 bg-none p-1 rounded-lg `}
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}>
                <RiAttachmentLine />
                <input
                  type="file"
                  multiple
                  ref={fileRef}
                  onChange={handleFileInput}
                  accept="video/*,image/*,audio/*"
                  className="hidden"
                />
              </button>
              <ul 
                className={`list-none text-nowrap absolute left-0 bg-white text-center bottom-full 
                  mb-5 rounded-xl overflow-hidden transition-all duration-200 ${showAttachmentMenu ? "h-auto" : "h-0"}`}>
                <li
                  className="p-2 border border-solid border-t-2 hover:bg-primary cursor-pointer"
                  onClick={() => { setShowAttachmentMenu(false); fileRef.current?.click() }}
                >Upload File</li>
                <li
                  className="p-2 border border-solid border-t-2 hover:bg-primary cursor-pointer"
                  onClick={() => { setShowAttachmentMenu(false); setAskEmbedUrl(true) }}
                >Embed</li>
              </ul>
            </div>

            <select
              className="text-center outline-none cursor-pointer"
              name="size"
              value={fontSize}
              onChange={handleFontSize}
            >
              <option value="small">Small</option>
              <option value="normal">Normal</option>
              <option value="large">Large</option>
              <option value="huge">Huge</option>
            </select>

            <button
              className={`cursor-pointer hover:scale-110 bg-none p-1 rounded-lg  ${editorState.bold ? "text-primary scale-110" : "text-black"
                }`}
              onClick={() => handleClick("bold")}
            >
              <FaBold />
            </button>

            <button
              className={`cursor-pointer hover:scale-110 bg-none p-1 rounded-lg  ${editorState.italic ? "text-primary scale-110" : "text-black"
                }`}
              onClick={() => handleClick("italic")}
            >
              <FaItalic />
            </button>

            <button
              className={`cursor-pointer hover:scale-110 bg-none p-1 rounded-lg  ${editorState.underline ? "text-primary scale-110" : "text-black"
                }`}
              onClick={() => handleClick("underline")}
            >
              <FaUnderline />
            </button>

            <button
              className={`cursor-pointer hover:scale-110 bg-none p-1 rounded-lg `}
              onClick={() => editor?.commands.toggleBlockquote()}
            >
              <GrBlockQuote />
            </button>

            <button
              className="cursor-pointer hover:scale-110 bg-none p-1 rounded-lg text-black "
              onClick={() => editor.chain().focus().undo().run()}
            >
              <FaUndo />
            </button>

            <button
              className="cursor-pointer hover:scale-110 bg-none p-1 rounded-lg text-black "
              onClick={() => editor.chain().focus().redo().run()}
            >
              <FaRedo />
            </button>
          </div>

          <div className="bg-white p-3 rounded-full flex gap-3 items-center justify-center">
            <button
              className={`text-[1.25rem] cursor-pointer hover:scale-110 bg-none rounded-lg text-black 
                ${editorMode === "preview" ? "text-primary" : ""}`}
              onClick={() => handlePreview()}>
              <MdPreview />
            </button>

            <button
              className={`cursor-pointer hover:scale-110 bg-none rounded-lg text-black 
                ${editorMode === "preview" ? "text-primary" : ""}`}
              onClick={() => handleSave()}>
              <FaSave />
            </button>
          </div>

        </div>
      </div>

      <div
        className={`w-full relative flex-col
         items-center justify-center bg-black py-20 
          ${editorMode === "preview" ? "flex" : "hidden"}`}>
        {
          <MdCancel
            className={`absolute text-[2.5rem] right-0 top-0 cursor-pointer m-5 bg-black 
            text-primary rounded-full hover:scale-110 z-50`}
            id="cancel"
            onClick={() => {
              setEditorMode("editing");
            }} />
        }
        <Title title={title} />

        <div
          className="text-white text-[1.5rem]/[1.75rem] w-[90%] p-5 wrap-break-word whitespace-pre-wrap text-justify"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(formatHtml(body))
          }}
        >
        </div>

      </div>

    </div>
  );
};

export default Editor;