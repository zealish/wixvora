"use client";

import { useState } from "react";
import {
  Monitor,
  Smartphone,
  Plus,
  FileText,
  Wand2,
  Image,
  Sparkles,
  Settings,
} from "lucide-react";

interface BuilderPreviewProps {
  onDemoClick?: () => void;
}

export function BuilderPreview({ }: BuilderPreviewProps) {
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [spacing, setSpacing] = useState(20);

  const canvasStyle = {
    backgroundColor: bgColor,
    maxWidth: deviceView === "mobile" ? "320px" : "100%",
  };

  return (
    <div className="relative z-10 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_20px_50px_-12px_rgba(79,70,229,0.12),0_10px_25px_-5px_rgba(0,0,0,0.05)] transition-all duration-300">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-3.5">
        <div className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <path
              d="M4 8L10 24L16 12L22 24L28 8"
              stroke="url(#mini_logo)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient
                id="mini_logo"
                x1="4"
                y1="8"
                x2="28"
                y2="24"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#3B82F6" />
                <stop offset="1" stopColor="#4F46E5" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-sm font-black tracking-tight text-slate-900">
            WIXVORA
          </span>
        </div>

        <div className="flex items-center space-x-1 rounded-lg bg-slate-100/80 p-1 text-slate-500">
          <button
            onClick={() => setDeviceView("desktop")}
            aria-label="Desktop view"
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
              deviceView === "desktop"
                ? "bg-white text-slate-900 shadow-sm"
                : "hover:text-slate-900"
            }`}
          >
            <Monitor className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDeviceView("mobile")}
            aria-label="Mobile view"
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
              deviceView === "mobile"
                ? "bg-white text-slate-900 shadow-sm"
                : "hover:text-slate-900"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
            Preview
          </button>
          <button className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700">
            Publish
          </button>
        </div>
      </div>

      {/* Builder Canvas */}
      <div
        className="relative flex min-h-[420px] overflow-hidden bg-slate-50/50 transition-all duration-300 sm:min-h-[460px]"
        style={canvasStyle}
      >
        {/* Left Sidebar */}
        <div className="w-36 flex-col space-y-1 border-r border-slate-100 bg-white p-3 text-xs font-medium text-slate-600 sm:w-44">
          {[
            { icon: Plus, label: "Add", iconClass: "text-slate-500" },
            { icon: FileText, label: "Pages", iconClass: "text-slate-500" },
            { icon: Wand2, label: "Design", iconClass: "text-slate-500" },
            { icon: Image, label: "Media", iconClass: "text-slate-500" },
            {
              icon: Sparkles,
              label: "AI Tools",
              iconClass: "text-indigo-500",
              active: true,
            },
          ].map(({ icon: Icon, label, iconClass, active }) => (
            <button
              key={label}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition ${
                active
                  ? "bg-indigo-50/70 font-semibold text-indigo-600"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon className={`h-3 w-3 ${iconClass}`} />
              <span>{label}</span>
            </button>
          ))}
          <button className="mt-auto flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-slate-700 transition hover:bg-slate-50">
            <Settings className="h-3 w-3 text-slate-500" />
            <span>Settings</span>
          </button>
        </div>

        {/* Canvas Workspace */}
        <div
          className="flex flex-1 items-center justify-center p-6 transition-all sm:p-8"
          style={{ padding: `${spacing}px` }}
        >
          <div className="grid w-full max-w-xl grid-cols-1 items-center gap-6 md:grid-cols-12">
            {/* Editable Text Block */}
            <div className="builder-selection-box rounded-xl bg-white/60 p-3 md:col-span-7">
              <div className="builder-handle -left-1.5 -top-1.5" />
              <div className="builder-handle -right-1.5 -top-1.5" />
              <div className="builder-handle -bottom-1.5 -left-1.5" />
              <div className="builder-handle -bottom-1.5 -right-1.5" />
              <h2
                contentEditable
                suppressContentEditableWarning
                className="rounded px-1 text-2xl font-black leading-tight text-slate-900 outline-none focus:ring-1 focus:ring-indigo-300 sm:text-3xl"
              >
                Your Vision, Built with AI
              </h2>
              <p
                contentEditable
                suppressContentEditableWarning
                className="mt-4 rounded px-1 text-xs leading-relaxed text-slate-600 outline-none focus:ring-1 focus:ring-indigo-300 sm:text-sm"
              >
                Bring your ideas to life with beautiful, high-converting websites.
              </p>
              <div className="mt-4">
                <button className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700">
                  Get Started
                </button>
              </div>
            </div>

            {/* Image Card */}
            <div className="md:col-span-5">
              <div className="group relative h-44 w-full overflow-hidden rounded-2xl shadow-lg sm:h-52">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
                  alt="Mountain Visual"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://placehold.co/400x500/4f46e5/ffffff?text=AI+Generated+Visual";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/80 via-indigo-900/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="mb-1 h-6 w-6 rounded-full bg-indigo-300/40 backdrop-blur" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Properties Panel */}
        <div className="absolute bottom-6 right-4 top-6 z-20 flex w-52 flex-col space-y-4 rounded-2xl border border-slate-100/80 bg-white/95 p-4 text-xs shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08),0_4px_12px_-2px_rgba(0,0,0,0.03)] backdrop-blur-md sm:w-56">
          <div className="flex items-center border-b border-slate-100 pb-2">
            <button className="flex-1 border-b-2 border-indigo-600 pb-1.5 text-center font-semibold text-indigo-600 -mb-2">
              Section
            </button>
            <button className="flex-1 pb-1.5 text-center font-medium text-slate-500 hover:text-slate-600">
              Style
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-500">
              Layout
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="cursor-pointer rounded-lg border border-slate-200 p-2 transition hover:border-indigo-400">
                <div className="mb-1 h-2 w-full rounded-sm bg-slate-200" />
                <div className="h-2 w-2/3 rounded-sm bg-slate-100" />
              </div>
              <div className="cursor-pointer rounded-lg border-2 border-indigo-600 bg-indigo-50/20 p-2">
                <div className="flex gap-1">
                  <div className="w-1/2 space-y-1">
                    <div className="h-1.5 rounded-sm bg-indigo-200" />
                    <div className="h-1.5 rounded-sm bg-slate-200" />
                  </div>
                  <div className="w-1/2 rounded-sm bg-indigo-200" />
                </div>
              </div>
              <div className="cursor-pointer rounded-lg border border-slate-200 p-2 transition hover:border-indigo-400">
                <div className="mb-1 h-2 w-1/2 rounded-sm bg-slate-200" />
                <div className="h-2 w-full rounded-sm bg-slate-100" />
              </div>
              <div className="cursor-pointer rounded-lg border border-slate-200 p-2 transition hover:border-indigo-400">
                <div className="flex gap-1">
                  <div className="w-1/2 rounded-sm bg-slate-200" />
                  <div className="w-1/2 space-y-1">
                    <div className="h-1.5 rounded-sm bg-slate-200" />
                    <div className="h-1.5 rounded-sm bg-slate-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-500">
              Background
            </span>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-2">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-5 w-5 cursor-pointer rounded-full border-0 bg-transparent p-0"
                    aria-label="Background color"
                  />
                  <span className="font-mono text-[11px] font-medium uppercase text-slate-700">
                    {bgColor.toUpperCase()}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <label htmlFor="spacing-range" className="font-semibold text-slate-500">Spacing</label>
              <span className="font-medium text-slate-600">{spacing}</span>
            </div>
            <input
              id="spacing-range"
              type="range"
              min={8}
              max={40}
              value={spacing}
              onChange={(e) => setSpacing(Number(e.target.value))}
              className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}