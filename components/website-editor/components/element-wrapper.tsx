"use client";

import React from "react";
import { Icon } from "../ui/icon-library";
import type { Element, ViewportLayout, Viewport } from "../lib/block-types";
import { useEditor } from "../editor-provider";
import { RenderElementContent, buildContainerStyles, isContainerElement } from "./element-renderer";

export function RenderElementWrapper({
  element, sectionId, isPreviewMode, isSelected, onMouseDown, onResizeMouseDown,
  vpLayout, viewport, isChild, dragOverContainerId,
}: {
  element: Element;
  sectionId: string;
  isPreviewMode: boolean;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, secId: string, el: Element) => void;
  onResizeMouseDown: (e: React.MouseEvent, secId: string, el: Element, handleType: 'br' | 'r' | 'b') => void;
  vpLayout: ViewportLayout;
  viewport: Viewport;
  isChild?: boolean;
  dragOverContainerId: string | null;
}) {
  const { updateElementProps, updateChildElementProps, selectedElementId, selectElement, selectSection, duplicateElement, deleteElement } = useEditor();
  const isContainer = isContainerElement(element);
  const styleProps: React.CSSProperties = {
    backgroundColor: element.bgColor || 'transparent',
    borderRadius: element.borderRadius || undefined,
    border: element.borderColor ? `1px solid ${element.borderColor}` : undefined,
    padding: element.padding || undefined,
  };

  if (isChild) {
    return (
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          if (element.parentId) {
            selectSection(sectionId);
            selectElement(element.id);
          } else {
            onMouseDown(e, sectionId, element);
          }
        }}
        className={`wix-element-item child-element group ${!isPreviewMode ? 'element-outline' : ''} ${isSelected ? 'is-selected' : ''}`}
        style={{ position: 'relative', width: 'auto', height: 'auto', minWidth: 0 }}
      >
        {!isPreviewMode && isSelected && (
          <div className="absolute -top-5 left-0 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-t-md shadow-sm flex items-center space-x-1.5 pointer-events-none z-40 whitespace-nowrap">
            <Icon name="edit" className="w-2.5 h-2.5" />
            <span>{element.type}</span>
          </div>
        )}
        <RenderElementContent
          element={element}
          updateProps={(newProps) => {
            if (element.parentId) {
              updateChildElementProps(sectionId, element.parentId, element.id, newProps);
            } else {
              updateElementProps(sectionId, element.id, newProps);
            }
          }}
          isPreviewMode={isPreviewMode}
          isSelected={isSelected}
        />
      </div>
    );
  }

  return (
    <div
      id={`el-${element.id}`}
      onMouseDown={(e) => onMouseDown(e, sectionId, element)}
      style={{
        position: 'absolute',
        left: `${vpLayout.x}px`, top: `${vpLayout.y}px`,
        width: `${vpLayout.width}px`,
        height: isContainer && element.children?.length ? 'auto' : `${vpLayout.height}px`,
        zIndex: element.zIndex || 10,
        opacity: vpLayout.hidden ? 0.35 : 1,
        ...(isContainer ? {} : styleProps),
        boxSizing: 'border-box',
        minHeight: isContainer ? '80px' : undefined,
      }}
      className={`wix-element-item group ${!isPreviewMode ? 'element-outline' : ''} ${isSelected ? 'is-selected' : ''}`}
    >
      {!isPreviewMode && isSelected && (
        <div className="absolute -top-6 left-0 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-t-md shadow-sm flex items-center space-x-1.5 pointer-events-none z-40 whitespace-nowrap">
          <Icon name="move" className="w-2.5 h-2.5" />
          <span>[{viewport.toUpperCase()}] X:{vpLayout.x}, Y:{vpLayout.y}</span>
        </div>
      )}

      {!isPreviewMode && vpLayout.hidden && (
        <div className="absolute top-1 right-1 bg-amber-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow z-40 pointer-events-none uppercase">
          Sembunyi ({viewport})
        </div>
      )}

      {dragOverContainerId === element.id && isContainer && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg border-2 border-blue-500 bg-blue-500/10 pointer-events-none">
          <span className="rounded bg-blue-500 px-2 py-1 text-xs font-semibold text-white shadow-lg">Drop to nest</span>
        </div>
      )}

      {isContainer ? (
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
          {(!element.children || element.children.length === 0) ? (
            <span className="text-[11px] text-slate-400">Drop elements here</span>
          ) : element.children.map(child => (
            <RenderElementWrapper
              key={child.id}
              element={child}
              sectionId={sectionId}
              isPreviewMode={isPreviewMode}
              isSelected={selectedElementId === child.id && !isPreviewMode}
              onMouseDown={onMouseDown}
              onResizeMouseDown={onResizeMouseDown}
              vpLayout={{ x: 0, y: 0, width: 0, height: 0, hidden: false }}
              viewport={viewport}
              isChild={true}
              dragOverContainerId={dragOverContainerId}
            />
          ))}
        </div>
      ) : (
        <RenderElementContent
          element={element}
          updateProps={(newProps) => updateElementProps(sectionId, element.id, newProps)}
          isPreviewMode={isPreviewMode}
          isSelected={isSelected}
        />
      )}

      {!isPreviewMode && isSelected && (
        <>
          <div onMouseDown={(e) => onResizeMouseDown(e, sectionId, element, 'br')} className="resize-handle resize-handle-br"></div>
          <div onMouseDown={(e) => onResizeMouseDown(e, sectionId, element, 'r')} className="resize-handle resize-handle-r"></div>
          <div onMouseDown={(e) => onResizeMouseDown(e, sectionId, element, 'b')} className="resize-handle resize-handle-b"></div>
          <div className="absolute -bottom-8 right-0 bg-white border border-slate-200 text-slate-700 rounded-lg shadow-lg flex items-center space-x-1 px-1.5 py-0.5 z-50 text-[10px]">
            <button onClick={(e) => { e.stopPropagation(); duplicateElement(sectionId, element.id); }} className="p-1 hover:text-blue-600" title="Duplicate">
              <Icon name="copy" className="w-3 h-3" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); deleteElement(sectionId, element.id); }} className="p-1 hover:text-red-600" title="Delete">
              <Icon name="trash" className="w-3 h-3" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
