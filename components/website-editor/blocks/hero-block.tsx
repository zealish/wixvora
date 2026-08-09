'use client';

import { Block } from '../lib/block-types';
import { InlineText } from '../canvas/inline-text-editor';

interface HeroBlockProps {
  block: Block;
  updateProps: (newProps: Record<string, any>) => void;
  isPreviewMode: boolean;
  setIsEditingInline: (editing: boolean) => void;
}

export function HeroBlock({
  block,
  updateProps,
  isPreviewMode,
  setIsEditingInline,
}: HeroBlockProps) {
  const props = block.props;

  return (
    <div
      style={{ backgroundColor: props.bgColor, color: props.textColor, textAlign: props.align || 'center' }}
      className={`relative py-16 px-6 ${props.bgGradient || ''} transition-all`}
    >
      <div className="max-w-4xl mx-auto space-y-5">
        {props.badge && (
          <div className="inline-block">
            <span className="inline-block px-4 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700 border border-blue-200">
              <InlineText
                value={props.badge || ''}
                onChange={(value) => updateProps({ badge: value })}
                isPreviewMode={isPreviewMode}
                setIsEditingInline={setIsEditingInline}
              />
            </span>
          </div>
        )}
        <InlineText
          tagName="h1"
          className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight block text-slate-900"
          value={props.title || ''}
          onChange={(value) => updateProps({ title: value })}
          isPreviewMode={isPreviewMode}
          setIsEditingInline={setIsEditingInline}
        />
        <InlineText
          tagName="p"
          className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto block"
          value={props.subtitle || ''}
          onChange={(value) => updateProps({ subtitle: value })}
          isPreviewMode={isPreviewMode}
          multiline={true}
          setIsEditingInline={setIsEditingInline}
        />
        <div className={`pt-4 flex flex-wrap justify-${props.align === 'center' ? 'center' : props.align === 'right' ? 'end' : 'start'} gap-4`}>
          {props.buttonText && (
            <a
              href={props.buttonUrl || '#'}
              className="inline-block px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition hover:bg-blue-700"
              onClick={(e) => !isPreviewMode && e.preventDefault()}
            >
              <InlineText
                value={props.buttonText || ''}
                onChange={(value) => updateProps({ buttonText: value })}
                isPreviewMode={isPreviewMode}
                setIsEditingInline={setIsEditingInline}
              />
            </a>
          )}
          {props.secondaryButtonText && (
            <a
              href={props.secondaryButtonUrl || '#'}
              className="inline-block px-6 py-3 rounded-xl bg-white text-slate-700 font-semibold text-xs border border-slate-300 shadow-sm transition hover:bg-slate-50"
              onClick={(e) => !isPreviewMode && e.preventDefault()}
            >
              <InlineText
                value={props.secondaryButtonText || ''}
                onChange={(value) => updateProps({ secondaryButtonText: value })}
                isPreviewMode={isPreviewMode}
                setIsEditingInline={setIsEditingInline}
              />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
