"use client";

import type { ReactNode } from "react";
import { Block } from "../lib/block-types";
import { Icon } from "../ui/icon-library";

interface CanvasBlockProps {
  block: Block;
  isSelected?: boolean;
  isPreviewMode?: boolean;
  onSelect?: (blockId: string) => void;
  onMoveUp?: (blockId: string) => void;
  onMoveDown?: (blockId: string) => void;
  onDuplicate?: (blockId: string) => void;
  onDelete?: (blockId: string) => void;
  layerName?: string;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseUp?: () => void;
  children: ReactNode;
}

export function CanvasBlock({
  block,
  isSelected = false,
  isPreviewMode = false,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  layerName,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  children,
}: CanvasBlockProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(block.id);
  };

  return (
    <div
      className={`relative group ${!isPreviewMode ? "block-outline" : ""} ${isSelected && !isPreviewMode ? "ring-2 ring-blue-500" : ""}`}
      onClick={handleClick}
      onMouseDown={(e) => onMouseDown?.(e)}
      onMouseMove={(e: React.MouseEvent) => onMouseMove?.(e)}
      onMouseUp={(e) => {
        e.stopPropagation();
        onMouseUp?.();
      }}
    >
      {isSelected && !isPreviewMode && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-blue-600 text-white text-xs rounded-lg px-2 py-1 shadow-lg whitespace-nowrap">
          <span className="font-medium px-1">{layerName || block.type}</span>
          <button
            className="p-0.5 hover:bg-blue-700 rounded"
            title="Move up"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp?.(block.id);
            }}
          >
            <Icon name="arrowUp" size={14} />
          </button>
          <button
            className="p-0.5 hover:bg-blue-700 rounded"
            title="Move down"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown?.(block.id);
            }}
          >
            <Icon name="arrowDown" size={14} />
          </button>
          <button
            className="p-0.5 hover:bg-blue-700 rounded"
            title="Duplicate"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate?.(block.id);
            }}
          >
            <Icon name="copy" size={14} />
          </button>
          <button
            className="p-0.5 hover:bg-red-600 rounded"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(block.id);
            }}
          >
            <Icon name="trash" size={14} />
          </button>
        </div>
      )}
      {children}
    </div>
  );
}
