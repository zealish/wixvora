"use client";

import { useEditor } from "../editor-provider";
import { Icon } from "../ui/icon-library";
import type { Block } from "../lib/block-types";

function LayerItem({
  block,
  depth = 0,
}: {
  block: Block;
  depth?: number;
}) {
  const {
    selectedBlockId,
    selectBlock,
    toggleBlockVisibility,
    moveBlockUp,
    moveBlockDown,
    deleteBlock,
  } = useEditor();

  const isSelected = selectedBlockId === block.id;
  const hasChildren = block.children && block.children.length > 0;

  return (
    <div>
      <div
        onClick={() => selectBlock(block.id)}
        className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${
          isSelected
            ? "bg-blue-50 text-blue-700"
            : "text-slate-600 hover:bg-slate-50"
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {hasChildren && (
          <span className="shrink-0 text-slate-400 text-xs">▸</span>
        )}
        {!hasChildren && <span className="w-3" />}
        <Icon name="layers" size={14} className="shrink-0 text-slate-400" />
        <span className="flex-1 truncate capitalize">
          {block.props?.layerName || block.type.replace("_", " ")}
        </span>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBlockVisibility(block.id);
            }}
            className="rounded p-1 hover:bg-slate-200"
            title={block.hidden ? "Tampilkan" : "Sembunyikan"}
          >
            <Icon
              name={block.hidden ? "eyeOff" : "eye"}
              size={14}
              className={block.hidden ? "text-slate-300" : "text-slate-500"}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              moveBlockUp(block.id);
            }}
            className="rounded p-1 hover:bg-slate-200"
            title="Pindah ke atas"
          >
            <Icon name="arrowUp" size={14} className="text-slate-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              moveBlockDown(block.id);
            }}
            className="rounded p-1 hover:bg-slate-200"
            title="Pindah ke bawah"
          >
            <Icon name="arrowDown" size={14} className="text-slate-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteBlock(block.id);
            }}
            className="rounded p-1 hover:bg-red-100"
            title="Hapus"
          >
            <Icon name="trash" size={14} className="text-slate-500 hover:text-red-500" />
          </button>
        </div>
      </div>
      {hasChildren && (
        <div>
          {block.children!.map((child) => (
            <LayerItem key={child.id} block={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function LayerManager() {
  const { blocks } = useEditor();

  return (
    <div className="h-full overflow-y-auto p-3">
      {blocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Icon name="layers" size={32} />
          <p className="mt-2 text-sm">Belum ada blok</p>
        </div>
      ) : (
        <div className="space-y-1">
          {blocks.map((block: Block) => (
            <LayerItem key={block.id} block={block} />
          ))}
        </div>
      )}
    </div>
  );
}
