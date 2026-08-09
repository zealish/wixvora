'use client';

import { Block } from '../lib/block-types';
import { InlineText } from '../canvas/inline-text-editor';

interface FooterBlockProps {
  block: Block;
  updateProps: (newProps: Record<string, any>) => void;
  isPreviewMode: boolean;
  setIsEditingInline: (editing: boolean) => void;
}

export function FooterBlock({
  block,
  updateProps,
  isPreviewMode,
  setIsEditingInline,
}: FooterBlockProps) {
  const props = block.props;

  return (
    <footer style={{ backgroundColor: props.bgColor, color: props.textColor }} className="py-8 px-6 border-t border-slate-200 text-center text-xs space-y-2">
      <div className="font-bold text-sm text-slate-900">
        <InlineText
          value={props.brandName || ''}
          onChange={(value) => updateProps({ brandName: value })}
          isPreviewMode={isPreviewMode}
          setIsEditingInline={setIsEditingInline}
        />
      </div>
      <InlineText
        tagName="p"
        className="opacity-70 block"
        value={props.copyright || ''}
        onChange={(value) => updateProps({ copyright: value })}
        isPreviewMode={isPreviewMode}
        setIsEditingInline={setIsEditingInline}
      />
    </footer>
  );
}
