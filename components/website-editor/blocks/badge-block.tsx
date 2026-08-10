'use client';

import { Block } from '../lib/block-types';
import { InlineText } from '../canvas/inline-text-editor';

interface BadgeBlockProps {
  block: Block;
  updateProps: (newProps: Record<string, any>) => void;
  isPreviewMode: boolean;
  setIsEditingInline: (editing: boolean) => void;
}

const sizeClasses: Record<string, string> = {
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function BadgeBlock({
  block,
  updateProps,
  isPreviewMode,
  setIsEditingInline,
}: BadgeBlockProps) {
  const props = block.props;
  const sizeClass = sizeClasses[props.size || 'sm'] || sizeClasses.sm;

  return (
    <div className="py-2 px-4 flex items-center justify-center">
      <span
        className={`inline-flex items-center ${sizeClass} ${props.rounded || 'rounded-full'} font-semibold`}
        style={{
          backgroundColor: props.bgColor || '#dbeafe',
          color: props.textColor || '#1d4ed8',
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
      </span>
    </div>
  );
}
