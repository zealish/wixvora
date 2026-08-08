"use client";

import { Eye, EyeOff, ArrowUp, ArrowDown, Trash2, Layers } from "lucide-react";
import type { BlockConfig } from "../../lib/block-types";

interface LayerTreeProps {
  blocks: BlockConfig[];
  selectedBlockId: string | null;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onDelete: (id: string) => void;
}

export function LayerTree({
  blocks,
  selectedBlockId,
  onSelect,
  onToggleVisibility,
  onMove,
  onDelete,
}: LayerTreeProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      <div className="text-xs font-semibold text-slate-400 mb-3 flex items-center justify-between">
        <span>Layer Tree ({blocks.length})</span>
        <span className="text-[10px] text-slate-500">Click to edit</span>
      </div>
      {blocks.map((b, idx) => (
        <div
          key={b.id}
          onClick={() => onSelect(b.id)}
          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition ${
            b.id === selectedBlockId
              ? "bg-blue-600/20 border-blue-500 text-white font-medium"
              : "bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
          }`}
        >
          <div className="flex items-center space-x-2 truncate">
            <span className="text-slate-500 text-[10px] w-4">{idx + 1}.</span>
            <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="capitalize truncate font-medium">
              {b.props.layerName || b.type}
            </span>
          </div>
          <div className="flex items-center space-x-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(b.id);
              }}
              title={b.hidden ? "Show" : "Hide"}
              className="p-1 hover:text-white text-slate-500"
            >
              {b.hidden ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMove(b.id, "up");
              }}
              title="Move up"
              className="p-1 hover:text-white text-slate-500"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMove(b.id, "down");
              }}
              title="Move down"
              className="p-1 hover:text-white text-slate-500"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(b.id);
              }}
              title="Delete"
              className="p-1 hover:text-red-400 text-slate-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
