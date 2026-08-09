'use client';

import { Block } from '../lib/block-types';
import { InlineText } from '../canvas/inline-text-editor';

interface FormContactBlockProps {
  block: Block;
  updateProps: (newProps: Record<string, any>) => void;
  isPreviewMode: boolean;
  setIsEditingInline: (editing: boolean) => void;
}

export function FormContactBlock({
  block,
  updateProps,
  isPreviewMode,
  setIsEditingInline,
}: FormContactBlockProps) {
  const props = block.props;

  return (
    <div className="py-10 px-6 max-w-2xl mx-auto">
      <div style={{ backgroundColor: props.bgColor, color: props.textColor }} className="p-8 rounded-3xl border border-slate-200 text-center space-y-4 shadow-lg">
        <InlineText
          tagName="h3"
          className="text-xl font-bold block"
          value={props.title || ''}
          onChange={(value) => updateProps({ title: value })}
          isPreviewMode={isPreviewMode}
          setIsEditingInline={setIsEditingInline}
        />
        <InlineText
          tagName="p"
          className="text-xs opacity-80 max-w-md mx-auto block"
          value={props.subtitle || ''}
          onChange={(value) => updateProps({ subtitle: value })}
          isPreviewMode={isPreviewMode}
          multiline={true}
          setIsEditingInline={setIsEditingInline}
        />
        <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
          <input
            type="email"
            placeholder={props.placeholder || 'Masukkan alamat email...'}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500 shadow-sm"
            readOnly={!isPreviewMode}
          />
          <button
            style={{ backgroundColor: props.accentColor }}
            className="px-5 py-2.5 rounded-xl text-white text-xs font-semibold shrink-0 shadow-sm"
          >
            <InlineText
              value={props.buttonText || ''}
              onChange={(value) => updateProps({ buttonText: value })}
              isPreviewMode={isPreviewMode}
              setIsEditingInline={setIsEditingInline}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
