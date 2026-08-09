"use client";

import { useEditor } from "../editor-provider";
import { Icon } from "../ui/icon-library";
import { COLOR_PALETTES } from "../lib/color-palettes";

interface ColumnEditorProps {
  column: any;
  index: number;
  onChange: (field: string, value: any) => void;
  onRemove: () => void;
}

function ColumnEditor({ column, index, onChange, onRemove }: ColumnEditorProps) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-200 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700">Kolom {index + 1}</span>
        <button
          onClick={onRemove}
          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Icon name="trash" size={14} />
        </button>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">Judul</label>
        <input
          type="text"
          value={column.title || ""}
          onChange={(e) => onChange("title", e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">Deskripsi</label>
        <textarea
          value={column.desc || ""}
          onChange={(e) => onChange("desc", e.target.value)}
          rows={2}
          className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">Warna Latar</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={column.bgColor || "#f8fafc"}
            onChange={(e) => onChange("bgColor", e.target.value)}
            className="h-7 w-7 cursor-pointer rounded border border-slate-200"
          />
          <input
            type="text"
            value={column.bgColor || ""}
            onChange={(e) => onChange("bgColor", e.target.value)}
            placeholder="#f8fafc"
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 font-mono text-xs text-slate-900 outline-none focus:border-blue-500"
          />
        </div>
        <div className="grid grid-cols-10 gap-1 pt-1">
          {COLOR_PALETTES.map((c) => (
            <button
              key={c}
              onClick={() => onChange("bgColor", c)}
              className={`h-5 w-5 rounded border transition-transform hover:scale-110 ${
                column.bgColor === c ? "ring-2 ring-blue-500 ring-offset-1" : "border-slate-200"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">Warna Aksen</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={column.accentColor || "#2563eb"}
            onChange={(e) => onChange("accentColor", e.target.value)}
            className="h-7 w-7 cursor-pointer rounded border border-slate-200"
          />
          <input
            type="text"
            value={column.accentColor || ""}
            onChange={(e) => onChange("accentColor", e.target.value)}
            placeholder="#2563eb"
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 font-mono text-xs text-slate-900 outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

export function GridTab() {
  const { activeBlock, updateBlockProps } = useEditor();
  if (!activeBlock) return null;

  if (activeBlock.type !== "grid_custom") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Icon name="grid" size={32} className="mb-3 text-slate-300" />
        <p className="text-sm text-slate-500">
          Pengaturan kolom/grid hanya tersedia untuk blok tipe Grid Custom.
        </p>
      </div>
    );
  }

  const props = activeBlock.props;
  const columns = props.columns || [];

  const updateColumn = (index: number, field: string, value: any) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    updateBlockProps({ columns: newColumns });
  };

  const addColumn = () => {
    updateBlockProps({
      columns: [...columns, { icon: "Box", title: "Kolom Baru", desc: "Deskripsi kolom" }],
    });
  };

  const removeColumn = (index: number) => {
    updateBlockProps({ columns: columns.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">Jumlah Kolom</label>
        <select
          value={props.gridCols || "grid-cols-1 md:grid-cols-3"}
          onChange={(e) => updateBlockProps({ gridCols: e.target.value })}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
        >
          <option value="grid-cols-1">1 Kolom</option>
          <option value="grid-cols-1 md:grid-cols-2">2 Kolom</option>
          <option value="grid-cols-1 md:grid-cols-3">3 Kolom</option>
          <option value="grid-cols-1 md:grid-cols-4">4 Kolom</option>
        </select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-600">Daftar Kolom</label>
          <button
            onClick={addColumn}
            className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100"
          >
            <Icon name="plus" size={12} />
            Tambah
          </button>
        </div>

        {columns.map((col: any, i: number) => (
          <ColumnEditor
            key={i}
            column={col}
            index={i}
            onChange={(field, value) => updateColumn(i, field, value)}
            onRemove={() => removeColumn(i)}
          />
        ))}
      </div>
    </div>
  );
}
