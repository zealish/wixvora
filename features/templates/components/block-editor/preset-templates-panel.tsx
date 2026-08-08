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
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="text-xs text-slate-400 mb-2">
        Load a complete ready-to-use layout structure:
      </div>
      {PRESETS.map((preset) => (
        <button
          key={preset.name}
          type="button"
          onClick={() => onLoad(preset.name)}
          className="w-full p-4 rounded-2xl bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border border-blue-500/30 hover:border-blue-500 cursor-pointer transition group text-left"
        >
          <h4 className="font-bold text-sm text-white group-hover:text-blue-400 flex items-center justify-between">
            {preset.title}
            <Sparkles className="w-4 h-4 text-blue-400" />
          </h4>
          <p className="text-xs text-slate-400 mt-1">{preset.description}</p>
        </button>
      ))}
    </div>
  );
}
