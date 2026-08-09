'use client';

import { Block } from '../lib/block-types';
import { InlineText } from '../canvas/inline-text-editor';
import { Icon } from '../ui/icon-library';

interface PricingBlockProps {
  block: Block;
  updateProps: (newProps: Record<string, any>) => void;
  isPreviewMode: boolean;
  setIsEditingInline: (editing: boolean) => void;
}

export function PricingBlock({
  block,
  updateProps,
  isPreviewMode,
  setIsEditingInline,
}: PricingBlockProps) {
  const props = block.props;

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...(props.features || [])];
    newFeatures[index] = value;
    updateProps({ features: newFeatures });
  };

  return (
    <div className="py-10 px-6 max-w-sm mx-auto">
      <div style={{ backgroundColor: props.bgColor, color: props.textColor }} className="p-8 rounded-3xl border border-slate-200 shadow-xl relative text-center">
        {props.badge && (
          <span style={{ backgroundColor: props.accentColor }} className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
            <InlineText
              value={props.badge || ''}
              onChange={(value) => updateProps({ badge: value })}
              isPreviewMode={isPreviewMode}
              setIsEditingInline={setIsEditingInline}
            />
          </span>
        )}
        <InlineText
          tagName="h3"
          className="text-xl font-bold mt-1 block"
          value={props.planName || ''}
          onChange={(value) => updateProps({ planName: value })}
          isPreviewMode={isPreviewMode}
          setIsEditingInline={setIsEditingInline}
        />
        <div className="my-4 flex items-center justify-center space-x-1">
          <InlineText
            tagName="span"
            className="text-4xl font-extrabold"
            value={props.price || ''}
            onChange={(value) => updateProps({ price: value })}
            isPreviewMode={isPreviewMode}
            setIsEditingInline={setIsEditingInline}
          />
          <InlineText
            tagName="span"
            className="text-xs opacity-70"
            value={props.period || ''}
            onChange={(value) => updateProps({ period: value })}
            isPreviewMode={isPreviewMode}
            setIsEditingInline={setIsEditingInline}
          />
        </div>
        <ul className="space-y-2.5 text-left my-6 border-t border-b border-slate-200 py-4">
          {props.features && props.features.map((f: string, i: number) => (
            <li key={i} className="flex items-center text-xs opacity-90">
              <Icon name="check" className="w-3.5 h-3.5 text-blue-600 mr-2 shrink-0" />
              <InlineText
                value={f || ''}
                onChange={(value) => handleFeatureChange(i, value)}
                isPreviewMode={isPreviewMode}
                setIsEditingInline={setIsEditingInline}
              />
            </li>
          ))}
        </ul>
        <a
          href={props.buttonUrl || '#'}
          style={{ backgroundColor: props.accentColor }}
          className="w-full py-3 rounded-xl text-white font-semibold text-xs shadow-md inline-block text-center"
          onClick={(e) => !isPreviewMode && e.preventDefault()}
        >
          <InlineText
            value={props.buttonText || ''}
            onChange={(value) => updateProps({ buttonText: value })}
            isPreviewMode={isPreviewMode}
            setIsEditingInline={setIsEditingInline}
          />
        </a>
      </div>
    </div>
  );
}
