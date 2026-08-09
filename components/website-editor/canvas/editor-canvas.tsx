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
    draggedBlockIds,
    setZoom,
    setPan,
    setIsPanning,
    setDragStart,
    setItemOffset,
    selectMultipleBlocks,
    toggleBlockSelection,
    clearSelection,
    updateProps,
    setDraggedBlockIds,
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
        // Defensive clamp on keyboard zoom
        setZoom(Math.max(0.25, Math.min(zoom + 0.1, 4)));
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
         
         // Center snap shortcuts (Ctrl/Cmd + E)
         if (selectedBlockIds.length > 0 && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
           e.preventDefault();
           
           try {
             // Get canvas bounds for width calculation
             const canvasRect = canvasRef.current?.getBoundingClientRect();
             if (!canvasRect) return;
             
             // Calculate container dimensions based on viewport
             let containerWidth: number;
             let containerHeight: number;
             
             switch (viewport) {
               case "mobile":
                 containerWidth = 375;
                 containerHeight = 812; // Mobile height for vertical centering
                 break;
               case "tablet":
                 containerWidth = 768;
                 containerHeight = 1024; // Tablet height for vertical centering
                 break;
               default:
                 containerWidth = 1920;
                 containerHeight = 1080; // Desktop height for vertical centering
             }
             
             // Snap selected blocks to center
             selectedBlockIds.forEach((blockId: string) => {
               const block = blocks.find((b: Block) => b.id === blockId);
               if (!block || !block.props?.width) return;
               
               const blockWidth = block.props.width;
               const blockHeight = block.props.height || 0;
               
               // Horizontal and vertical center snap
               const centeredX = (containerWidth - blockWidth) / 2;
               const centerY = (containerHeight - blockHeight) / 2;
               
               // Update block position with snapped coordinates
               updateProps(blockId, { 
                 x: centeredX, 
                 y: centerY 
               });
             });
           } catch (error) {
             console.error("Error snapping to center:", error);
           }
           return;
         }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoom, setZoom, isPanning, setIsPanning, selectBlock, canvasRef, blocks, selectedBlockIds, viewport, updateProps]);
  
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
      
      // Clamp pan values to prevent infinite scrolling
      const MIN_PAN = -50000;
      const MAX_PAN = 50000;
      const newPanX = Math.max(MIN_PAN, Math.min(panX + dx, MAX_PAN));
      const newPanY = Math.max(MIN_PAN, Math.min(panY + dy, MAX_PAN));
      
      setPan(newPanX, newPanY);
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
    
    console.log('[DEBUG] handleItemMouseDown', { blockId });
    
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
     
     // Calculate initial position from mouse to canvas coordinates
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
     
     // For NEW blocks (no x/y), DON'T update position yet. 
     // Just track the offset so subsequent drags work correctly.
     // The first actual movement will set the initial position.
     
     let currentX = block.x ?? 0;
     let currentY = block.y ?? 0;
     
     // itemOffset: how far mouse pointer is from block's position
     // For new blocks that haven't been positioned yet, calculate from click position
     setItemOffset({ 
       x: canvasPos.x - currentX,  
       y: canvasPos.y - currentY   
     });
     
     // Track which block(s) are being dragged
     if (selectedBlockIds.includes(blockId)) {
       setDraggedBlockIds(selectedBlockIds);
     } else {
       setDraggedBlockIds([blockId]);
     }
     
      // Store starting mouse position for delta calculation
      setDragStart({ screenX: e.clientX, screenY: e.clientY });
      
      // Attach global mouse move/up listeners for dragging
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
   }, [isPreviewMode, zoom, panX, panY, selectMultipleBlocks, toggleBlockSelection, selectedBlockIds, selectedBlockId, blocks, canvasRef, setDragStart, setItemOffset, setDraggedBlockIds]);
   
  const handleItemMouseUp = useCallback(() => {
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
    
    setDragStart(null);
    setItemOffset(null);
    setDraggedBlockIds([]);
  }, [setDragStart, setItemOffset, setDraggedBlockIds]);
  
  // Global mouse move handler for dragging (attached to window on drag start)
  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!dragStart || !itemOffset || draggedBlockIds.length === 0) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) {
      console.warn('No canvas rect');
      return;
    }
    
    console.log('[DEBUG] Canvas rect:', canvasRect);
    console.log('[DEBUG] Screen position:', e.clientX, e.clientY);
    
    const canvasPos = screenToCanvas(
      e.clientX,
      e.clientY,
      canvasRect,
      zoom,
      panX,
      panY
    );
    
    console.log('[DEBUG] canvasPos after conversion:', canvasPos);
    
    // Calculate new position (with snap if enabled)
    let newX = canvasPos.x + itemOffset.x;
    let newY = canvasPos.y + itemOffset.y;
    
    console.log('[DEBUG] Final pos before snap - x:', newX, 'y:', newY);
    
    // Apply grid snapping if enabled
    if (gridEnabled) {
      newX = snapToGrid(newX, gridSize);
      newY = snapToGrid(newY, gridSize);
    }
    
    console.log('[DEBUG] Final pos after snap - x:', newX, 'y:', newY);
    
    // Update position for each dragged block
    draggedBlockIds.forEach(id => {
      console.log('[DEBUG] About to update block', id);
      updateProps(id, { x: newX, y: newY });
      console.log('[DEBUG] Block updated');
    });
  }, [dragStart, itemOffset, draggedBlockIds, zoom, panX, panY, gridEnabled, gridSize, updateProps]);
  
  const handleGlobalMouseUp = useCallback(() => {
    handleItemMouseUp();
  }, [handleItemMouseUp]);

  // Deselect block when clicking on canvas background
  const handleClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

   return (
     <div className="flex-1 overflow-hidden bg-gray-100">
       {/* Scrollable wrapper for the entire editor */}
       <div className="h-full overflow-auto flex flex-col items-center py-8 px-4">
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

         {/* Canvas Container with scroll */}
         <div className={`${getCanvasWidth} relative`}>
         {/* Actual Canvas Content */}
         <div
            className={`bg-white shadow-lg rounded-lg device-transition overflow-hidden relative`}
           style={{
             backgroundColor: pageSettings.bgColor || "#ffffff",
             fontFamily: pageSettings.fontFamily || "Inter, sans-serif",
             minHeight: blocks.length === 0 ? '300px' : 'auto',
             // Apply ZOOM ONLY (not pan). Pan is handled separately.
             transform: `scale(${zoom})`,
             transformOrigin: 'top left',
             width: '100%',
           }}
           ref={canvasRef}
           onWheel={handleWheel}
           onMouseDown={handleMouseDown}
           onMouseMove={handleMouseMove}
           onMouseUp={handleMouseUp}
           onMouseLeave={handleMouseUp}
           onClick={handleClick}
         >
           {/* Grid Overlay - positioned absolutely inside scaled canvas */}
           <div
             className="pointer-events-none absolute inset-0"
             style={{
               zIndex: 0,
             }}
           >
             <GridOverlay
               showGrid={gridEnabled}
               gridSize={gridSize}
               zoom={zoom}
               panX={panX}
               panY={panY}
             />
           </div>
           
           {/* Wrapper div that handles pan translation and contains all blocks */}
           <div
             className="relative overflow-hidden"
             style={{
               minHeight: blocks.length === 0 ? '300px' : 'auto',
               transform: `translate(${panX}px, ${panY}px)`,
               transformOrigin: 'top left',
               willChange: 'transform',
             }}
           >
             {blocks
               .filter((b: Block) => !b.hidden)
               .map((block: Block) => (
                 <CanvasBlock
                   key={block.id}
                   block={block}
                   isSelected={selectedBlockIds.includes(block.id)}
                   isDragging={selectedBlockIds.includes(block.id) && !!dragStart}
                   isPreviewMode={isPreviewMode}
                   onSelect={selectMultipleBlocks}
                   onMoveUp={moveBlockUp}
                   onMoveDown={moveBlockDown}
                   onDuplicate={duplicateBlock}
                   onDelete={deleteBlock}
                   onMouseDown={(e) => handleItemMouseDown(e, block.id)}
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
         </div>
       </div>
     </div>
   );
}); // EditorCanvas wrapped in memo - children handle their own re-render optimization
