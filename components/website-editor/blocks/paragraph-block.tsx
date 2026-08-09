'use client';

import { Block } from '../lib/block-types';
import { InlineText } from '../canvas/inline-text-editor';

interface ParagraphBlockProps {
  block: Block;
  updateProps: (newProps: Record<string, any>) => void;
  isPreviewMode: boolean;
  setIsEditingInline: (editing: boolean) => void;
}

export function ParagraphBlock({
  block,
  updateProps,
  isPreviewMode,
  setIsEditingInline,
}: ParagraphBlockProps) {
  const props = block.props;

  return (
    <div className="py-3 px-6">
      <InlineText
        tagName="p"
        style={{ color: props.textColor, textAlign: props.align || 'center' }}
        className={`${props.fontSize || 'text-base'} ${props.maxWidth || 'max-w-2xl'} mx-auto leading-relaxed block`}
        value={props.text || ''}
        onChange={(value) => updateProps({ text: value })}
        isPreviewMode={isPreviewMode}
        multiline={true}
        setIsEditingInline={setIsEditingInline}
      />
    </div>
  );
}
