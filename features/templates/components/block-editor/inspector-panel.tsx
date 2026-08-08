"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { BlockConfig, NavLink } from "../../lib/block-types";
import { getBlockIcon } from "../../lib/block-icons";
import {
  ColorField,
  FieldShell,
  NumberField,
  SelectField,
  TextAreaField,
  TextField,
} from "./fields";

type InspectorTab = "content" | "style" | "advanced";

interface InspectorPanelProps {
  block: BlockConfig;
  onUpdateProps: (patch: Record<string, unknown>) => void;
}

const ALIGN_OPTIONS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const GRADIENT_OPTIONS = [
  { value: "", label: "None (Solid)" },
  { value: "bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950", label: "Midnight Cyber" },
  { value: "bg-gradient-to-r from-amber-600 via-orange-600 to-red-600", label: "Sunset Gold" },
  { value: "bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-950", label: "Emerald Luxe" },
  { value: "bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-950", label: "Royal Violet" },
];

const ICON_OPTIONS = [
  { value: "sparkles", label: "Sparkles" },
  { value: "palette", label: "Palette" },
  { value: "code", label: "Code" },
  { value: "grid", label: "Grid" },
  { value: "layers", label: "Layers" },
  { value: "star", label: "Star" },
  { value: "mail", label: "Mail" },
  { value: "box", label: "Box" },
  { value: "layout", label: "Layout" },
];

const ICON_BY_TYPE: Record<BlockConfig["type"], string> = {
  navbar: "layout",
  hero: "layout",
  container: "box",
  grid_custom: "grid",
  heading: "type",
  paragraph: "type",
  image: "image",
  pricing: "star",
  form_contact: "mail",
  footer: "layout",
};

