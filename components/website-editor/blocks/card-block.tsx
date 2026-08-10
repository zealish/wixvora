'use client';

import { Block } from '../lib/block-types';
import { InlineText } from '../canvas/inline-text-editor';

interface CardBlockProps {
  block: Block;
  updateProps: (newProps: Record<string, any>) => void;
  isPreviewMode: boolean;
  setIsEditingInline: (editing: boolean) => void;
}

export function CardBlock({
  block,
  updateProps,
  isPreviewMode,
  setIsEditingInline,
}: CardBlockProps) {
  const props = block.props;

  return (
    <div
      className={`p-6 ${props.rounded || 'rounded-2xl'} ${props.shadow || 'shadow-md'} ${props.borderWidth || 'border'}`}
      style={{
        backgroundColor: props.bgColor || '#ffffff',
        color: props.textColor || '#0f172a',
        borderColor: props.borderColor || '#e2e8f0',
      }}
    >
      {props.imageUrl && (
        <img
          src={props.imageUrl}
          alt={props.title || ''}
          className="w-full h-48 object-cover rounded-t-2xl mb-4"
        />
      )}
      <InlineText
        tagName="h3"
        className="text-xl font-bold mb-2 block"
        style={{ color: props.textColor || '#0f172a' }}
        value={props.title || ''}
        onChange={(value) => updateProps({ title: value })}
        isPreviewMode={isPreviewMode}
        setIsEditingInline={setIsEditingInline}
      />
      <InlineText
        tagName="p"
        className="text-sm leading-relaxed block"
        style={{ color: props.textColor ? `${props.textColor}cc` : '#64748b' }}
        value={props.description || ''}
        onChange={(value) => updateProps({ description: value })}
        isPreviewMode={isPreviewMode}
        setIsEditingInline={setIsEditingInline}
      />
    </div>
  );
}
