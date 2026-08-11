"use client";

import { useState, useRef, useEffect } from "react";
import { EDITOR_COLORS } from "../lib/tiptap-extensions";

export function ColorPicker({
  value,
  onChange,
  type = "text",
}: {
  value: string;
  onChange: (color: string) => void;
  type?: "text" | "highlight";
}) {
  const [open, setOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value || "#000000");
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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-7 h-7 rounded-md border border-slate-200 hover:border-slate-400 flex items-center justify-center transition"
        title={type === "text" ? "Text Color" : "Highlight Color"}
      >
        <div
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: type === "highlight" ? value || "#fef08a" : value || "#000000" }}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 w-48">
          <div className="grid grid-cols-6 gap-1 mb-2">
            {EDITOR_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => {
                  onChange(color);
                  setOpen(false);
                }}
                className="w-6 h-6 rounded-md border border-slate-200 hover:scale-110 transition"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5 border-t border-slate-100 pt-2">
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 p-0"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="flex-1 text-[10px] font-mono bg-slate-50 border border-slate-200 rounded px-1.5 py-1 outline-none focus:border-blue-500"
            />
            <button
              onClick={() => {
                onChange(customColor);
                setOpen(false);
              }}
              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 px-1"
            >
              Set
            </button>
          </div>
          {type === "highlight" && (
            <button
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="w-full text-[10px] text-red-500 hover:text-red-600 mt-1 pt-1 border-t border-slate-100"
            >
              Remove highlight
            </button>
          )}
        </div>
      )}
    </div>
  );
}
