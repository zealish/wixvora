"use client";

import React, { useRef } from "react";
import type { Element } from "../lib/block-types";
import { useEditor } from "../editor-provider";
import { getLayout, getSectionHeight, VIEWPORT_WIDTHS } from "../lib/viewport-utils";
import { Icon } from "../ui/icon-library";
import { RenderElementWrapper } from "./element-wrapper";
import { isContainerElement } from "./element-renderer";

interface CanvasAreaProps {
  setIsElementModalOpen: (v: boolean) => void;
  dragOverContainerId: string | null;
  setDragOverContainerId: (v: string | null) => void;
}

export function CanvasArea({ setIsElementModalOpen, dragOverContainerId, setDragOverContainerId }: CanvasAreaProps) {
  const {
    sections, selectedSectionId, selectedElementId, viewport,
    isPreviewMode, snapToGrid, snapGuideX,
    setSnapGuideX,
    selectSection, selectElement,
    updateElementViewportLayout, updateSectionHeight,
    moveElementIntoContainer,
  } = useEditor();

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const currentCanvasWidth = VIEWPORT_WIDTHS[viewport];

  const handleElementMouseDown = (e: React.MouseEvent, sectionId: string, element: Element) => {
    if (isPreviewMode) return;
    e.stopPropagation();
    selectSection(sectionId);
    selectElement(element.id);

    const currentVPLayout = getLayout(element, viewport);
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const initialX = currentVPLayout.x;
    const initialY = currentVPLayout.y;
    let isMoved = false;
    const targetSec = sections.find(s => s.id === sectionId);
    const secHeight = targetSec ? getSectionHeight(targetSec, viewport) : 400;
    const currentSection = sections.find(s => s.id === sectionId);
    const containers = currentSection ? currentSection.elements.filter(el => isContainerElement(el)) : [];
    let currentDragOverContainer: string | null = null;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startMouseX;
      const deltaY = moveEvent.clientY - startMouseY;
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) isMoved = true;
      if (isMoved) {
        let newX = initialX + deltaX;
        let newY = initialY + deltaY;
        if (snapToGrid) {
          newX = Math.round(newX / 10) * 10;
          newY = Math.round(newY / 10) * 10;
        }
        const maxW = currentCanvasWidth;
        newX = Math.max(0, Math.min(maxW - (currentVPLayout.width || 80), newX));
        newY = Math.max(0, Math.min(secHeight - (currentVPLayout.height || 30), newY));
        const centerX = maxW / 2;
        if (Math.abs(newX + currentVPLayout.width / 2 - centerX) < 10) {
          setSnapGuideX(centerX);
        } else {
          setSnapGuideX(null);
        }
        updateElementViewportLayout(sectionId, element.id, viewport, { x: newX, y: newY });

        let foundContainer: string | null = null;
        if (containers.length > 0) {
          const canvasEl = canvasRef.current;
          if (canvasEl) {
            const canvasRect = canvasEl.getBoundingClientRect();
            for (const ct of containers) {
              const containerEl = document.getElementById(`el-${ct.id}`);
              if (!containerEl) continue;
              const containerRect = containerEl.getBoundingClientRect();
              const containerRelativeRect = {
                left: containerRect.left - canvasRect.left,
                right: containerRect.right - canvasRect.left,
                top: containerRect.top - canvasRect.top + canvasEl.scrollTop,
                bottom: containerRect.bottom - canvasRect.top + canvasEl.scrollTop,
              };
              const relX = moveEvent.clientX - canvasRect.left;
              const relY = moveEvent.clientY - canvasRect.top - canvasEl.scrollTop;
              if (relX >= containerRelativeRect.left && relX <= containerRelativeRect.right &&
                  relY >= containerRelativeRect.top && relY <= containerRelativeRect.bottom) {
                foundContainer = ct.id;
                break;
              }
            }
          }
        }
        currentDragOverContainer = foundContainer;
        setDragOverContainerId(foundContainer);
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (currentDragOverContainer && sectionId) {
        moveElementIntoContainer(element.id, sectionId, currentDragOverContainer);
      }
      setSnapGuideX(null);
      setDragOverContainerId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, sectionId: string, element: Element, handleType: 'br' | 'r' | 'b') => {
    if (isPreviewMode) return;
    e.stopPropagation();
    const currentVPLayout = getLayout(element, viewport);
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const initialW = currentVPLayout.width;
    const initialH = currentVPLayout.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startMouseX;
      const deltaY = moveEvent.clientY - startMouseY;
      let newW = initialW;
      let newH = initialH;
      if (handleType === 'br' || handleType === 'r') newW = Math.max(30, initialW + deltaX);
      if (handleType === 'br' || handleType === 'b') newH = Math.max(20, initialH + deltaY);
      if (snapToGrid) {
        newW = Math.round(newW / 10) * 10;
        newH = Math.round(newH / 10) * 10;
      }
      newW = Math.min(newW, currentCanvasWidth - currentVPLayout.x);
      updateElementViewportLayout(sectionId, element.id, viewport, { width: newW, height: newH });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleSectionHeightMouseDown = (e: React.MouseEvent, sectionId: string, currentHeight: number) => {
    if (isPreviewMode) return;
    e.stopPropagation();
    const startY = e.clientY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      let newH = Math.max(150, currentHeight + deltaY);
      if (snapToGrid) newH = Math.round(newH / 20) * 20;
      updateSectionHeight(sectionId, viewport, newH);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <main ref={canvasContainerRef} className="flex-1 canvas-grid-pattern overflow-y-auto overflow-x-auto p-4 md:p-8 flex flex-col items-center relative min-h-0">
      {!isPreviewMode && (
        <div className="mb-3 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold shadow-sm flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Viewport Active: <strong className="text-blue-600 uppercase">{viewport}</strong> ({currentCanvasWidth}px)</span>
        </div>
      )}

      <div
        style={{ width: `${currentCanvasWidth}px` }}
        className="transition-all duration-300 bg-white shadow-xl rounded-2xl overflow-hidden mb-16 shrink-0 relative border border-slate-200"
      >
        {sections.map((sec) => {
          const isSectionSelected = sec.id === selectedSectionId && !isPreviewMode;
          const currentSecHeight = getSectionHeight(sec, viewport);

          return (
            <section
              key={sec.id}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.wix-element-item') === null) {
                  selectSection(sec.id);
                }
              }}
              style={{
                height: `${currentSecHeight}px`,
                backgroundColor: sec.bgColor,
                backgroundImage: sec.bgImage
                  ? `${sec.overlay?.enabled ? `linear-gradient(rgba(${parseInt(sec.overlay.color.slice(1,3), 16)}, ${parseInt(sec.overlay.color.slice(3,5), 16)}, ${parseInt(sec.overlay.color.slice(5,7), 16)}, ${(sec.overlay.opacity || 50) / 100}), rgba(${parseInt(sec.overlay.color.slice(1,3), 16)}, ${parseInt(sec.overlay.color.slice(3,5), 16)}, ${parseInt(sec.overlay.color.slice(5,7), 16)}, ${(sec.overlay.opacity || 50) / 100})), ` : ''}url(${sec.bgImage})`
                  : sec.bgGradient || undefined,
                backgroundSize: sec.bgImageSize || 'cover',
                backgroundPosition: sec.bgImagePosition || 'center',
                backgroundRepeat: sec.bgImageRepeat || 'no-repeat',
                paddingTop: sec.padding?.top ? `${sec.padding.top}px` : undefined,
                paddingRight: sec.padding?.right ? `${sec.padding.right}px` : undefined,
                paddingBottom: sec.padding?.bottom ? `${sec.padding.bottom}px` : undefined,
                paddingLeft: sec.padding?.left ? `${sec.padding.left}px` : undefined,
                borderTop: sec.borderTop || undefined,
                borderBottom: sec.borderBottom || undefined,
                boxShadow: sec.boxShadow || undefined,
              }}
              className={`wix-section-container w-full ${isSectionSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-100' : ''}`}
            >
              {!isPreviewMode && (
                <div className={`absolute top-2 left-2 z-30 flex items-center space-x-2 transition ${isSectionSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <span className="px-2.5 py-1 rounded-lg bg-white/95 text-slate-800 text-[10px] font-bold tracking-wider border border-slate-200 shadow-sm flex items-center space-x-1.5">
                    <Icon name="layout" className="w-3 h-3 text-blue-600" />
                    <span>SEKSI: {sec.title} ({currentSecHeight}px)</span>
                  </span>
                  <button onClick={() => setIsElementModalOpen(true)} className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold shadow-sm transition flex items-center space-x-1">
                    <Icon name="plus" className="w-3 h-3" />
                    <span>Elemen</span>
                  </button>
                </div>
              )}

              {snapGuideX !== null && <div className="snap-guide-line-x" style={{ left: `${snapGuideX}px` }}></div>}

              <div ref={canvasRef} className="relative h-full w-full">
                {sec.elements.map((el) => {
                  const vpLayout = getLayout(el, viewport);
                  const isElementSelected = el.id === selectedElementId && !isPreviewMode;
                  if (el.parentId) return null;
                  if (vpLayout.hidden && isPreviewMode) return null;
                  return (
                    <RenderElementWrapper
                      key={el.id}
                      element={el}
                      sectionId={sec.id}
                      isPreviewMode={isPreviewMode}
                      isSelected={isElementSelected}
                      onMouseDown={handleElementMouseDown}
                      onResizeMouseDown={handleResizeMouseDown}
                      vpLayout={vpLayout}
                      viewport={viewport}
                      dragOverContainerId={dragOverContainerId}
                    />
                  );
                })}
              </div>

              {!isPreviewMode && isSectionSelected && (
                <div
                  onMouseDown={(e) => handleSectionHeightMouseDown(e, sec.id, currentSecHeight)}
                  className="absolute bottom-0 left-0 right-0 h-4 bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center cursor-s-resize z-30 transition shadow-sm"
                  title="Drag to change section height"
                >
                  <div className="text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1">
                    <Icon name="resize" className="w-3 h-3" />
                    <span>Section Height ({viewport.toUpperCase()}): {currentSecHeight}px</span>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
