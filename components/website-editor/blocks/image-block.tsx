'use client';

import { Block } from '../lib/block-types';
import { InlineText } from '../canvas/inline-text-editor';

interface ImageBlockProps {
  block: Block;
  updateProps: (newProps: Record<string, any>) => void;
  isPreviewMode: boolean;
  setIsEditingInline: (editing: boolean) => void;
}

export function ImageBlock({
  block,
  updateProps,
  isPreviewMode,
  setIsEditingInline,
}: ImageBlockProps) {
  const props = block.props;

  return (
    <div className="py-6 px-4 max-w-4xl mx-auto text-center">
      <img
        src={props.url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'}
        alt={props.alt || 'Visual'}
        className={`w-full h-auto ${props.rounded || 'rounded-2xl'} ${props.shadow || 'shadow-xl'} border border-slate-200 mx-auto max-h-[480px] object-cover`}
      />
      {props.caption && (
        <InlineText
          tagName="p"
          className="mt-2 text-xs text-slate-500 block"
          value={props.caption || ''}
          onChange={(value) => updateProps({ caption: value })}
          isPreviewMode={isPreviewMode}
          setIsEditingInline={setIsEditingInline}
        />
      )}
    </div>
  );
}
