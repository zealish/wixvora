"use client";

import type { ReactNode } from "react";
import { memo } from "react";
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

// Custom equality function to prevent unnecessary re-renders
function areEqual(prevProps: CanvasBlockProps, nextProps: CanvasBlockProps) {
  // Block reference changed - need to re-render
  if (prevProps.block !== nextProps.block) return false;
  // Selection state changed
  if (prevProps.isSelected !== nextProps.isSelected) return false;
  // Preview mode toggled
  if (prevProps.isPreviewMode !== nextProps.isPreviewMode) return false;
  
  // If we reach here, props haven't changed enough to warrant re-render
  return true;
}

export const CanvasBlock = memo(function CanvasBlock({
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

  // Determine if block should use absolute positioning
  const isPositioned = block.x !== undefined && block.y !== undefined;

  return (
    <div
      className={`group ${!isPreviewMode ? "block-outline" : ""} ${isSelected && !isPreviewMode ? "ring-2 ring-blue-500" : ""}`}
      style={{
        position: isPositioned ? 'absolute' : 'relative',
        ...(isPositioned && {
          left: `${block.x}px`,
          top: `${block.y}px`,
        }),
      }}
      onClick={handleClick}
      onMouseDown={(e) => onMouseDown?.(e)}
      onMouseMove={(e: React.MouseEvent) => onMouseMove?.(e)}
      onMouseUp={(e) => {
        e.stopPropagation();
        onMouseUp?.();
      }}
    >
      {isSelected && !isPreviewMode && (
        <>
          {/* Traditional toolbar for flow-based blocks */}
          {!isPositioned && (
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
          
          {/* Position-mode toolbar below the block */}
          {isPositioned && (
            <div className="mt-2 flex justify-center gap-1">
              <button
                className="p-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                title="Move up"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp?.(block.id);
                }}
              >
                <Icon name="arrowUp" size={14} />
              </button>
              <button
                className="p-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                title="Move down"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown?.(block.id);
                }}
              >
                <Icon name="arrowDown" size={14} />
              </button>
              <button
                className="p-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                title="Duplicate"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate?.(block.id);
                }}
              >
                <Icon name="copy" size={14} />
              </button>
              <button
                className="p-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
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
        </>
      )}
      {children}
    </div>
  );
}, areEqual);
