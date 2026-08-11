"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { getExtensions } from "../lib/tiptap-extensions";
import { FloatingToolbar } from "./FloatingToolbar";
import { InspectorToolbar } from "./InspectorToolbar";

export function RichTextEditor({
  content,
  onUpdate,
  editable = false,
  mode = "canvas",
  elementType = "paragraph",
  className = "",
  style = {},
}: {
  content: string;
  onUpdate: (html: string) => void;
  editable?: boolean;
  mode?: "canvas" | "inspector";
  elementType?: string;
  tagName?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const tiptapMode = "block";

  const editor = useEditor({
    immediatelyRender: typeof window !== "undefined",
    extensions: getExtensions(tiptapMode),
    content: content || "",
    editable,
    editorProps: {
      attributes: {
        class: "rich-text-editor-content focus:outline-none min-h-[1.5em]",
        style: "min-height: 1.5em;",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      onUpdate(html);
    },
  });

  const prevContentRef = useRef(content);
  useEffect(() => {
    if (!editor) return;
    if (content !== prevContentRef.current) {
      prevContentRef.current = content;
      const currentContent = editor.getHTML();
      if (content !== currentContent) {
        editor.commands.setContent(content || "", { emitUpdate: false });
      }
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  if (!editor) return null;

  if (mode === "canvas") {
    return (
      <div className="relative w-full h-full">
        {editable && <FloatingToolbar editor={editor} elementType={elementType} />}
        <EditorContent
          editor={editor}
          className={`w-full h-full ${className}`}
          style={style}
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <InspectorToolbar editor={editor} elementType={elementType} />
      <div
        className="border border-slate-200 rounded-xl overflow-hidden bg-white"
        style={{ height: "150px" }}
      >
        <EditorContent
          editor={editor}
          className="h-full overflow-y-auto p-2.5 rich-text-inspector-content"
          style={style}
        />
      </div>
    </div>
  );
}
