"use client";

import { useEditor } from "../editor-provider";
import { BlockRenderer } from "../blocks/block-renderer";
import { CanvasBlock } from "./canvas-block";
import { Icon } from "../ui/icon-library";
import type { Block } from "../lib/block-types";

export function EditorCanvas() {
  const {
    blocks,
    selectedBlockId,
    isPreviewMode,
    isEditingInline,
    setIsEditingInline,
    viewport,
    pageSettings,
    selectBlock,
    updateProps,
    moveBlockUp,
    moveBlockDown,
    duplicateBlock,
    deleteBlock,
    execFormatCommand,
  } = useEditor();

  const getCanvasWidth = () => {
    switch (viewport) {
      case "mobile":
        return "w-[375px]";
      case "tablet":
        return "w-[768px]";
      default:
        return "w-full max-w-6xl";
    }
  };

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
        className={`${getCanvasWidth()} bg-white shadow-lg rounded-lg device-transition canvas-bg-grid`}
        style={{
          backgroundColor: pageSettings.bgColor || "#ffffff",
          fontFamily: pageSettings.fontFamily || "Inter, sans-serif",
          minHeight: blocks.length === 0 ? '300px' : 'auto',
        }}
      >
        {blocks
          .filter((b: Block) => !b.hidden)
          .map((block: Block) => (
            <CanvasBlock
              key={block.id}
              block={block}
              isSelected={selectedBlockId === block.id}
              isPreviewMode={isPreviewMode}
              onSelect={selectBlock}
              onMoveUp={moveBlockUp}
              onMoveDown={moveBlockDown}
              onDuplicate={duplicateBlock}
              onDelete={deleteBlock}
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
}
