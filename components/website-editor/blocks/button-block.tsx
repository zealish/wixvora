'use client';

import { Block } from '../lib/block-types';
import { InlineText } from '../canvas/inline-text-editor';

interface ButtonBlockProps {
  block: Block;
  updateProps: (newProps: Record<string, any>) => void;
  isPreviewMode: boolean;
  setIsEditingInline: (editing: boolean) => void;
}

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
};

export function ButtonBlock({
  block,
  updateProps,
  isPreviewMode,
  setIsEditingInline,
}: ButtonBlockProps) {
  const props = block.props;
  const sizeClass = sizeClasses[props.size || 'md'] || sizeClasses.md;

  return (
    <div className="py-4 px-6 flex items-center justify-center">
      <a
        href={props.url || '#'}
        className={`inline-flex items-center justify-center ${sizeClass} ${props.rounded || 'rounded-lg'} font-semibold transition-all duration-200 ${
          props.fullWidth ? 'w-full' : ''
        }`}
        style={{
          backgroundColor: props.bgColor || '#2563eb',
          color: props.textColor || '#ffffff',
        }}
      >
        <InlineText
          tagName="span"
          className="block"
          value={props.text || ''}
          onChange={(value) => updateProps({ text: value })}
          isPreviewMode={isPreviewMode}
          setIsEditingInline={setIsEditingInline}
        />
      </a>
    </div>
  );
}
