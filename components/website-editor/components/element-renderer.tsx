"use client";

import React from "react";
import { Icon } from "../ui/icon-library";
import type { Element, ContainerLayout } from "../lib/block-types";
import { RichTextEditor } from "../rich-text/RichTextEditor";
import { VideoPlayer } from "./VideoPlayer";

export function buildContainerStyles(cl: ContainerLayout | undefined): React.CSSProperties {
  if (!cl) return {};
  const base: React.CSSProperties = {
    display: cl.type === 'flex' ? 'flex' : 'grid',
    gap: `${cl.gap || 16}px`,
  };
  if (cl.type === 'flex') {
    base.flexDirection = cl.direction || 'row';
    base.alignItems = cl.alignItems || 'start';
    if (cl.justifyContent) base.justifyContent = cl.justifyContent;
  }
  if (cl.type === 'grid') {
    base.gridTemplateColumns = `repeat(${cl.columns || 3}, 1fr)`;
  }
  return base;
}

export function isContainerElement(el: Element): boolean {
  return el.type === 'container' || el.type === 'flex-row' || el.type === 'grid';
}

export function findElementById(elements: Element[], elementId: string): Element | undefined {
  for (const el of elements) {
    if (el.id === elementId) return el;
    if (el.children && el.children.length > 0) {
      const found = findElementById(el.children, elementId);
      if (found) return found;
    }
  }
  return undefined;
}

