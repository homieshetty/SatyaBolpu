import { NodeViewWrapper } from "@tiptap/react";
import { useRef, useState, useEffect, ReactNode } from "react";

interface BaseComponentProps {
  node: {
    type: {
      name: string
    },
    attrs: {
      src?: string;
      type?: string;
      html?: string;
      width?: string | number;
      height?: string | number;
      mode?: "block" | "float";
      align?: "left" | "center" | "right";
      caption?: string;
    },
  };
  updateAttributes: (attrs: Record<string, any>) => void;
  selected: boolean;
  deleteNode?: () => void;
  mediaElement: ReactNode;
  mediaRef: React.RefObject<HTMLElement | null>;
  enableResize?: boolean;
  enableCaption?: boolean;
  enableAlign?: boolean;
  customStyles?: string;
}

const BaseComponent = ({
  node,
  updateAttributes,
  selected,
  deleteNode,
  mediaElement,
  mediaRef,
  enableResize = false,
  enableCaption = false,
  enableAlign = false,
  customStyles = "",
}: BaseComponentProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const closeMenu = (e: MouseEvent) => {
      if (showMenu && wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const handleContextMenu = (e: React.MouseEvent) => {
      if(enableAlign) {
        e.preventDefault();
        const rect = wrapperRef.current?.getBoundingClientRect();
        if (!rect) return;

        setMenuPosition({
          x: Math.min(Math.max(e.clientX - rect.left, 0), rect.width - 120),
          y: Math.min(Math.max(e.clientY - rect.top, 0), rect.height - 120),
        });

        setShowMenu(true);
      }
  };

  const startResize = (e: React.MouseEvent) => {
    if (!mediaRef.current || !wrapperRef.current) return;
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = mediaRef.current.offsetWidth;

    const computedStyle = window.getComputedStyle(mediaRef.current);
    const maxWidthStr = computedStyle.maxWidth;
    let maxWidth = parseFloat(maxWidthStr);

    if (maxWidthStr.endsWith("%") && wrapperRef.current) {
      const parentWidth = wrapperRef.current.parentElement?.offsetWidth || window.innerWidth;
      maxWidth = (parseFloat(maxWidthStr) / 100) * parentWidth;
    } else if (maxWidthStr === "none" || maxWidthStr === "auto" || isNaN(maxWidth)) {
      maxWidth = wrapperRef.current.parentElement?.offsetWidth || mediaRef.current.clientWidth;
    }

    const startResize = (moveEvent: MouseEvent) => {
      let newWidth = Math.max(50, startWidth + (moveEvent.clientX - startX));
      newWidth = Math.min(newWidth, maxWidth);

      updateAttributes({
        width: `${newWidth}px`,
      });
    };

    const stopResize = () => {
      window.removeEventListener("mousemove", startResize);
      window.removeEventListener("mouseup", stopResize);
    };

    window.addEventListener("mousemove", startResize);
    window.addEventListener("mouseup", stopResize);
  };

  const handleMenuAction = (
    action: "left" | "center" | "right" | "delete" | "float" | "block"
  ) => {
    if (action === "delete") deleteNode?.();
    else if (action === "float" || action === "block") {
      updateAttributes({ mode: action });
      updateAttributes({ align: action === "block" ? "center" : "left" });
    } else 
      updateAttributes({ align: action });
    setShowMenu(false);
  };

  const isFloat = node.attrs.mode === "float";
  const isLeft = node.attrs.align === "left";
  const isRight = node.attrs.align === "right";
  const wrapperStyle: React.CSSProperties = {
    display: "block",
    float:
      isFloat && node.attrs.align !== "center"
        ? node.attrs.align
        : "none",
    marginLeft: !isFloat && !isLeft ? "auto" : "8px",
    marginRight: !isFloat && !isRight ? "auto" : "8px",
    marginTop: isFloat ? "8px" : "",
    marginBottom: isFloat ? "8px" : ""
  };

  return (
    <NodeViewWrapper 
      className="relative"
    >
      <div
        ref={wrapperRef}
        style={{
            width: node.attrs.width,
            ...wrapperStyle
        }}
        className={`relative ${enableResize && selected ? "border border-solid border-blue-500" : ""} 
            ${customStyles}`}
        onContextMenu={handleContextMenu}
      >

        {mediaElement}

        {enableCaption && (
          <input
            type="text"
            value={node.attrs.caption || ""}
            className="caption w-full text-center text-sm text-gray-400 mt-2"
            placeholder="Caption..."
            onInput={(e) => updateAttributes({ caption: e.currentTarget.value })}
          />
        )}

        {showMenu && (
          <div
            className="absolute bg-white text-black border z-50 text-sm text-center"
            style={{ top: menuPosition.y, left: menuPosition.x, minWidth: "100px" }}
          >
            {["left", node.attrs.mode === "block" ? "center" : "", "right"].filter(dir => dir !== "").map((dir) => (
              <div
                key={dir}
                className="cursor-pointer hover:bg-gray-100 p-1"
                onClick={() => handleMenuAction(dir as any)}
              >
                Align {dir.charAt(0).toUpperCase() + dir.slice(1)}
              </div>
            ))}

            {
              node.type.name === "image" &&
              <div
                className="cursor-pointer hover:bg-red-200 text-black p-1"
                onClick={() => handleMenuAction(node.attrs.mode === "block" ? "float" : "block")}
              >
                {
                  node.attrs.mode === "block" ? "Inline" : "Block"
                }
              </div>
            }

            <div
              className="cursor-pointer hover:bg-red-200 text-red-500 p-1"
              onClick={() => handleMenuAction("delete")}
            >
              Delete
            </div>
          </div>
        )}

        {enableResize && selected && (
          <div
            onMouseDown={startResize}
            className="absolute -right-2 -bottom-2 w-4 h-4 bg-blue-500 cursor-se-resize rounded-full"
          />
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default BaseComponent;