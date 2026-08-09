'use client';

import { Block } from '../lib/block-types';
import { CanvasBlock } from '../canvas/canvas-block';
import { BlockRenderer } from './block-renderer';
import { useEditor } from '../editor-provider';
import { Icon } from '../ui/icon-library';

interface ContainerBlockProps {
  block: Block;
  updateProps: (newProps: Record<string, any>) => void;
  isPreviewMode: boolean;
  setIsEditingInline: (editing: boolean) => void;
}

export function ContainerBlock({
  block,
  isPreviewMode,
  setIsEditingInline,
}: ContainerBlockProps) {
  const props = block.props;
  const {
    selectedBlockId,
    selectBlock,
    updateProps: updateBlockProps,
    moveBlockUp,
    moveBlockDown,
    duplicateBlock,
    deleteBlock,
  } = useEditor();

  const children = block.children || [];

  return (
    <div
      style={{
        backgroundColor: props.bgColor,
        color: props.textColor,
        borderColor: props.borderColor,
      }}
      className={`${props.paddingY || 'py-12'} ${props.paddingX || 'px-6'} ${props.borderRadius || 'rounded-2xl'} ${props.borderWidth || 'border'} ${props.bgGradient || ''} max-w-6xl mx-auto my-4 transition-all`}
    >
      {children.length > 0 ? (
        <div className="space-y-4">
          {children.map((child: Block) => (
            <CanvasBlock
              key={child.id}
              block={child}
              isSelected={selectedBlockId === child.id}
              isPreviewMode={isPreviewMode}
              onSelect={selectBlock}
              onMoveUp={moveBlockUp}
              onMoveDown={moveBlockDown}
              onDuplicate={duplicateBlock}
              onDelete={deleteBlock}
            >
              <BlockRenderer
                block={child}
                updateProps={updateBlockProps}
                isPreviewMode={isPreviewMode}
                setIsEditingInline={setIsEditingInline}
              />
            </CanvasBlock>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-300 rounded-lg text-slate-400">
          <Icon name="plus" size={24} />
          <p className="mt-2 text-sm">Klik blok di panel kiri untuk menambahkan ke container ini</p>
        </div>
      )}
    </div>
  );
}

