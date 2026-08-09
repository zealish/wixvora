"use client";

import { useEditor } from "../editor-provider";
import { COLOR_PALETTES, GRADIENT_PRESETS } from "../lib/color-palettes";
import { Icon } from "../ui/icon-library";

const ALIGN_OPTIONS = [
  { value: "text-left", icon: "alignLeft" as const },
  { value: "text-center", icon: "alignCenter" as const },
  { value: "text-right", icon: "alignRight" as const },
];

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  palette?: boolean;
}

function ColorPicker({ label, value, onChange, palette = false }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value || "#ffffff"}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded-lg border border-slate-200"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-900 outline-none focus:border-blue-500"
        />
      </div>
      {palette && (
        <div className="grid grid-cols-10 gap-1.5">
          {COLOR_PALETTES.map((color) => (
            <button
              key={color}
              onClick={() => onChange(color)}
              className={`h-6 w-6 rounded-md border transition-transform hover:scale-110 ${
                value === color ? "ring-2 ring-blue-500 ring-offset-1" : "border-slate-200"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function StyleTab() {
  const { activeBlock, updateBlockProps } = useEditor();
  if (!activeBlock) return null;

  const props = activeBlock.props;
  const hasAlign = "align" in props || ["heading", "paragraph", "hero", "grid_custom", "form_contact"].includes(activeBlock.type);
  const hasAccent = "accentColor" in props || ["navbar", "hero", "form_contact"].includes(activeBlock.type);

  const getAlignValue = () => {
    if (props.align) {
      if (props.align.includes("left")) return "text-left";
      if (props.align.includes("right")) return "text-right";
      return "text-center";
    }
    return "text-center";
  };

  return (
    <div className="space-y-5 p-4">
      <ColorPicker
        label="Warna Latar"
        value={props.bgColor || "#ffffff"}
        onChange={(v) => updateBlockProps({ bgColor: v })}
        palette
      />

      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-600">Preset Gradien</label>
        <select
          value={props.bgGradient || ""}
          onChange={(e) => updateBlockProps({ bgGradient: e.target.value })}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
        >
          <option value="">Tanpa gradien</option>
          {GRADIENT_PRESETS.map((g) => (
            <option key={g.name} value={g.value}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <ColorPicker
        label="Warna Teks"
        value={props.textColor || "#111827"}
        onChange={(v) => updateBlockProps({ textColor: v })}
        palette
      />

      {hasAccent && (
        <ColorPicker
          label="Warna Aksen"
          value={props.accentColor || "#2563eb"}
          onChange={(v) => updateBlockProps({ accentColor: v })}
          palette
        />
      )}

      {hasAlign && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-600">Perataan</label>
          <div className="flex gap-1">
            {ALIGN_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateBlockProps({ align: opt.value })}
                className={`flex flex-1 items-center justify-center rounded-lg border py-2 transition-colors ${
                  getAlignValue() === opt.value
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Icon name={opt.icon} size={16} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
