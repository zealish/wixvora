"use client";

import { useEffect, useRef, useCallback, useMemo, memo } from "react";
import { useEditor } from "../editor-provider";
import { BlockRenderer } from "../blocks/block-renderer";
import { CanvasBlock } from "./canvas-block";
import { Icon } from "../ui/icon-library";
import type { Block } from "../lib/block-types";
import { screenToCanvas, snapToGrid } from "../lib/coordinate-utils";
import { GridOverlay } from "./grid-overlay";

export const EditorCanvas = memo(function EditorCanvas() {
  const {
    blocks,
    selectedBlockId,
    selectedBlockIds,
    isPreviewMode,
    isEditingInline,
    setIsEditingInline,
    viewport,
    pageSettings,
    selectBlock,
    selectMultipleBlocks,
    toggleBlockSelection,
    clearSelection,
    updateProps,
    moveBlockUp,
    moveBlockDown,
    duplicateBlock,
    deleteBlock,
    execFormatCommand,
    // Canvas state & controls
    zoom,
    panX,
    panY,
    isPanning,
    gridEnabled,
    gridSize,
    dragStart,
    itemOffset,
    setZoom,
    setPan,
    setIsPanning,
    setDragStart,
    setItemOffset,
  } = useEditor();
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Memoize viewport width classes to prevent recreating on every render
  const getCanvasWidth = useMemo(() => {
    switch (viewport) {
      case "mobile":
        return "w-[375px]";
      case "tablet":
        return "w-[768px]";
      default:
        return "w-full max-w-6xl";
    }
  }, [viewport]);
  
  // Keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "+" || (e.ctrlKey || e.metaKey) && e.key === "=") {
        e.preventDefault();
        setZoom(zoom + 0.1);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setZoom(Math.max(0.25, zoom - 0.1));
      }
      
      // Hand tool shortcut 'h' key
      if (e.key.toLowerCase() === "h" && !isPanning) {
        setIsPanning(true);
      }
      
       // Escape to deselect
       if (e.key === "Escape") {
         clearSelection();
       }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoom, setZoom, isPanning, setIsPanning, selectBlock]);
  
  // Keyboard shortcuts for block editing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing inline text or interacting with input elements
      if (isEditingInline) return;
      
      // Check if event target is an input/select/textarea to avoid triggering shortcuts while typing
      const target = e.target as HTMLElement;
      const isTextInput = 
        target.tagName === "INPUT" || 
        target.tagName === "SELECT" || 
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      
      if (isTextInput) return;
      
      // Delete all selected blocks (Delete key only, not Backspace)
      if (selectedBlockIds.length > 0 && e.key === "Delete") {
        e.preventDefault();
        try {
          selectedBlockIds.forEach((id: string) => deleteBlock(id));
        } catch (error) {
          console.error("Error deleting blocks:", error);
        }
        clearSelection();
        return;
      }
      
      // Duplicate all selected blocks (Ctrl/Cmd + D)
      if (
        selectedBlockIds.length > 0 &&
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "d"
      ) {
        e.preventDefault();
        try {
          selectedBlockIds.forEach((id: string) => duplicateBlock(id));
        } catch (error) {
          console.error("Error duplicating blocks:", error);
        }
        return;
      }
      
      // Group/Ungroup blocks (Shift + G) - apply to all selected
      if (
        selectedBlockIds.length > 0 &&
        e.shiftKey &&
        e.key.toLowerCase() === "g"
      ) {
        e.preventDefault();
        
        // TODO: Implement actual group/ungroup functionality
        // For now, just log and provide visual feedback
        try {
          const selectedBlocks = blocks.filter((b: Block) => selectedBlockIds.includes(b.id));
          if (selectedBlocks.length > 0) {
            console.log(`Group action: Grouping ${selectedBlocks.length} block(s)`);
            // Future implementation: call a groupBlocks or ungroupBlocks function
          }
        } catch (error) {
          console.error("Error performing group action:", error);
        }
        return;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    selectedBlockIds,
    isEditingInline,
    deleteBlock,
    duplicateBlock,
    blocks,
    clearSelection,
  ]);

  
  // Handle wheel zoom centered on cursor
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      const newZoom = Math.max(0.25, Math.min(zoom + delta, 4));
      
      // Zoom toward cursor position
      setZoom(newZoom);
    } else if (!isPanning) {
      // Normal scrolling behavior
      return;
    }
  }, [zoom, isPanning, setZoom]);
  
  // Handle canvas pan with spacebar or middle mouse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsPanning(true);
        document.body.style.cursor = "grab";
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsPanning(false);
        document.body.style.cursor = "default";
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [setIsPanning]);
  
  // Handle middle mouse button panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 && !lastMousePos.current) { // Middle mouse button
      e.preventDefault();
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      setIsPanning(true);
    }
  }, [setIsPanning]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Pan canvas when dragging with middle mouse
    if (lastMousePos.current && e.buttons === 4) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      
      setPan(panX + dx, panY + dy);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  }, [setPan, panX, panY]);
  
  const handleMouseUp = useCallback(() => {
    if (lastMousePos.current) {
      setIsPanning(false);
      lastMousePos.current = { x: 0, y: 0 };
    }
  }, [setIsPanning]);
  
  // Handle item selection and drag
  const handleItemMouseDown = useCallback((e: React.MouseEvent, blockId: string) => {
    if (e.button !== 0 || isPreviewMode) return; // Left click only
    
    e.stopPropagation();
    
    // Check for Shift key - if pressed, toggle this block in multi-selection
    if (e.shiftKey && selectedBlockIds.length > 0) {
      // Toggle the clicked block
      toggleBlockSelection(blockId);
    } else if (e.shiftKey && selectedBlockIds.length === 0) {
      // First block with shift - just select it
      toggleBlockSelection(blockId);
    } else {
      // Normal click - clear all and select just this block
      selectMultipleBlocks([blockId], false);
    }
    
    // Calculate initial offset from mouse to block top-left corner
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const canvasPos = screenToCanvas(
      e.clientX,
      e.clientY,
      canvasRect,
      zoom,
      panX,
      panY
    );
    
    const block = blocks.find((b: Block) => b.id === blockId);
    if (!block) return;
    
    const currentBlockX = block.x ?? 0;
    const currentBlockY = block.y ?? 0;
    
    // Store start position for delta-based dragging
    setDragStart({ screenX: e.clientX, screenY: e.clientY });
    setItemOffset({ 
      x: canvasPos.x - currentBlockX, 
      y: canvasPos.y - currentBlockY 
    });
  }, [isPreviewMode, zoom, panX, panY, selectMultipleBlocks, toggleBlockSelection, selectedBlockIds, blocks, canvasRef, setDragStart, setItemOffset]);
  
  const handleItemMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragStart || !selectedBlockId || !itemOffset) return;
    
    // Get current mouse position in canvas coordinates
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const canvasPos = screenToCanvas(
      e.clientX,
      e.clientY,
      canvasRect,
      zoom,
      panX,
      panY
    );
    
    // Calculate new position using delta from dragStart
    let newX = canvasPos.x - itemOffset.x;
    let newY = canvasPos.y - itemOffset.y;
    
    // Apply grid snapping if enabled
    if (gridEnabled) {
      newX = snapToGrid(newX, gridSize);
      newY = snapToGrid(newY, gridSize);
    }
    
    // Update block position (maintains width/height, updates x/y)
    updateProps(selectedBlockId, { x: newX, y: newY });
  }, [dragStart, selectedBlockId, itemOffset, zoom, panX, panY, gridEnabled, gridSize, updateProps]);
  
  const handleItemMouseUp = useCallback(() => {
    setDragStart(null);
    setItemOffset(null);
  }, [setDragStart, setItemOffset]);
  
  // Deselect block when clicking on canvas background
  const handleClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  return (
    <div className="flex-1 overflow-auto bg-gray-100 flex flex-col items-center py-8 px-4">
      {isEditingInline && !isPreviewMode && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-lg">
          <button
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700"
            title="Bold"
            onClick={() => execFormatCommand("bold")}
          >
            <Icon name="bold" size={16} />
          </button>
          <button
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700"
            title="Italic"
            onClick={() => execFormatCommand("italic")}
          >
            <Icon name="italic" size={16} />
          </button>
          <button
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700"
            title="Underline"
            onClick={() => execFormatCommand("underline")}
          >
            <Icon name="underline" size={16} />
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700"
            title="Align left"
            onClick={() => execFormatCommand("justifyLeft")}
          >
            <Icon name="alignLeft" size={16} />
          </button>
          <button
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700"
            title="Align center"
            onClick={() => execFormatCommand("justifyCenter")}
          >
            <Icon name="alignCenter" size={16} />
          </button>
          <button
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700"
            title="Align right"
            onClick={() => execFormatCommand("justifyRight")}
          >
            <Icon name="alignRight" size={16} />
          </button>
        </div>
      )}

       <div
         className={`${getCanvasWidth} bg-white shadow-lg rounded-lg device-transition overflow-hidden relative`}
        style={{
          backgroundColor: pageSettings.bgColor || "#ffffff",
          fontFamily: pageSettings.fontFamily || "Inter, sans-serif",
          minHeight: blocks.length === 0 ? '300px' : 'auto',
          // Apply zoom and pan transform (visual only, doesn't change data)
          transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
          transformOrigin: 'top left',
        }}
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
      >
        {/* Grid Overlay */}
        <GridOverlay
          showGrid={gridEnabled}
          gridSize={gridSize}
          zoom={zoom}
          panX={panX}
          panY={panY}
        />
        
        {blocks
          .filter((b: Block) => !b.hidden)
          .map((block: Block) => (
            <CanvasBlock
              key={block.id}
              block={block}
              isSelected={selectedBlockIds.includes(block.id)}
              isDragging={selectedBlockIds.includes(block.id) && !!dragStart} // Show drag feedback when this block is being dragged
              isPreviewMode={isPreviewMode}
              onSelect={selectMultipleBlocks}
              onMoveUp={moveBlockUp}
              onMoveDown={moveBlockDown}
              onDuplicate={duplicateBlock}
              onDelete={deleteBlock}
              onMouseDown={(e) => handleItemMouseDown(e, block.id)}
              onMouseMove={(e: React.MouseEvent) => handleItemMouseMove(e)}
              onMouseUp={handleItemMouseUp}
            >
              <BlockRenderer
                block={block}
                updateProps={updateProps}
                isPreviewMode={isPreviewMode}
                setIsEditingInline={setIsEditingInline}
              />
            </CanvasBlock>
          ))}
      </div>
    </div>
  );
}); // EditorCanvas wrapped in memo - children handle their own re-render optimization
