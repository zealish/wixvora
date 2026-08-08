"use client";

import { Sparkles } from "lucide-react";

interface PresetTemplatesPanelProps {
  onLoad: (name: string) => void;
}

const PRESETS: { name: string; title: string; description: string }[] = [
  {
    name: "saas",
    title: "SaaS Landing Page",
    description: "Navbar, Hero Banner, Custom Feature Grid, and Footer.",
  },
];

export function PresetTemplatesPanel({ onLoad }: PresetTemplatesPanelProps) {
  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      <div className="mb-2 text-xs text-slate-400">
        Load a complete ready-to-use layout structure:
      </div>
      {PRESETS.map((preset) => (
        <button
          key={preset.name}
          type="button"
          onClick={() => onLoad(preset.name)}
          className="group w-full cursor-pointer rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-900/30 to-indigo-900/20 p-4 text-left transition hover:border-blue-500"
        >
          <h4 className="flex items-center justify-between text-sm font-bold text-white group-hover:text-blue-400">
            {preset.title}
            <Sparkles className="h-4 w-4 text-blue-400" />
          </h4>
          <p className="mt-1 text-xs text-slate-400">{preset.description}</p>
        </button>
      ))}
    </div>
  );
}