export function RenderElementContent({ element, updateProps, isPreviewMode, isSelected }: { element: Element; updateProps: (p: Partial<Element>) => void; isPreviewMode: boolean; isSelected?: boolean }) {
  const sharedStyle: React.CSSProperties = {
    color: element.textColor,
    fontSize: element.fontSize,
    fontWeight: element.fontWeight,
    textAlign: (element.textAlign as any) || "left",
    wordBreak: "break-word",
  };

  if (element.type === "heading") {
    if (isPreviewMode) {
      return (
        <h2
          className="w-full h-full flex items-center"
          style={sharedStyle}
          dangerouslySetInnerHTML={{ __html: element.text || "" }}
        />
      );
    }
    return (
      <RichTextEditor
        content={element.text || ""}
        onUpdate={(html) => updateProps({ text: html })}
        editable={!!isSelected}
        mode="canvas"
        elementType="heading"
        tagName="h2"
        className="w-full h-full flex items-center"
        style={sharedStyle}
      />
    );
  }

  if (element.type === "paragraph") {
    if (isPreviewMode) {
      return (
        <p
          className="w-full h-full flex items-center"
          style={sharedStyle}
          dangerouslySetInnerHTML={{ __html: element.text || "" }}
        />
      );
    }
    return (
      <RichTextEditor
        content={element.text || ""}
        onUpdate={(html) => updateProps({ text: html })}
        editable={!!isSelected}
        mode="canvas"
        elementType="paragraph"
        tagName="p"
        className="w-full h-full flex items-center"
        style={sharedStyle}
      />
    );
  }

  if (element.type === "button") {
    const buttonPadding = element.padding || '12px 24px';
    return (
      <div
        style={{
          backgroundColor: element.bgColor,
          color: element.textColor,
          borderRadius: element.borderRadius,
          border: element.borderColor ? `1px solid ${element.borderColor}` : 'none',
          fontSize: element.fontSize,
          fontWeight: element.fontWeight,
          padding: buttonPadding,
        }}
        className="w-full h-full flex items-center justify-center shadow-md hover:opacity-90 transition cursor-pointer"
      >
        <span>{element.text || 'Button'}</span>
      </div>
    );
  }

  if (element.type === "badge") {
    return (
      <div
        style={{
          backgroundColor: element.bgColor,
          color: element.textColor,
          borderRadius: element.borderRadius,
          border: `1px solid ${element.borderColor}`,
          fontSize: element.fontSize,
        }}
        className="w-full h-full flex items-center justify-center font-bold px-3"
      >
        <span>{element.text || 'Badge'}</span>
      </div>
    );
  }

  if (element.type === "image") {
    const brightness = element.filterBrightness ?? 100;
    const contrast = element.filterContrast ?? 100;
    const saturation = element.filterSaturation ?? 100;
    const blur = element.filterBlur ?? 0;
    const filterStyle = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
    const hasBrokenImage = !element.url;

    const imgElement = hasBrokenImage ? (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 rounded-xl border-2 border-dashed border-slate-300">
        <Icon name="image" className="w-8 h-8 text-slate-400" />
        <span className="text-[10px] text-slate-400 mt-1 font-semibold">No image</span>
      </div>
    ) : (
      <img
        src={element.url}
        alt={element.alt || "Visual"}
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = '<div class="w-full h-full flex flex-col items-center justify-center bg-slate-100 rounded-xl border-2 border-dashed border-slate-300"><svg class="w-8 h-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg><span class="text-[10px] text-slate-400 mt-1 font-bold">No image</span></div>';
          }
        }}
        style={{
          borderRadius: element.borderRadius,
          objectFit: (element.objectFit as any) || "cover",
          opacity: element.opacity ?? 1,
          filter: filterStyle,
        }}
        className="w-full h-full"
      />
    );

    const linkedContent = element.linkUrl ? (
      <a
        href={element.linkUrl}
        target={element.openInNewTab ? "_blank" : undefined}
        rel={element.openInNewTab ? "noopener noreferrer" : undefined}
        className="block w-full h-full"
      >
        {imgElement}
      </a>
    ) : (
      imgElement
    );

    const ratioStyle: React.CSSProperties = element.aspectRatio
      ? { aspectRatio: element.aspectRatio }
      : {};

    return (
      <div className="flex flex-col w-full h-full">
        <div className="relative w-full flex-1 overflow-hidden" style={ratioStyle}>
          {linkedContent}
        </div>
        {element.caption ? (
          <div className="text-center text-[11px] text-slate-600 mt-1 px-1 leading-tight">{element.caption}</div>
        ) : null}
      </div>
    );
  }

  if (element.type === "card") {
    return (
      <div
        style={{
          backgroundColor: element.bgColor,
          color: element.textColor,
          borderRadius: element.borderRadius,
          border: `1px solid ${element.borderColor}`,
        }}
        className="w-full h-full p-4 flex flex-col justify-between shadow-md box-border overflow-hidden"
      >
        <h3
          style={{
            color: element.titleColor || element.accentColor,
            fontSize: element.titleFontSize || '18px',
            fontWeight: element.titleFontWeight || '700',
          }}
          className="m-0"
        >
          {element.title || 'Card Title'}
        </h3>
        <p
          style={{
            color: element.subtitleColor || '#64748b',
            fontSize: element.subtitleFontSize || '13px',
            fontWeight: element.subtitleFontWeight || '400',
          }}
          className="m-0 leading-relaxed"
        >
          {element.subtitle || 'Card subtitle'}
        </p>
      </div>
    );
  }

  if (element.type === "video") {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <VideoPlayer element={element} />
      </div>
    );
  }

  if (element.type === "divider") {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
        <div style={{
          width: element.dividerWidth || '100%',
          height: element.dividerHeight || '1px',
          backgroundColor: element.dividerColor || '#e5e7eb',
        }} />
      </div>
    );
  }

  if (element.type === "spacer") {
    return <div className="w-full h-full" />;
  }

  if (element.type === "icon-text") {
    const isHorizontal = element.iconTextLayout !== 'vertical';
    return (
      <div style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isHorizontal ? '12px' : '8px',
        textAlign: isHorizontal ? 'left' : 'center',
        height: '100%',
        padding: '8px',
      }}>
        <Icon name={(element.iconName as any) || 'star'} size={parseInt(element.iconSize || '32')} style={{ color: element.iconColor || '#3b82f6', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: element.fontSize || '16px', fontWeight: element.fontWeight || '600', color: element.textColor || '#0f172a' }}>
            {element.title || 'Feature'}
          </div>
          {element.subtitle && (
            <div style={{ fontSize: '14px', color: element.descriptionColor || '#6b7280', marginTop: '4px' }}>
              {element.subtitle}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isContainerElement(element)) {
    return (
      <div style={{
        ...buildContainerStyles(element.containerLayout),
        minHeight: element.children?.length ? undefined : '80px',
        padding: element.padding || '16px',
        backgroundColor: element.bgColor || 'transparent',
        borderRadius: element.borderRadius || '4px',
        border: element.borderColor ? `1px solid ${element.borderColor}` : '1px dashed #d1d5db',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        alignItems: element.children?.length ? undefined : 'center',
        justifyContent: element.children?.length ? undefined : 'center',
      }}>
        {(!element.children || element.children.length === 0) && (
          <span className="text-[11px] text-slate-400">Drop elements here</span>
        )}
      </div>
    );
  }

  return null;
}
