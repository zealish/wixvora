"use client";

import type { Editor } from "@tiptap/react";
import { ColorPicker } from "./ColorPicker";
import { FontSizePicker } from "./FontSizePicker";

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

const BLOCK_OPTIONS = [
  { label: "Paragraph", value: "paragraph" },
  { label: "Heading 1", value: "h1" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
  { label: "Heading 4", value: "h4" },
  { label: "Heading 5", value: "h5" },
  { label: "Heading 6", value: "h6" },
  { label: "Blockquote", value: "blockquote" },
  { label: "Code Block", value: "codeBlock" },
];

export function InspectorToolbar({
  editor,
  elementType,
}: {
  editor: Editor;
  elementType: string;
}) {
  if (!editor) return null;

  const supportsHeadings = elementType === "heading" || elementType === "card";

  const getCurrentBlockLabel = () => {
    if (editor.isActive("heading", { level: 1 })) return "H1";
    if (editor.isActive("heading", { level: 2 })) return "H2";
    if (editor.isActive("heading", { level: 3 })) return "H3";
    if (editor.isActive("heading", { level: 4 })) return "H4";
    if (editor.isActive("heading", { level: 5 })) return "H5";
    if (editor.isActive("heading", { level: 6 })) return "H6";
    if (editor.isActive("blockquote")) return "Blockquote";
    if (editor.isActive("codeBlock")) return "Code Block";
    return "Paragraph";
  };

  const handleBlockChange = (value: string) => {
    const chain = editor.chain().focus();
    if (value === "paragraph") {
      chain.setParagraph().run();
    } else if (value === "blockquote") {
      chain.toggleBlockquote().run();
    } else if (value === "codeBlock") {
      chain.toggleCodeBlock().run();
    } else {
      chain.toggleHeading({ level: parseInt(value.replace("h", "")) as any }).run();
    }
  };

  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      className="flex items-center gap-1 flex-wrap"
    >
      {supportsHeadings && (
        <select
          value={getCurrentBlockLabel()}
          onChange={(e) => {
            const opt = BLOCK_OPTIONS.find((o) => o.label === e.target.value);
            if (opt) handleBlockChange(opt.value);
          }}
          className="h-7 text-[10px] font-semibold bg-slate-50 border border-slate-200 rounded-md px-1.5 outline-none focus:border-blue-500 text-slate-700 cursor-pointer"
        >
          {BLOCK_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      <div className="w-px h-5 bg-slate-200 mx-0.5" />

      <FontSizePicker editor={editor} />

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
    </div>
  );
}
