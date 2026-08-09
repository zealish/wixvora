'use client';

import { Block } from '../lib/block-types';
import { InlineText } from '../canvas/inline-text-editor';

interface NavbarBlockProps {
  block: Block;
  updateProps: (newProps: Record<string, any>) => void;
  isPreviewMode: boolean;
  setIsEditingInline: (editing: boolean) => void;
}

export function NavbarBlock({
  block,
  updateProps,
  isPreviewMode,
  setIsEditingInline,
}: NavbarBlockProps) {
  const props = block.props;

  const handleLinkChange = (index: number, field: string, value: string) => {
    const newLinks = [...(props.links || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    updateProps({ links: newLinks });
  };

  return (
    <nav
      style={{ backgroundColor: props.bgColor, color: props.textColor }}
      className="py-4 px-6 border-b border-slate-200 flex items-center justify-between transition-all"
    >
      <div className="font-extrabold text-lg tracking-tight">
        <InlineText
          value={props.logoText || ''}
          onChange={(value) => updateProps({ logoText: value })}
          isPreviewMode={isPreviewMode}
          setIsEditingInline={setIsEditingInline}
        />
      </div>
      <div className="hidden md:flex items-center space-x-6 text-xs font-semibold">
        {props.links && props.links.map((l: any, i: number) => (
          <a key={i} href={l.url || '#'} className="hover:text-blue-600 transition" onClick={(e) => !isPreviewMode && e.preventDefault()}>
            <InlineText
              value={l.label || ''}
              onChange={(value) => handleLinkChange(i, 'label', value)}
              isPreviewMode={isPreviewMode}
              setIsEditingInline={setIsEditingInline}
            />
          </a>
        ))}
      </div>
      <a
        href={props.ctaUrl || '#'}
        style={{ backgroundColor: props.accentColor }}
        className="px-4 py-2 rounded-xl font-bold text-xs text-white shadow-md inline-block"
        onClick={(e) => !isPreviewMode && e.preventDefault()}
      >
        <InlineText
          value={props.ctaText || ''}
          onChange={(value) => updateProps({ ctaText: value })}
          isPreviewMode={isPreviewMode}
          setIsEditingInline={setIsEditingInline}
        />
      </a>
    </nav>
  );
}
