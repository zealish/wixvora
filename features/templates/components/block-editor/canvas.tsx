"use client";

import type { BlockConfig, PageSettings } from "../../lib/block-types";
import { BlockRenderer } from "./block-renderer";
import { ArrowUp, ArrowDown, Copy, Trash2 } from "lucide-react";
import type { Viewport } from "./hooks/use-block-editor";

interface EditorCanvasProps {
  blocks: BlockConfig[];
  pageSettings: PageSettings;
  viewport: Viewport;
  selectedBlockId: string | null;
  isPreviewMode: boolean;
  onSelectBlock: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function EditorCanvas({
  blocks,
  pageSettings,
  viewport,
  selectedBlockId,
  isPreviewMode,
  onSelectBlock,
  onMove,
  onDuplicate,
  onDelete,
}: EditorCanvasProps) {
  const canvasWidth =
    viewport === "desktop"
      ? "w-full max-w-6xl"
      : viewport === "tablet"
        ? "w-[768px]"
        : "w-[375px]";

  return (
    <main className="canvas-bg-grid flex-1 bg-slate-950 overflow-y-auto p-4 md:p-8 flex justify-center items-start">
      <div
        style={{ backgroundColor: pageSettings.bgColor }}
        className={`shadow-2xl rounded-2xl border border-slate-800/80 transition-all duration-300 relative min-h-[85%] ${canvasWidth} ${pageSettings.fontFamily}`}
      >
        <div className="relative py-4">
          {blocks.map((block) => {
            if (block.hidden) return null;
            const isSelected = selectedBlockId === block.id && !isPreviewMode;

            return (
              <div
                key={block.id}
                onClick={() => !isPreviewMode && onSelectBlock(block.id)}
                className={`relative group transition cursor-pointer ${
                  !isPreviewMode ? "block-outline my-1 py-1" : ""
                } ${isSelected ? "is-selected" : ""}`}
              >
                {!isPreviewMode && isSelected && (
                  <div className="absolute -top-3.5 right-4 bg-blue-600 text-white rounded-lg shadow-xl flex items-center space-x-1 px-2 py-1 z-30 text-xs select-none">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1 text-blue-200">
                      {block.props.layerName || block.type}
                    </span>
                    <div className="h-3 w-px bg-blue-400 mx-1" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(block.id, "up");
                      }}
                      title="Move Up"
                      className="p-1 hover:bg-blue-700 rounded"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(block.id, "down");
                      }}
                      title="Move Down"
                      className="p-1 hover:bg-blue-700 rounded"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(block.id);
                      }}
                      title="Duplicate"
                      className="p-1 hover:bg-blue-700 rounded"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(block.id);
                      }}
                      title="Delete"
                      className="p-1 hover:bg-red-600 rounded text-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <BlockRenderer block={block} />
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
