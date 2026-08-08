"use client";

import { Monitor, Tablet, Smartphone } from "lucide-react";
import type { Viewport } from "./hooks/use-block-editor";

interface ViewportSwitcherProps {
  viewport: Viewport;
  onChange: (viewport: Viewport) => void;
}

const OPTIONS: { value: Viewport; label: string; Icon: typeof Monitor }[] = [
  { value: "desktop", label: "Desktop", Icon: Monitor },
  { value: "tablet", label: "Tablet", Icon: Tablet },
  { value: "mobile", label: "Mobile", Icon: Smartphone },
];

export function ViewportSwitcher({
  viewport,
  onChange,
}: ViewportSwitcherProps) {
  return (
    <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 p-1">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            viewport === value
              ? "bg-blue-600 text-white shadow"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
