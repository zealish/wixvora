"use client";

import { useEditor } from "../editor-provider";
import { Icon } from "../ui/icon-library";

const viewports = [
  { id: "desktop", icon: "desktop" as const, label: "Desktop" },
  { id: "tablet", icon: "tablet" as const, label: "Tablet" },
  { id: "mobile", icon: "mobile" as const, label: "Mobile" },
] as const;

export function ViewportSwitcher() {
  const { viewport, setViewport } = useEditor();

  return (
    <div className="flex items-center bg-slate-100 rounded-lg p-1">
      {viewports.map(({ id, icon, label }) => (
        <button
          key={id}
          onClick={() => setViewport(id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            viewport === id
              ? "bg-white text-blue-600 shadow"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Icon name={icon} size={16} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
