'use client';

import { Block } from '../lib/block-types';
import { InlineText } from '../canvas/inline-text-editor';

interface ContainerBlockProps {
  block: Block;
  updateProps: (newProps: Record<string, any>) => void;
  isPreviewMode: boolean;
  setIsEditingInline: (editing: boolean) => void;
}

export function ContainerBlock({
  block,
  updateProps,
  isPreviewMode,
  setIsEditingInline,
}: ContainerBlockProps) {
  const props = block.props;

  return (
    <div
      style={{
        backgroundColor: props.bgColor,
        color: props.textColor,
        borderColor: props.borderColor,
      }}
      className={`${props.paddingY || 'py-12'} ${props.paddingX || 'px-6'} ${props.borderRadius || 'rounded-2xl'} ${props.borderWidth || 'border'} ${props.bgGradient || ''} max-w-6xl mx-auto my-4 transition-all`}
    >
      <InlineText
        tagName="p"
        className="leading-relaxed text-sm block"
        value={props.content || ''}
        onChange={(value) => updateProps({ content: value })}
        isPreviewMode={isPreviewMode}
        multiline={true}
        setIsEditingInline={setIsEditingInline}
      />
    </div>
  );
}
