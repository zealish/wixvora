'use client';

import { Block } from '../lib/block-types';
import { InlineText } from '../canvas/inline-text-editor';
import { CanvasBlock } from '../canvas/canvas-block';
import { BlockRenderer } from './block-renderer';
import { useEditor } from '../editor-provider';
import { Icon } from '../ui/icon-library';
import type { IconName } from '../ui/icon-library';

interface GridCustomBlockProps {
  block: Block;
  updateProps: (newProps: Record<string, any>) => void;
  isPreviewMode: boolean;
  setIsEditingInline: (editing: boolean) => void;
}

export function GridCustomBlock({
  block,
  updateProps,
  isPreviewMode,
  setIsEditingInline,
}: GridCustomBlockProps) {
  const props = block.props;
  const {
    selectMultipleBlocks,
    updateProps: updateBlockProps,
    moveBlockUp,
    moveBlockDown,
    duplicateBlock,
    deleteBlock,
  } = useEditor();

  const children = block.children || [];

  const handleColumnChange = (index: number, field: string, value: any) => {
    const newCols = [...(props.columns || [])];
    newCols[index] = { ...newCols[index], [field]: value };
    updateProps({ columns: newCols });
  };

  return (
    <div className="py-12 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-10 space-y-2">
        <InlineText
          tagName="h2"
          className="text-2xl md:text-3xl font-extrabold text-slate-900 block"
          value={props.title || ''}
          onChange={(value) => updateProps({ title: value })}
          isPreviewMode={isPreviewMode}
          setIsEditingInline={setIsEditingInline}
        />
        <InlineText
          tagName="p"
          className="text-xs text-slate-500 block"
          value={props.subtitle || ''}
          onChange={(value) => updateProps({ subtitle: value })}
          isPreviewMode={isPreviewMode}
          setIsEditingInline={setIsEditingInline}
        />
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${props.columnsCount || 3}, minmax(0, 1fr))`,
        }}
        className={`${props.gap || 'gap-6'}`}
      >
        {props.columns && props.columns.map((col: any, idx: number) => (
          <div
            key={idx}
            style={{ backgroundColor: col.bgColor || '#ffffff', color: col.textColor || '#0f172a' }}
            className="p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between transition-all"
          >
            <div>
              <div style={{ color: col.accentColor || '#2563eb' }} className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4 text-lg">
                <Icon name={(col.icon || 'sparkles') as IconName} className="w-5 h-5" />
              </div>
              <InlineText
                tagName="h3"
                className="text-base font-bold mb-2 block text-slate-900"
                value={col.title || ''}
                onChange={(value) => handleColumnChange(idx, 'title', value)}
                isPreviewMode={isPreviewMode}
                setIsEditingInline={setIsEditingInline}
              />
              <InlineText
                tagName="p"
                className="text-xs opacity-80 leading-relaxed mb-6 block text-slate-600"
                value={col.desc || ''}
                onChange={(value) => handleColumnChange(idx, 'desc', value)}
                isPreviewMode={isPreviewMode}
                multiline={true}
                setIsEditingInline={setIsEditingInline}
              />
            </div>
            {col.btnText && (
              <a
                href={col.btnUrl || '#'}
                style={{ backgroundColor: col.accentColor || '#2563eb' }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-white shadow-sm text-center inline-block"
                onClick={(e) => !isPreviewMode && e.preventDefault()}
              >
                <InlineText
                  value={col.btnText || ''}
                  onChange={(value) => handleColumnChange(idx, 'btnText', value)}
                  isPreviewMode={isPreviewMode}
                  setIsEditingInline={setIsEditingInline}
                />
              </a>
            )}
          </div>
        ))}
      </div>

      {children.length > 0 && (
        <div className="mt-8 space-y-4">
          {children.map((child: Block) => (
            <CanvasBlock
              key={child.id}
              block={child}
              isPreviewMode={isPreviewMode}
              onSelect={(ids) => selectMultipleBlocks(ids, false)}
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
      )}
    </div>
  );
}
