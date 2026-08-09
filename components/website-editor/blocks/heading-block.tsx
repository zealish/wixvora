'use client';

import { Block } from '../lib/block-types';
import { InlineText } from '../canvas/inline-text-editor';

interface HeadingBlockProps {
  block: Block;
  updateProps: (newProps: Record<string, any>) => void;
  isPreviewMode: boolean;
  setIsEditingInline: (editing: boolean) => void;
}

export function HeadingBlock({
  block,
  updateProps,
  isPreviewMode,
  setIsEditingInline,
}: HeadingBlockProps) {
  const props = block.props;

  return (
    <div className="py-4 px-6">
      <InlineText
        tagName={props.level || 'h1'}
        style={{ color: props.textColor, textAlign: props.align || 'center' }}
        className={`${props.fontSize || 'text-4xl'} ${props.weight || 'font-extrabold'} tracking-tight leading-snug block`}
        value={props.text || ''}
        onChange={(value) => updateProps({ text: value })}
        isPreviewMode={isPreviewMode}
        setIsEditingInline={setIsEditingInline}
      />
    </div>
  );
}
