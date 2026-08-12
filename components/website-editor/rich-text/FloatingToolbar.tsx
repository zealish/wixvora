"use client";

import type { Editor } from "@tiptap/react";
import { ColorPicker } from "./ColorPicker";
import { FontSizePicker } from "./FontSizePicker";

const HEADING_LEVELS = [
  { label: "H1", level: 1 },
  { label: "H2", level: 2 },
  { label: "H3", level: 3 },
];

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`w-7 h-7 rounded-md text-[11px] font-bold flex items-center justify-center transition
        ${active ? "bg-blue-100 text-blue-700 border border-blue-300" : "text-slate-600 hover:bg-slate-100 border border-transparent"}
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  );
}

export function FloatingToolbar({
  editor,
  elementType,
}: {
  editor: Editor;
  elementType: string;
}) {
  if (!editor) return null;

  const supportsHeadings = elementType === "heading" || elementType === "card";

  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 bg-white border border-slate-200 rounded-xl shadow-xl px-1.5 py-1 flex items-center gap-0.5"
    >
      {supportsHeadings && (
        <>
          {HEADING_LEVELS.map(({ label, level }) => (
            <ToolbarButton
              key={level}
              onClick={() => editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run()}
              active={editor.isActive("heading", { level })}
              title={`Heading ${level}`}
            >
              {label}
            </ToolbarButton>
          ))}
          <ToolbarButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            active={editor.isActive("paragraph") && !editor.isActive("heading")}
            title="Paragraph"
          >
            P
          </ToolbarButton>
          <div className="w-px h-5 bg-slate-200 mx-0.5" />
        </>
      )}

      <FontSizePicker editor={editor} compact={true} />

      <div className="w-px h-5 bg-slate-200 mx-0.5" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold"
      >
        B
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic"
      >
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Underline"
      >
        <span className="underline">U</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Strikethrough"
      >
        <span className="line-through">S</span>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        title="Inline Code"
      >
        {"</>"}
      </ToolbarButton>

      <div className="w-px h-5 bg-slate-200 mx-0.5" />

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        title="Align Left"
      >
        ≡
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        title="Align Center"
      >
        ≡
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        title="Align Right"
      >
        ≡
      </ToolbarButton>
      <div className="w-px h-5 bg-slate-200 mx-0.5" />

      <ToolbarButton
        onClick={() => {
          const url = window.prompt("Enter URL:");
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        active={editor.isActive("link")}
        title="Insert Link"
      >
        🔗
      </ToolbarButton>

      <div className="w-px h-5 bg-slate-200 mx-0.5" />

      <ColorPicker
        value={editor.getAttributes("textStyle").color || "#000000"}
        onChange={(color) => editor.chain().focus().setColor(color).run()}
        type="text"
      />
      <ColorPicker
        value={editor.getAttributes("highlight").color || "#fef08a"}
        onChange={(color) => {
          if (color) {
            editor.chain().focus().toggleHighlight({ color }).run();
          } else {
            editor.chain().focus().unsetHighlight().run();
          }
        }}
        type="highlight"
      />
    </div>
  );
}