export function InspectorPanel({
  block,
  onUpdateProps,
}: InspectorPanelProps) {
  const [tab, setTab] = useState<InspectorTab>("content");
  const Icon = getBlockIcon(ICON_BY_TYPE[block.type]);

  const set = (field: string, value: unknown) =>
    onUpdateProps({ [field]: value });

  const renderLinks = (links: NavLink[]) => {
    const addLink = () =>
      set("links", [
        ...links,
        { label: `Menu ${links.length + 1}`, url: "#" },
      ]);
    const removeLink = (index: number) =>
      set(
        "links",
        links.filter((_, i) => i !== index)
      );

    return (
      <div className="space-y-3">
        {links.map((link, i) => (
          <div
            key={i}
            className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/40 p-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-500">
                Link {i + 1}
              </span>
              <IconButton onClick={() => removeLink(i)} />
            </div>
            <TextField
              label="Label"
              value={link.label}
              onChange={(v) => setLinkField(links, i, "label", v, set)}
            />
            <TextField
              label="URL"
              value={link.url}
              onChange={(v) => setLinkField(links, i, "url", v, set)}
            />
          </div>
        ))}
        <AddButton label="Add Link" onClick={addLink} />
      </div>
    );
  };

  const renderFeatures = (features: string[]) => {
    const updateFeature = (index: number, v: string) =>
      set(
        "features",
        features.map((f, i) => (i === index ? v : f))
      );
    const addFeature = () =>
      set("features", [...features, `Feature ${features.length + 1}`]);
    const removeFeature = (index: number) =>
      set(
        "features",
        features.filter((_, i) => i !== index)
      );

    return (
      <div className="space-y-2">
        {features.map((feature, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              type="text"
              value={feature}
              onChange={(e) => updateFeature(i, e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none text-xs"
            />
            <IconButton onClick={() => removeFeature(i)} />
          </div>
        ))}
        <AddButton label="Add Feature" onClick={addFeature} />
      </div>
    );
  };

  const renderColumns = (
    columns: {
      icon: string;
      title: string;
      desc: string;
      bgColor: string;
      textColor: string;
      accentColor: string;
      btnText: string;
      btnUrl: string;
    }[]
  ) => {
    const updateColumn = (
      index: number,
      field: string,
      v: unknown,
      current: typeof columns
    ) =>
      set(
        "columns",
        current.map((c, i) => (i === index ? { ...c, [field]: v } : c))
      );
    const addColumn = () =>
      set("columns", [
        ...columns,
        {
          icon: "sparkles",
          title: `New Feature ${columns.length + 1}`,
          desc: "Short description of the new feature.",
          bgColor: "#1e293b",
          textColor: "#f8fafc",
          accentColor: "#3b82f6",
          btnText: "Learn More",
          btnUrl: "#",
        },
      ]);
    const removeColumn = (index: number) =>
      set(
        "columns",
        columns.filter((_, i) => i !== index)
      );

    return (
      <div className="space-y-3">
        {columns.map((col, i) => (
          <div
            key={i}
            className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/40 p-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-500">
                Column {i + 1}
              </span>
              <IconButton onClick={() => removeColumn(i)} />
            </div>
            <SelectField
              label="Icon"
              value={col.icon}
              onChange={(v) => updateColumn(i, "icon", v, columns)}
              options={ICON_OPTIONS}
            />
            <TextField
              label="Title"
              value={col.title}
              onChange={(v) => updateColumn(i, "title", v, columns)}
            />
            <TextAreaField
              label="Description"
              value={col.desc}
              rows={2}
              onChange={(v) => updateColumn(i, "desc", v, columns)}
            />
            <ColorField
              label="Background"
              value={col.bgColor}
              onChange={(v) => updateColumn(i, "bgColor", v, columns)}
            />
            <ColorField
              label="Text"
              value={col.textColor}
              onChange={(v) => updateColumn(i, "textColor", v, columns)}
            />
            <ColorField
              label="Accent"
              value={col.accentColor}
              onChange={(v) => updateColumn(i, "accentColor", v, columns)}
            />
            <div className="grid grid-cols-2 gap-2">
              <TextField
                label="Button Text"
                value={col.btnText}
                onChange={(v) => updateColumn(i, "btnText", v, columns)}
              />
              <TextField
                label="Button URL"
                value={col.btnUrl}
                onChange={(v) => updateColumn(i, "btnUrl", v, columns)}
              />
            </div>
          </div>
        ))}
        <AddButton label="Add Column" onClick={addColumn} />
      </div>
    );
  };

  const renderContent = () => {
    switch (block.type) {
      case "navbar":
        return (
          <>
            <TextField label="Logo Text" value={block.props.logoText} onChange={(v) => set("logoText", v)} />
            <div className="grid grid-cols-2 gap-2">
              <TextField label="CTA Text" value={block.props.ctaText} onChange={(v) => set("ctaText", v)} />
              <TextField label="CTA URL" value={block.props.ctaUrl} onChange={(v) => set("ctaUrl", v)} />
            </div>
          </>
        );
      case "hero":
        return (
          <>
            <TextField label="Badge Text" value={block.props.badge} onChange={(v) => set("badge", v)} />
            <TextField label="Title" value={block.props.title} onChange={(v) => set("title", v)} />
            <TextAreaField label="Subtitle" value={block.props.subtitle} onChange={(v) => set("subtitle", v)} rows={3} />
            <div className="grid grid-cols-2 gap-2">
              <TextField label="Primary Button" value={block.props.buttonText} onChange={(v) => set("buttonText", v)} />
              <TextField label="Primary URL" value={block.props.buttonUrl} onChange={(v) => set("buttonUrl", v)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <TextField label="Secondary Button" value={block.props.secondaryButtonText} onChange={(v) => set("secondaryButtonText", v)} />
              <TextField label="Secondary URL" value={block.props.secondaryButtonUrl} onChange={(v) => set("secondaryButtonUrl", v)} />
            </div>
          </>
        );
      case "container":
        return (
          <TextAreaField label="Container Content" value={block.props.content} onChange={(v) => set("content", v)} rows={4} />
        );
      case "grid_custom":
        return (
          <>
            <TextField label="Section Title" value={block.props.title} onChange={(v) => set("title", v)} />
            <TextField label="Section Subtitle" value={block.props.subtitle} onChange={(v) => set("subtitle", v)} />
          </>
        );
      case "heading":
        return (
          <>
            <SelectField
              label="Heading Level"
              value={block.props.level}
              onChange={(v) => set("level", v as "h1" | "h2" | "h3" | "h4")}
              options={[
                { value: "h1", label: "H1 - Main Heading" },
                { value: "h2", label: "H2 - Large Sub Heading" },
                { value: "h3", label: "H3 - Section Heading" },
                { value: "h4", label: "H4 - Sub Section" },
              ]}
            />
            <TextAreaField label="Heading Text" value={block.props.text} onChange={(v) => set("text", v)} rows={3} />
          </>
        );
      case "paragraph":
        return (
          <TextAreaField label="Paragraph Text" value={block.props.text} onChange={(v) => set("text", v)} rows={4} />
        );
      case "image":
        return (
          <>
            <TextField label="Image URL" value={block.props.url} onChange={(v) => set("url", v)} />
            <TextField label="Alt Text" value={block.props.alt} onChange={(v) => set("alt", v)} />
            <TextField label="Caption" value={block.props.caption} onChange={(v) => set("caption", v)} />
          </>
        );
      case "pricing":
        return (
          <>
            <TextField label="Plan Name" value={block.props.planName} onChange={(v) => set("planName", v)} />
            <TextField label="Badge" value={block.props.badge} onChange={(v) => set("badge", v)} />
            <div className="grid grid-cols-2 gap-2">
              <TextField label="Price" value={block.props.price} onChange={(v) => set("price", v)} />
              <TextField label="Period" value={block.props.period} onChange={(v) => set("period", v)} />
            </div>
          </>
        );
      case "form_contact":
        return (
          <>
            <TextField label="Title" value={block.props.title} onChange={(v) => set("title", v)} />
            <TextField label="Subtitle" value={block.props.subtitle} onChange={(v) => set("subtitle", v)} />
            <TextField label="Placeholder" value={block.props.placeholder} onChange={(v) => set("placeholder", v)} />
            <TextField label="Button Text" value={block.props.buttonText} onChange={(v) => set("buttonText", v)} />
          </>
        );
      case "footer":
        return (
          <>
            <TextField label="Brand Name" value={block.props.brandName} onChange={(v) => set("brandName", v)} />
            <TextField label="Copyright" value={block.props.copyright} onChange={(v) => set("copyright", v)} />
          </>
        );
    }
  };

  const renderStyle = () => {
    switch (block.type) {
      case "navbar":
      case "hero":
        return (
          <>
            <ColorField label="Background" value={block.props.bgColor} onChange={(v) => set("bgColor", v)} />
            <ColorField label="Text" value={block.props.textColor} onChange={(v) => set("textColor", v)} />
            {"accentColor" in block.props && (
              <ColorField label="Accent" value={block.props.accentColor} onChange={(v) => set("accentColor", v)} />
            )}
            {"bgGradient" in block.props && (
              <SelectField label="Background Gradient" value={block.props.bgGradient} onChange={(v) => set("bgGradient", v)} options={GRADIENT_OPTIONS} />
            )}
            {"align" in block.props && (
              <SelectField label="Alignment" value={block.props.align} onChange={(v) => set("align", v as "left" | "center" | "right")} options={ALIGN_OPTIONS} />
            )}
          </>
        );
      case "container":
        return (
          <>
            <ColorField label="Background" value={block.props.bgColor} onChange={(v) => set("bgColor", v)} />
            <ColorField label="Text" value={block.props.textColor} onChange={(v) => set("textColor", v)} />
            <ColorField label="Border" value={block.props.borderColor} onChange={(v) => set("borderColor", v)} />
            <SelectField
              label="Border Radius"
              value={block.props.borderRadius}
              onChange={(v) => set("borderRadius", v)}
              options={[
                { value: "rounded-none", label: "None" },
                { value: "rounded-lg", label: "Small" },
                { value: "rounded-2xl", label: "Large" },
                { value: "rounded-3xl", label: "Extra Large" },
              ]}
            />
            <SelectField
              label="Background Gradient"
              value={block.props.bgGradient}
              onChange={(v) => set("bgGradient", v)}
              options={GRADIENT_OPTIONS}
            />
          </>
        );
      case "grid_custom":
        return (
          <p className="text-xs text-slate-500">
            Colors are configured per column in the Grid / List tab.
          </p>
        );
      case "heading":
        return (
          <>
            <ColorField label="Text" value={block.props.textColor} onChange={(v) => set("textColor", v)} />
            <SelectField
              label="Font Size"
              value={block.props.fontSize}
              onChange={(v) => set("fontSize", v)}
              options={[
                { value: "text-3xl md:text-4xl", label: "Large" },
                { value: "text-2xl md:text-3xl", label: "Medium" },
                { value: "text-xl", label: "Small" },
              ]}
            />
            <SelectField
              label="Font Weight"
              value={block.props.weight}
              onChange={(v) => set("weight", v)}
              options={[
                { value: "font-extrabold", label: "Extra Bold" },
                { value: "font-bold", label: "Bold" },
                { value: "font-semibold", label: "Semibold" },
              ]}
            />
            <SelectField label="Alignment" value={block.props.align} onChange={(v) => set("align", v as "left" | "center" | "right")} options={ALIGN_OPTIONS} />
          </>
        );
      case "paragraph":
        return (
          <>
            <ColorField label="Text" value={block.props.textColor} onChange={(v) => set("textColor", v)} />
            <SelectField label="Alignment" value={block.props.align} onChange={(v) => set("align", v as "left" | "center" | "right")} options={ALIGN_OPTIONS} />
            <SelectField
              label="Font Size"
              value={block.props.fontSize}
              onChange={(v) => set("fontSize", v)}
              options={[
                { value: "text-lg md:text-xl", label: "Large" },
                { value: "text-base md:text-lg", label: "Medium" },
                { value: "text-sm", label: "Small" },
              ]}
            />
          </>
        );
      case "image":
        return (
          <>
            <SelectField
              label="Border Radius"
              value={block.props.rounded}
              onChange={(v) => set("rounded", v)}
              options={[
                { value: "rounded-none", label: "None" },
                { value: "rounded-lg", label: "Small" },
                { value: "rounded-2xl", label: "Large" },
              ]}
            />
            <SelectField
              label="Shadow"
              value={block.props.shadow}
              onChange={(v) => set("shadow", v)}
              options={[
                { value: "shadow-none", label: "None" },
                { value: "shadow-lg", label: "Soft" },
                { value: "shadow-2xl shadow-blue-500/10", label: "Colored" },
              ]}
            />
          </>
        );
      case "pricing":
        return (
          <>
            <ColorField label="Background" value={block.props.bgColor} onChange={(v) => set("bgColor", v)} />
            <ColorField label="Accent" value={block.props.accentColor} onChange={(v) => set("accentColor", v)} />
            <ColorField label="Text" value={block.props.textColor} onChange={(v) => set("textColor", v)} />
          </>
        );
      case "form_contact":
        return (
          <>
            <ColorField label="Background" value={block.props.bgColor} onChange={(v) => set("bgColor", v)} />
            <ColorField label="Accent" value={block.props.accentColor} onChange={(v) => set("accentColor", v)} />
            <ColorField label="Text" value={block.props.textColor} onChange={(v) => set("textColor", v)} />
          </>
        );
      case "footer":
        return (
          <>
            <ColorField label="Background" value={block.props.bgColor} onChange={(v) => set("bgColor", v)} />
            <ColorField label="Text" value={block.props.textColor} onChange={(v) => set("textColor", v)} />
          </>
        );
    }
  };

  const renderAdvanced = () => {
    switch (block.type) {
      case "navbar":
        return (
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              Navigation Links
            </p>
            {renderLinks(block.props.links)}
          </div>
        );
      case "grid_custom":
        return (
          <div className="space-y-3">
            <NumberField
              label="Columns Count"
              value={block.props.columnsCount}
              min={1}
              max={4}
              onChange={(v) => set("columnsCount", Math.max(1, Math.min(4, v)))}
            />
            <TextField label="Column Gap" value={block.props.gap} onChange={(v) => set("gap", v)} />
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              Columns
            </p>
            {renderColumns(block.props.columns)}
          </div>
        );
      case "pricing":
        return (
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              Features
            </p>
            {renderFeatures(block.props.features)}
          </div>
        );
      default:
        return (
          <p className="text-xs text-slate-500">
            No advanced fields for this block type.
          </p>
        );
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 p-3">
        <div className="flex items-center space-x-2">
          <Icon className="h-4 w-4 text-blue-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Inspector
          </h2>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-3 border-b border-slate-800 bg-slate-950/60 p-1 text-[11px]">
        {(["content", "style", "advanced"] as InspectorTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg py-1.5 font-medium transition ${
              tab === t
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t === "content" ? "Content" : t === "style" ? "Style" : "Grid / List"}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {tab === "content" ? (
          <>
            <FieldShell label="Layer Name">
              <input
                type="text"
                value={block.props.layerName || ""}
                onChange={(e) => set("layerName", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-blue-500 outline-none text-xs"
              />
            </FieldShell>
            {renderContent()}
          </>
        ) : tab === "style" ? (
          <div className="space-y-3">{renderStyle()}</div>
        ) : (
          renderAdvanced()
        )}
      </div>
    </div>
  );
}

function setLinkField(
  links: NavLink[],
  index: number,
  field: "label" | "url",
  value: string,
  set: (field: string, value: unknown) => void
): void {
  set(
    "links",
    links.map((l, i) => (i === index ? { ...l, [field]: value } : l))
  );
}

function IconButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Remove"
      className="p-1.5 text-slate-500 transition hover:text-red-400"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
    >
      <Plus className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
