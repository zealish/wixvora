"use client";

import { useEffect, memo } from "react";
import { useEditor } from "../editor-provider";
import { BlockRenderer } from "../blocks/block-renderer";
import { Icon } from "../ui/icon-library";
import { getLayout, getSectionHeight, VIEWPORT_WIDTHS } from "../lib/viewport-utils";

export const EditorCanvas = memo(function EditorCanvas() {
  const {
    blocks,
    selectedBlockId,
    selectedBlockIds,
    isPreviewMode,
    isEditingInline,
    setIsEditingInline,
    viewport,
    selectBlock,
    duplicateBlock,
    deleteBlock,
    execFormatCommand,
    gridEnabled,
    clearSelection,
    updateProps,
    // Section state
    sections,
    selectedSectionId,
    selectSection,
    updateBlockLayout,
    updateSectionHeight,
  } = useEditor();
  
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
      
      // Escape to deselect
      if (e.key === "Escape") {
        clearSelection();
      }
      
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

   return (
     <div className="flex-1 overflow-hidden bg-gray-100">
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

       <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center relative">
         {/* Viewport indicator */}
         {!isPreviewMode && (
           <div className="mb-3 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold shadow-sm flex items-center space-x-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span>Viewport: <strong className="text-blue-600 uppercase">{viewport}</strong> ({VIEWPORT_WIDTHS[viewport]}px)</span>
           </div>
         )}

         {/* Sections container */}
         <div
           className="bg-white shadow-xl rounded-2xl overflow-hidden mb-16 shrink-0 relative border border-slate-200"
           style={{ width: VIEWPORT_WIDTHS[viewport] }}
         >
           {sections.map((section) => {
             const sectionHeight = getSectionHeight(section, viewport);
             const isSectionSelected = selectedSectionId === section.id && !isPreviewMode;

             return (
               <section
                 key={section.id}
                 onClick={() => !isPreviewMode && selectSection(section.id)}
                 className={`relative w-full ${section.bgGradient || ''} ${isSectionSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                 style={{
                   height: sectionHeight,
                   backgroundColor: section.bgColor
                 }}
               >
                 {/* Section label */}
                 {!isPreviewMode && isSectionSelected && (
                   <div className="absolute top-2 left-2 z-30 flex items-center space-x-2">
                     <span className="px-2.5 py-1 rounded-lg bg-white/95 text-slate-800 text-[10px] font-bold tracking-wider border border-slate-200 shadow-sm">
                       SECTION: {section.title} ({sectionHeight}px)
                     </span>
                   </div>
                 )}

                 {/* Section resize handle */}
                 {!isPreviewMode && isSectionSelected && (
                   <div
                     onMouseDown={(e) => {
                       e.stopPropagation();
                       const startY = e.clientY;
                       const startHeight = sectionHeight;

                       const handleMove = (moveE: MouseEvent) => {
                         const delta = moveE.clientY - startY;
                         let newH = Math.max(150, startHeight + delta);
                         if (gridEnabled) newH = Math.round(newH / 20) * 20;
                         updateSectionHeight(section.id, newH);
                       };

                       const handleUp = () => {
                         window.removeEventListener('mousemove', handleMove);
                         window.removeEventListener('mouseup', handleUp);
                       };

                       window.addEventListener('mousemove', handleMove);
                       window.addEventListener('mouseup', handleUp);
                     }}
                     className="absolute bottom-0 left-0 right-0 h-4 bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center cursor-s-resize z-30 transition"
                     title="Drag to resize section height"
                   >
                     <div className="text-[9px] font-extrabold uppercase tracking-widest">
                       Height ({viewport.toUpperCase()}): {sectionHeight}px
                     </div>
                   </div>
                 )}

                 {/* Blocks within section */}
                 <div className="relative h-full w-full">
                   {section.blocks.map((block) => {
                     const layout = getLayout(block, viewport);
                     const isSelected = selectedBlockId === block.id && !isPreviewMode;

                     return (
                       <div
                         key={block.id}
                         onMouseDown={(e) => {
                           e.stopPropagation();
                           selectBlock(block.id);
                           selectSection(section.id);
                           
                           const startX = e.clientX;
                           const startY = e.clientY;
                           const startLayout = { ...layout };

                           const handleMove = (moveE: MouseEvent) => {
                             const deltaX = moveE.clientX - startX;
                             const deltaY = moveE.clientY - startY;
                             let newX = startLayout.x + deltaX;
                             let newY = startLayout.y + deltaY;
                             
                             if (gridEnabled) {
                               newX = Math.round(newX / 10) * 10;
                               newY = Math.round(newY / 10) * 10;
                             }
                             
                             updateBlockLayout(section.id, block.id, viewport, { x: newX, y: newY });
                           };

                           const handleUp = () => {
                             window.removeEventListener('mousemove', handleMove);
                             window.removeEventListener('mouseup', handleUp);
                           };

                           window.addEventListener('mousemove', handleMove);
                           window.addEventListener('mouseup', handleUp);
                         }}
                         className={`absolute ${!isPreviewMode ? 'element-outline' : ''} ${isSelected ? 'is-selected' : ''}`}
                         style={{
                           left: layout.x,
                           top: layout.y,
                           width: layout.width,
                           height: layout.height,
                           zIndex: block.zIndex || 10,
                           opacity: layout.hidden ? 0.35 : 1,
                           display: layout.hidden && isPreviewMode ? 'none' : 'block'
                         }}
                       >
                         {/* Position indicator */}
                         {!isPreviewMode && isSelected && (
                           <div className="absolute -top-6 left-0 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-t-md shadow-sm pointer-events-none z-40 whitespace-nowrap">
                             [{viewport.toUpperCase()}] X:{layout.x}, Y:{layout.y}
                           </div>
                         )}

                         {/* Hidden badge */}
                         {!isPreviewMode && layout.hidden && (
                           <div className="absolute top-1 right-1 bg-amber-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow z-40 pointer-events-none uppercase">
                             Hidden ({viewport})
                           </div>
                         )}

                         <BlockRenderer 
                           block={block}
                           updateProps={updateProps}
                           isPreviewMode={isPreviewMode}
                           setIsEditingInline={setIsEditingInline}
                         />

                         {/* Resize handles */}
                         {!isPreviewMode && isSelected && (
                           <>
                             <div
                               onMouseDown={(e) => {
                                 e.stopPropagation();
                                 const startX = e.clientX;
                                 const startY = e.clientY;
                                 const startW = layout.width;
                                 const startH = layout.height;

                                 const handleMove = (moveE: MouseEvent) => {
                                   let newW = Math.max(30, startW + (moveE.clientX - startX));
                                   let newH = Math.max(20, startH + (moveE.clientY - startY));
                                   if (gridEnabled) {
                                     newW = Math.round(newW / 10) * 10;
                                     newH = Math.round(newH / 10) * 10;
                                   }
                                   updateBlockLayout(section.id, block.id, viewport, { width: newW, height: newH });
                                 };

                                 const handleUp = () => {
                                   window.removeEventListener('mousemove', handleMove);
                                   window.removeEventListener('mouseup', handleUp);
                                 };

                                 window.addEventListener('mousemove', handleMove);
                                 window.addEventListener('mouseup', handleUp);
                               }}
                               className="absolute bottom-0 right-0 w-3 h-3 bg-blue-600 border-2 border-white rounded-sm cursor-se-resize z-50 shadow"
                             />
                           </>
                         )}
                       </div>
                     );
                   })}
                 </div>
               </section>
             );
           })}
         </div>
       </div>
     </div>
   );
}); // EditorCanvas wrapped in memo - children handle their own re-render optimization
