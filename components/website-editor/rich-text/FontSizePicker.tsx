"use client";

import { useState, useRef, useEffect } from "react";
import type { Editor } from "@tiptap/react";
import { FONT_SIZES } from "../lib/tiptap-extensions";

export function FontSizePicker({
  editor,
  compact = false,
}: {
  editor: Editor;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!editor) return null;

  const currentFontSize = editor.getAttributes("textStyle").fontSize || null;
  const currentLabel = FONT_SIZES.find((s) => s.value === currentFontSize)?.label || "Normal";

  return (
    <div className="relative" ref={ref}>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen(!open);
        }}
        className={`h-7 rounded-md border border-slate-200 hover:border-slate-400 flex items-center justify-center transition text-[11px] font-bold cursor-pointer
          ${currentFontSize ? "bg-blue-100 text-blue-700 border-blue-300" : "text-slate-600 hover:bg-slate-100"}
          ${compact ? "w-7" : "px-2 gap-1"}`}
        title="Font Size"
      >
        {compact ? "A" : currentLabel}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 w-32">
          {FONT_SIZES.map((size) => (
            <button
              key={size.value}
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().setFontSize(size.value).run();
                setOpen(false);
              }}
              className={`w-full px-3 py-1.5 text-left text-[11px] hover:bg-slate-50 flex items-center justify-between transition
                ${currentFontSize === size.value ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700"}`}
            >
              <span>{size.label}</span>
              <span className="text-[9px] text-slate-400 font-mono">{size.value}</span>
            </button>
          ))}
          {currentFontSize && (
            <>
              <div className="border-t border-slate-100 my-1" />
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().unsetFontSize().run();
                  setOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left text-[11px] text-red-500 hover:bg-red-50 transition"
              >
                Remove size
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
