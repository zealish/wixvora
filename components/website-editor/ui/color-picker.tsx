"use client";

import { COLOR_PALETTES } from "../lib/color-palettes";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded-lg border-0 p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-24 rounded border border-gray-300 px-2 text-xs font-mono uppercase"
        />
      </div>
      <div className="grid grid-cols-2 gap-1">
        {COLOR_PALETTES.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`h-6 w-full rounded border ${
              value === color
                ? "border-blue-500 ring-1 ring-blue-500"
                : "border-gray-200 hover:border-gray-400"
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}
