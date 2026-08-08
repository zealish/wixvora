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
    <main className="canvas-bg-grid flex flex-1 items-start justify-center overflow-y-auto bg-slate-950 p-4 md:p-8">
      <div
        style={{ backgroundColor: pageSettings.bgColor }}
        className={`relative min-h-[85%] rounded-2xl border border-slate-800/80 shadow-2xl transition-all duration-300 ${canvasWidth} ${pageSettings.fontFamily}`}
      >
        <div className="relative py-4">
          {blocks.map((block) => {
            if (block.hidden) return null;
            const isSelected = selectedBlockId === block.id && !isPreviewMode;

            return (
              <div
                key={block.id}
                onClick={() => !isPreviewMode && onSelectBlock(block.id)}
                className={`group relative cursor-pointer transition ${
                  !isPreviewMode ? "block-outline my-1 py-1" : ""
                } ${isSelected ? "is-selected" : ""}`}
              >
                {!isPreviewMode && isSelected && (
                  <div className="absolute -top-3.5 right-4 z-30 flex items-center space-x-1 rounded-lg bg-blue-600 px-2 py-1 text-xs text-white shadow-xl select-none">
                    <span className="px-1 text-[10px] font-bold tracking-wider text-blue-200 uppercase">
                      {block.props.layerName || block.type}
                    </span>
                    <div className="mx-1 h-3 w-px bg-blue-400" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(block.id, "up");
                      }}
                      title="Move Up"
                      className="rounded p-1 hover:bg-blue-700"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(block.id, "down");
                      }}
                      title="Move Down"
                      className="rounded p-1 hover:bg-blue-700"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(block.id);
                      }}
                      title="Duplicate"
                      className="rounded p-1 hover:bg-blue-700"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(block.id);
                      }}
                      title="Delete"
                      className="rounded p-1 text-red-200 hover:bg-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
