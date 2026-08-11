"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { EditorProvider, useEditor } from "./editor-provider";
import { Icon } from "./ui/icon-library";
import { getLayout, getSectionHeight, VIEWPORT_WIDTHS } from "./lib/viewport-utils";
import type { Element, Page, PageSettings, Viewport } from "./lib/block-types";
import { ElementCatalogModal } from './modals/element-catalog-modal';
import { t } from './lib/translations';
import { RichTextEditor } from "./rich-text/RichTextEditor";
import "./rich-text/rich-text-content.css";
import { ButtonInspector } from "./inspector/ButtonInspector";
import { BadgeInspector } from "./inspector/BadgeInspector";
import { CardInspector } from "./inspector/CardInspector";
import { VideoInspector } from "./inspector/VideoInspector";
import { parseVideoUrl, buildEmbedUrl, getAutoThumbnail } from './lib/video-url-parser';

function RenderElementContent({ element, updateProps, isPreviewMode, isSelected }: { element: Element; updateProps: (p: Partial<Element>) => void; isPreviewMode: boolean; isSelected?: boolean }) {
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
    return (
      <img
        src={element.url}
        alt={element.alt || "Visual"}
        style={{ borderRadius: element.borderRadius, objectFit: (element.objectFit as any) || "cover" }}
        className="w-full h-full shadow-md"
      />
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
    const parsed = parseVideoUrl(element.videoUrl || '');
    if (!parsed) {
      return (
        <div
          style={{
            backgroundColor: element.bgColor || '#f1f5f9',
            borderRadius: element.borderRadius,
          }}
          className="w-full h-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span className="text-[11px] text-slate-400 font-medium">Paste a YouTube or Vimeo URL</span>
        </div>
      );
    }

    const thumbnailSrc = element.thumbnailUrl || getAutoThumbnail(parsed);
    const playStyle = element.playButtonStyle || 'circle';
    const overlayColor = element.overlayColor || 'rgba(0,0,0,0.3)';

    const aspectRatioMap: Record<string, string> = {
      '16:9': '16/9',
      '4:3': '4/3',
      '1:1': '1/1',
    };

    // If autoplay is on, skip thumbnail and load iframe directly
    if (element.autoplay) {
      const embedUrl = buildEmbedUrl(parsed, { autoplay: true, ...(element.loop !== undefined && { loop: element.loop }) });
      return (
        <div
          style={{
            width: '100%',
            aspectRatio: aspectRatioMap[element.aspectRatio || '16:9'] || '16/9',
            borderRadius: element.borderRadius,
            overflow: 'hidden',
            backgroundColor: element.bgColor || '#000000',
          }}
          className="w-full h-full"
        >
          <iframe
            src={embedUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={element.name || 'Video Player'}
          />
        </div>
      );
    }

    const playButtonSvg = {
      circle: (
        <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-slate-800 ml-1">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
      ),
      square: (
        <div className="w-14 h-14 rounded-xl bg-white/95 flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-slate-800 ml-0.5">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
      ),
      minimal: (
        <div className="transition-transform duration-200 group-hover:scale-110">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-white drop-shadow-lg">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
      ),
    };

    return (
      <div
        style={{
          width: '100%',
          aspectRatio: aspectRatioMap[element.aspectRatio || '16:9'] || '16/9',
          borderRadius: element.borderRadius,
          overflow: 'hidden',
          backgroundColor: element.bgColor || '#000000',
        }}
        className="w-full h-full relative group cursor-pointer"
      >
        <img
          src={thumbnailSrc}
          alt={element.name || 'Video thumbnail'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div
          className="absolute inset-0"
          style={{ backgroundColor: overlayColor }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          {playButtonSvg[playStyle]}
        </div>
      </div>
    );
  }

  return null;
}

function PageTabBar() {
  const {
    pages, currentPageId, isPreviewMode,
    setCurrentPage, addPage, removePage, updatePage, duplicatePage, setHomePage, showToast
  } = useEditor();

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; pageId: string } | null>(null);
  const [renamingPageId, setRenamingPageId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingPageId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renamingPageId]);

  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [contextMenu]);

  const handleContextMenu = useCallback((e: React.MouseEvent, pageId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, pageId });
  }, []);

  const handleRenameSubmit = useCallback((pageId: string) => {
    const trimmed = renameValue.trim();
    if (trimmed) {
      updatePage(pageId, { title: trimmed });
    }
    setRenamingPageId(null);
  }, [renameValue, updatePage]);

  if (isPreviewMode) return null;

  return (
    <>
      <div className="h-9 bg-slate-100 border-b border-slate-200 flex items-center px-2 gap-1 overflow-x-auto shrink-0 select-none">
        {pages.map(page => {
          const isActive = page.id === currentPageId;
          if (renamingPageId === page.id) {
            return (
              <div key={page.id} className="flex items-center h-7 bg-white border border-blue-400 rounded-lg px-2 shadow-sm">
                <input
                  ref={inputRef}
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onBlur={() => handleRenameSubmit(page.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleRenameSubmit(page.id);
                    if (e.key === 'Escape') setRenamingPageId(null);
                  }}
                  className="text-xs font-semibold text-slate-800 outline-none bg-transparent w-24"
                />
              </div>
            );
          }
          return (
            <button
              key={page.id}
              onClick={() => setCurrentPage(page.id)}
              onContextMenu={e => handleContextMenu(e, page.id)}
              className={`flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                isActive
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
              }`}
            >
              <Icon name="page" className="w-3 h-3" />
              <span>{page.title}</span>
              {page.isHomePage && <Icon name="star" className="w-3 h-3 text-amber-500" />}
            </button>
          );
        })}
        <button
          onClick={() => {
            const count = pages.length + 1;
            addPage(`Page ${count}`);
            showToast(`Page ${count} added`);
          }}
          className="flex items-center justify-center h-7 w-7 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white/60 transition"
          title="Add New Page"
        >
          <Icon name="plus" className="w-3.5 h-3.5" />
        </button>
      </div>

      {contextMenu && (
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 9999 }}
          className="bg-white border border-slate-200 rounded-xl shadow-xl py-1 w-48 text-xs"
        >
          <button
            onClick={() => {
              const page = pages.find(p => p.id === contextMenu.pageId);
              if (page) {
                setRenamingPageId(contextMenu.pageId);
                setRenameValue(page.title);
              }
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700 text-left"
          >
            <Icon name="edit" className="w-3.5 h-3.5" />
            <span>Rename</span>
          </button>
          <button
            onClick={() => {
              duplicatePage(contextMenu.pageId);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700 text-left"
          >
            <Icon name="copy" className="w-3.5 h-3.5" />
            <span>Duplicate</span>
          </button>
          <button
            onClick={() => {
              setHomePage(contextMenu.pageId);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700 text-left"
          >
            <Icon name="star" className="w-3.5 h-3.5" />
            <span>Set as Home Page</span>
          </button>
          <div className="border-t border-slate-100 my-1" />
          <button
            onClick={() => {
              if (pages.length <= 1) {
                showToast('Cannot delete the only page');
              } else {
                removePage(contextMenu.pageId);
              }
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 text-left"
          >
            <Icon name="trash" className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </>
  );
}

function EditorLayout({ backUrl, title }: { backUrl?: string | undefined; title?: string | undefined }) {
  const {
    sections, selectedSectionId, selectedElementId, viewport, inspectorTab,
    isPreviewMode, toast, snapToGrid, snapGuideX,
    addMenuOpen, activeFlyout, isSectionModalOpen, pages, canUndo, canRedo,
    isSaving, pageSettings,
    setViewport, setInspectorTab, setIsPreviewMode,
    setSnapToGrid, setSnapGuideX, setAddMenuOpen, setActiveFlyout, setIsSectionModalOpen,
    setPageSettings,
    selectSection, selectElement, addSectionFromTemplate, deleteSection, moveSection,
    addElement, duplicateElement, deleteElement, updateElementViewportLayout,
    updateElementProps, updateSectionProps, updateSectionHeight, undo, redo,
    saveWebsite, addPage
  } = useEditor();

  const [isElementModalOpen, setIsElementModalOpen] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);

  const currentCanvasWidth = VIEWPORT_WIDTHS[viewport];
  const selectedSection = sections.find(s => s.id === selectedSectionId);
  const selectedElement = selectedSection?.elements.find(e => e.id === selectedElementId);
  const selectedElementVPLayout = selectedElement ? getLayout(selectedElement, viewport) : null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setAddMenuOpen]);

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
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setSnapGuideX(null);
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
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-100 text-slate-800 font-sans antialiased selection:bg-blue-500 selection:text-white">

      {/* HEADER / TOPBAR */}
      <header className="h-14 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 flex items-center justify-between z-30 shrink-0 select-none shadow-sm">
        <div className="flex items-center space-x-3">
          {backUrl && (
            <a href={backUrl} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition" title="Back">
              <Icon name="arrowLeft" className="w-4 h-4 text-slate-600" />
            </a>
          )}
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <Icon name="sparkles" className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center gap-2">
              {title || 'WebCraft Studio'}
              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-widest">WIX-STYLE DnD</span>
            </h1>
          </div>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 space-x-1">
          {(['desktop', 'tablet', 'mobile'] as Viewport[]).map(vp => (
            <button key={vp} onClick={() => setViewport(vp)} className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${viewport === vp ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
              <Icon name={vp} className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{vp === 'desktop' ? t('viewport.desktop') : vp === 'tablet' ? t('viewport.tablet') : t('viewport.mobile')}</span>
            </button>
          ))}
        </div>

        {/* Right Topbar Tools */}
        <div className="flex items-center space-x-2">
          <button onClick={() => setSnapToGrid(!snapToGrid)} className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center space-x-1 ${snapToGrid ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`} title="Snap Grid">
            <Icon name="grid" className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Snap</span>
          </button>

          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-sm">
            <button onClick={undo} disabled={!canUndo} className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 transition" title={t('editor.undo')}><Icon name="undo" className="w-3.5 h-3.5" /></button>
            <button onClick={redo} disabled={!canRedo} className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 transition" title={t('editor.redo')}><Icon name="redo" className="w-3.5 h-3.5" /></button>
          </div>

          <button onClick={() => setIsPreviewMode(!isPreviewMode)} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${isPreviewMode ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
            <Icon name={isPreviewMode ? 'eyeOff' : 'eye'} className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isPreviewMode ? 'Exit Preview' : t('editor.preview')}</span>
          </button>

          <button
            onClick={saveWebsite}
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition disabled:opacity-50"
          >
            <Icon name="download" className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : t('editor.save')}</span>
          </button>
        </div>
      </header>

      {/* PAGE TAB BAR */}
      <PageTabBar />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* LEFT SIDEBAR (icon rail) */}
        {!isPreviewMode && (
          <aside className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-3 z-30 shrink-0 select-none justify-between relative shadow-sm">
            <div className="flex flex-col items-center space-y-4 w-full px-2" ref={addMenuRef}>

              {/* Back Button */}
              <a
                href="/staff/templates"
                className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition border border-slate-200"
                title="Back to Template List"
              >
                <Icon name="arrowUp" className="w-4 h-4 rotate-[-90deg]" />
              </a>

              {/* Add Button */}
              <div className="relative w-full flex justify-center">
                <button
                  onClick={() => setAddMenuOpen(!addMenuOpen)}
                  className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center transition-all shadow-md ${addMenuOpen ? 'bg-blue-600 text-white scale-105 ring-4 ring-blue-500/20' : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white hover:scale-105 hover:shadow-blue-500/20'}`}
                  title="Add Element, Section, Page"
                >
                  <Icon name="plus" className="w-6 h-6" />
                </button>

                {addMenuOpen && (
                  <div className="absolute left-16 top-0 w-64 bg-white/98 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1 text-slate-700 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Add to Website (Wix Style)
                    </div>

                    <button
                      onClick={() => { setIsElementModalOpen(true); setAddMenuOpen(false); }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600 text-left transition group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                          <Icon name="sparkles" className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold">New Element</div>
                          <div className="text-[10px] text-slate-400">Text, Button, Image, Card</div>
                        </div>
                      </div>
                      <Icon name="chevronRight" className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => { setIsSectionModalOpen(true); setAddMenuOpen(false); }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 text-left transition group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                          <Icon name="layout" className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold">Section Template</div>
                          <div className="text-[10px] text-slate-400">Choose from section templates</div>
                        </div>
                      </div>
                      <Icon name="chevronRight" className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => { setActiveFlyout('pages'); setAddMenuOpen(false); }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 hover:text-amber-600 text-left transition group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
                          <Icon name="page" className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold">Manage Pages</div>
                          <div className="text-[10px] text-slate-400">Home, About, Contact</div>
                        </div>
                      </div>
                      <Icon name="chevronRight" className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="space-y-2 w-full pt-2 border-t border-slate-200">
                <button
                  onClick={() => setIsElementModalOpen(true)}
                  className="w-full py-2.5 rounded-xl flex flex-col items-center justify-center transition text-[10px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  title={t('sidebar.elements')}
                >
                  <Icon name="sparkles" className="w-4 h-4 mb-0.5" />
                  <span>{t('sidebar.elements')}</span>
                </button>

                <button
                  onClick={() => setActiveFlyout(activeFlyout === 'sections_list' ? null : 'sections_list')}
                  className={`w-full py-2.5 rounded-xl flex flex-col items-center justify-center transition text-[10px] font-semibold ${activeFlyout === 'sections_list' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                  title={t('sidebar.sections')}
                >
                  <Icon name="layers" className="w-4 h-4 mb-0.5" />
                  <span>{t('sidebar.sections')}</span>
                </button>

                <button
                  onClick={() => setActiveFlyout(activeFlyout === 'pages' ? null : 'pages')}
                  className={`w-full py-2.5 rounded-xl flex flex-col items-center justify-center transition text-[10px] font-semibold ${activeFlyout === 'pages' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                  title={t('sidebar.pages')}
                >
                  <Icon name="page" className="w-4 h-4 mb-0.5" />
                  <span>{t('sidebar.pages')}</span>
                </button>
              </div>
            </div>

            <div className="text-[9px] text-slate-400 font-bold tracking-widest text-center uppercase">
              Wix UI
            </div>
          </aside>
        )}

        {/* FLYOUT PANEL */}
        {!isPreviewMode && activeFlyout && (
          <div className="w-72 bg-white border-r border-slate-200 flex flex-col z-20 shrink-0 select-none shadow-lg">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                {activeFlyout === 'sections_list' && <><Icon name="layers" className="w-4 h-4 text-emerald-600" /><span>{t('flyout.struktur_seksi')} ({sections.length})</span></>}
                {activeFlyout === 'pages' && <><Icon name="page" className="w-4 h-4 text-amber-600" /><span>{t('flyout.halaman_website')}</span></>}
              </h3>
              <button onClick={() => setActiveFlyout(null)} className="text-slate-400 hover:text-slate-700"><Icon name="x" className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {activeFlyout === 'sections_list' && (
                <div className="space-y-2">
                  <button
                    onClick={() => { setIsSectionModalOpen(true); setActiveFlyout(null); }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <Icon name="plus" className="w-4 h-4" />
                    <span>{t('misc.add_section_template')}</span>
                  </button>

                  <div className="space-y-2 pt-2">
                    {sections.map((sec, idx) => (
                      <div key={sec.id} onClick={() => { selectSection(sec.id); setActiveFlyout(null); }} className={`p-3 rounded-xl border text-xs cursor-pointer transition ${sec.id === selectedSectionId ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold flex items-center space-x-2">
                            <span className="text-slate-400 text-[10px]">#{idx + 1}</span>
                            <span>{sec.title}</span>
                          </span>
                          <div className="flex items-center space-x-1">
                            <button onClick={(e) => { e.stopPropagation(); moveSection(sec.id, 'up'); }} className="p-1 text-slate-400 hover:text-blue-600" title={t('misc.move_up')}><Icon name="arrowUp" className="w-3.5 h-3.5" /></button>
                            <button onClick={(e) => { e.stopPropagation(); moveSection(sec.id, 'down'); }} className="p-1 text-slate-400 hover:text-blue-600" title={t('misc.move_down')}><Icon name="arrowDown" className="w-3.5 h-3.5" /></button>
                            <button onClick={(e) => { e.stopPropagation(); deleteSection(sec.id); }} className="p-1 text-slate-400 hover:text-red-600" title={t('misc.delete')}><Icon name="trash" className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center justify-between">
                          <span>{sec.elements.length} {t('misc.element')}</span>
                          <span>Height: {getSectionHeight(sec, viewport)}px</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeFlyout === 'pages' && (
                <div className="space-y-3">
                  <div className="text-[11px] text-slate-500">Your Site Page Structure:</div>
                  {pages.map(page => (
                    <div key={page.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="flex items-center space-x-2">
                        <Icon name="page" className="w-4 h-4 text-amber-600" />
                        <span>{page.title}</span>
                      </span>
                      {page.isHomePage && <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-extrabold">HOME</span>}
                    </div>
                  ))}
                  <button onClick={() => { const count = pages.length + 1; addPage(`Page ${count}`); }} className="w-full py-2 border border-dashed border-slate-300 hover:border-slate-400 rounded-xl text-xs text-slate-600 flex items-center justify-center space-x-1">
                    <Icon name="plus" className="w-3.5 h-3.5" />
                    <span>+ New Page</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MAIN CANVAS */}
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

                  <div className="relative h-full w-full">
                    {sec.elements.map((el) => {
                      const vpLayout = getLayout(el, viewport);
                      const isElementSelected = el.id === selectedElementId && !isPreviewMode;

                      if (vpLayout.hidden && isPreviewMode) return null;

                      return (
                        <div
                          key={el.id}
                          onMouseDown={(e) => handleElementMouseDown(e, sec.id, el)}
                          style={{
                            left: `${vpLayout.x}px`,
                            top: `${vpLayout.y}px`,
                            width: `${vpLayout.width}px`,
                            height: `${vpLayout.height}px`,
                            zIndex: el.zIndex || 10,
                            opacity: vpLayout.hidden ? 0.35 : 1
                          }}
                          className={`wix-element-item group ${!isPreviewMode ? 'element-outline' : ''} ${isElementSelected ? 'is-selected' : ''}`}
                        >
                          {!isPreviewMode && isElementSelected && (
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

                          <RenderElementContent
                            element={el}
                            updateProps={(newProps) => updateElementProps(sec.id, el.id, newProps)}
                            isPreviewMode={isPreviewMode}
                            isSelected={isElementSelected}
                          />

                          {!isPreviewMode && isElementSelected && (
                            <>
                              <div onMouseDown={(e) => handleResizeMouseDown(e, sec.id, el, 'br')} className="resize-handle resize-handle-br"></div>
                              <div onMouseDown={(e) => handleResizeMouseDown(e, sec.id, el, 'r')} className="resize-handle resize-handle-r"></div>
                              <div onMouseDown={(e) => handleResizeMouseDown(e, sec.id, el, 'b')} className="resize-handle resize-handle-b"></div>

                              <div className="absolute -bottom-8 right-0 bg-white border border-slate-200 text-slate-700 rounded-lg shadow-lg flex items-center space-x-1 px-1.5 py-0.5 z-50 text-[10px]">
                                <button onClick={(e) => { e.stopPropagation(); duplicateElement(sec.id, el.id); }} className="p-1 hover:text-blue-600" title={t('inspector.duplicate')}><Icon name="copy" className="w-3 h-3" /></button>
                                <button onClick={(e) => { e.stopPropagation(); deleteElement(sec.id, el.id); }} className="p-1 hover:text-red-600" title={t('inspector.delete')}><Icon name="trash" className="w-3 h-3" /></button>
                              </div>
                            </>
                          )}
                        </div>
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

        {/* RIGHT INSPECTOR */}
        {!isPreviewMode && selectedElement && selectedElementVPLayout && (
          <aside className="w-80 border-l border-slate-200 bg-white flex flex-col z-20 shrink-0 select-none shadow-lg">
            <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Icon name="edit" className="w-4 h-4 text-blue-600" />
                <span>{t('inspector.title')}</span>
              </h2>
              <span className="text-[10px] bg-blue-100 text-blue-700 font-mono px-2 py-0.5 rounded border border-blue-200 font-bold">{selectedElement.type}</span>
            </div>

            <div className="grid grid-cols-2 border-b border-slate-200 text-[11px] bg-slate-50">
              <button onClick={() => setInspectorTab('position')} className={`py-2 font-semibold transition ${inspectorTab === 'position' ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>{t('inspector.position')} [{viewport.toUpperCase()}]</button>
              <button onClick={() => setInspectorTab('style')} className={`py-2 font-semibold transition ${inspectorTab === 'style' ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>{t('inspector.style')} & {t('inspector.content')}</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-700">
              {inspectorTab === 'position' && (
                <div className="space-y-4">
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[10px] text-blue-700 leading-relaxed">
                    📌 Position X, Y & size changes <strong>only apply to {viewport.toUpperCase()} mode</strong>.
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Position X (Left)</label>
                      <input
                        type="number"
                        value={selectedElementVPLayout.x}
                        onChange={(e) => updateElementViewportLayout(selectedSectionId!, selectedElement.id, viewport, { x: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Position Y (Top)</label>
                      <input
                        type="number"
                        value={selectedElementVPLayout.y}
                        onChange={(e) => updateElementViewportLayout(selectedSectionId!, selectedElement.id, viewport, { y: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Width</label>
                      <input
                        type="number"
                        value={selectedElementVPLayout.width}
                        onChange={(e) => updateElementViewportLayout(selectedSectionId!, selectedElement.id, viewport, { width: Math.max(30, parseInt(e.target.value) || 30) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Height</label>
                      <input
                        type="number"
                        value={selectedElementVPLayout.height}
                        onChange={(e) => updateElementViewportLayout(selectedSectionId!, selectedElement.id, viewport, { height: Math.max(20, parseInt(e.target.value) || 20) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600">Hide in {viewport.toUpperCase()}</span>
                    <input
                      type="checkbox"
                      checked={!!selectedElementVPLayout.hidden}
                      onChange={(e) => updateElementViewportLayout(selectedSectionId!, selectedElement.id, viewport, { hidden: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {inspectorTab === 'style' && (
                <div className="space-y-4">
                  {selectedElement.type === 'button' && (
                    <ButtonInspector
                      element={selectedElement}
                      sectionId={selectedSectionId!}
                      onUpdate={updateElementProps}
                    />
                  )}

                  {selectedElement.type === 'badge' && (
                    <BadgeInspector
                      element={selectedElement}
                      sectionId={selectedSectionId!}
                      onUpdate={updateElementProps}
                    />
                  )}

                  {selectedElement.type === 'card' && (
                    <CardInspector
                      element={selectedElement}
                      sectionId={selectedSectionId!}
                      onUpdate={updateElementProps}
                    />
                  )}

                  {selectedElement.type === 'video' && (
                    <VideoInspector
                      element={selectedElement}
                      sectionId={selectedSectionId!}
                      onUpdate={updateElementProps}
                    />
                  )}

                  {(selectedElement.type === 'heading' || selectedElement.type === 'paragraph') && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Text Content</label>
                      <RichTextEditor
                        content={selectedElement.text || ""}
                        onUpdate={(html) => updateElementProps(selectedSectionId!, selectedElement.id, { text: html })}
                        editable={true}
                        mode="inspector"
                        elementType={selectedElement.type}
                      />
                    </div>
                  )}

                  {selectedElement.type === 'image' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Image URL</label>
                      <input
                        type="text"
                        value={selectedElement.url || ''}
                        onChange={(e) => updateElementProps(selectedSectionId!, selectedElement.id, { url: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
                      />
                    </div>
                  )}

                  {selectedElement.textColor !== undefined && (selectedElement.type === 'heading' || selectedElement.type === 'paragraph') && (
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-500">Text Color</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={selectedElement.textColor || '#000000'}
                          onChange={(e) => updateElementProps(selectedSectionId!, selectedElement.id, { textColor: e.target.value })}
                          className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
                        />
                        <span className="font-mono text-[11px] text-slate-600">{selectedElement.textColor}</span>
                      </div>
                    </div>
                  )}

                  {selectedElement.bgColor !== undefined && (selectedElement.type === 'heading' || selectedElement.type === 'paragraph') && (
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-500">Background Color</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={selectedElement.bgColor || '#ffffff'}
                          onChange={(e) => updateElementProps(selectedSectionId!, selectedElement.id, { bgColor: e.target.value })}
                          className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
                        />
                        <span className="font-mono text-[11px] text-slate-600">{selectedElement.bgColor}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* SECTION SETTINGS INSPECTOR (when section selected but no element) */}
        {!isPreviewMode && !selectedElement && selectedSection && (
          <aside className="w-80 border-l border-slate-200 bg-white flex flex-col z-20 shrink-0 select-none shadow-lg">
            <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Icon name="layout" className="w-4 h-4 text-blue-600" />
                <span>Section Settings</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 border-b border-slate-200 text-[11px] bg-slate-50">
              <button onClick={() => setInspectorTab('position')} className={`py-2 font-semibold transition ${inspectorTab === 'position' ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Layout</button>
              <button onClick={() => setInspectorTab('style')} className={`py-2 font-semibold transition ${inspectorTab === 'style' ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Background</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-700">
              {inspectorTab === 'position' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Section Title</label>
                    <input
                      type="text"
                      value={selectedSection.title}
                      onChange={(e) => updateSectionProps(selectedSection.id, { title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 flex items-center justify-between">
                      <span>Padding (px)</span>
                      <button
                        onClick={() => updateSectionProps(selectedSection.id, { padding: { top: 0, right: 0, bottom: 0, left: 0 } })}
                        className="text-[9px] text-blue-600 hover:text-blue-700"
                      >
                        Reset
                      </button>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400">Top</label>
                        <input
                          type="number"
                          value={selectedSection.padding?.top || 0}
                          onChange={(e) => updateSectionProps(selectedSection.id, { 
                            padding: { ...selectedSection.padding, top: parseInt(e.target.value) || 0 } as any
                          })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400">Bottom</label>
                        <input
                          type="number"
                          value={selectedSection.padding?.bottom || 0}
                          onChange={(e) => updateSectionProps(selectedSection.id, { 
                            padding: { ...selectedSection.padding, bottom: parseInt(e.target.value) || 0 } as any
                          })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400">Left</label>
                        <input
                          type="number"
                          value={selectedSection.padding?.left || 0}
                          onChange={(e) => updateSectionProps(selectedSection.id, { 
                            padding: { ...selectedSection.padding, left: parseInt(e.target.value) || 0 } as any
                          })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400">Right</label>
                        <input
                          type="number"
                          value={selectedSection.padding?.right || 0}
                          onChange={(e) => updateSectionProps(selectedSection.id, { 
                            padding: { ...selectedSection.padding, right: parseInt(e.target.value) || 0 } as any
                          })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <label className="text-[10px] font-bold text-slate-500">Border Top (CSS)</label>
                    <input
                      type="text"
                      value={selectedSection.borderTop || ''}
                      onChange={(e) => updateSectionProps(selectedSection.id, { borderTop: e.target.value })}
                      placeholder="e.g., 2px solid #e2e8f0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 font-mono text-[10px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500">Border Bottom (CSS)</label>
                    <input
                      type="text"
                      value={selectedSection.borderBottom || ''}
                      onChange={(e) => updateSectionProps(selectedSection.id, { borderBottom: e.target.value })}
                      placeholder="e.g., 1px dashed #cbd5e1"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 font-mono text-[10px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500">Box Shadow (CSS)</label>
                    <input
                      type="text"
                      value={selectedSection.boxShadow || ''}
                      onChange={(e) => updateSectionProps(selectedSection.id, { boxShadow: e.target.value })}
                      placeholder="e.g., 0 10px 30px rgba(0,0,0,0.1)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 font-mono text-[10px]"
                    />
                  </div>
                </div>
              )}

              {inspectorTab === 'style' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500">Background Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={selectedSection.bgColor}
                        onChange={(e) => updateSectionProps(selectedSection.id, { bgColor: e.target.value })}
                        className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
                      />
                      <span className="font-mono text-[11px] text-slate-600">{selectedSection.bgColor}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500">Background Gradient (CSS)</label>
                    <textarea
                      rows={2}
                      value={selectedSection.bgGradient || ''}
                      onChange={(e) => updateSectionProps(selectedSection.id, { bgGradient: e.target.value })}
                      placeholder="linear-gradient(to right, #667eea, #764ba2)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none focus:border-blue-500 font-mono text-[10px]"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <label className="text-[10px] font-bold text-slate-500">Background Image URL</label>
                    <input
                      type="text"
                      value={selectedSection.bgImage || ''}
                      onChange={(e) => updateSectionProps(selectedSection.id, { bgImage: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[10px]"
                    />
                  </div>

                  {selectedSection.bgImage && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Image Size</label>
                          <select
                            value={selectedSection.bgImageSize || 'cover'}
                            onChange={(e) => updateSectionProps(selectedSection.id, { bgImageSize: e.target.value as any })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
                          >
                            <option value="cover">Cover</option>
                            <option value="contain">Contain</option>
                            <option value="auto">Auto</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Image Repeat</label>
                          <select
                            value={selectedSection.bgImageRepeat || 'no-repeat'}
                            onChange={(e) => updateSectionProps(selectedSection.id, { bgImageRepeat: e.target.value as any })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
                          >
                            <option value="no-repeat">No Repeat</option>
                            <option value="repeat">Repeat</option>
                            <option value="repeat-x">Repeat X</option>
                            <option value="repeat-y">Repeat Y</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500">Image Position</label>
                        <select
                          value={selectedSection.bgImagePosition || 'center'}
                          onChange={(e) => updateSectionProps(selectedSection.id, { bgImagePosition: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
                        >
                          <option value="center">Center</option>
                          <option value="top">Top</option>
                          <option value="bottom">Bottom</option>
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                          <option value="top left">Top Left</option>
                          <option value="top right">Top Right</option>
                          <option value="bottom left">Bottom Left</option>
                          <option value="bottom right">Bottom Right</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-500">Color Overlay</label>
                      <input
                        type="checkbox"
                        checked={!!selectedSection.overlay?.enabled}
                        onChange={(e) => updateSectionProps(selectedSection.id, { 
                          overlay: { 
                            enabled: e.target.checked, 
                            color: selectedSection.overlay?.color || '#000000', 
                            opacity: selectedSection.overlay?.opacity || 50 
                          } 
                        })}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                    </div>

                    {selectedSection.overlay?.enabled && (
                      <>
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-slate-500">Overlay Color</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={selectedSection.overlay?.color || '#000000'}
                              onChange={(e) => updateSectionProps(selectedSection.id, { 
                                overlay: { ...selectedSection.overlay!, color: e.target.value } 
                              })}
                              className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
                            />
                            <span className="font-mono text-[11px] text-slate-600">{selectedSection.overlay?.color}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 flex items-center justify-between">
                            <span>Overlay Opacity</span>
                            <span className="font-mono text-blue-600">{selectedSection.overlay?.opacity || 50}%</span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={selectedSection.overlay?.opacity || 50}
                            onChange={(e) => updateSectionProps(selectedSection.id, { 
                              overlay: { ...selectedSection.overlay!, opacity: parseInt(e.target.value) } 
                            })}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[10px] text-blue-700 leading-relaxed">
                    💡 Gradient and image work together. Use overlay to darken/lighten background images.
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* PAGE SETTINGS INSPECTOR (when no section and no element selected) */}
        {!isPreviewMode && !selectedElement && !selectedSection && (
          <aside className="w-80 border-l border-slate-200 bg-white flex flex-col z-20 shrink-0 select-none shadow-lg">
            <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Icon name="settings" className="w-4 h-4 text-blue-600" />
                <span>Page Settings</span>
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-700">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">Page Title</label>
                <input
                  type="text"
                  value={pageSettings.title}
                  onChange={(e) => setPageSettings({ ...pageSettings, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500">Background Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={pageSettings.bgColor}
                    onChange={(e) => setPageSettings({ ...pageSettings, bgColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-[11px] text-slate-600">{pageSettings.bgColor}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">Font Family</label>
                <select
                  value={pageSettings.fontFamily}
                  onChange={(e) => setPageSettings({ ...pageSettings, fontFamily: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="font-sans">Sans Serif</option>
                  <option value="font-serif">Serif</option>
                  <option value="font-mono">Monospace</option>
                </select>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* SECTION TEMPLATES MODAL */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">{t('sections.modal.title')} (Wix Sections)</h2>
                <p className="text-xs text-slate-500">{t('sections.modal.subtitle')}</p>
              </div>
              <button onClick={() => setIsSectionModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"><Icon name="x" className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                const { SECTION_TEMPLATES } = require('./lib/section-templates');
                return SECTION_TEMPLATES.map((tmpl: any) => (
                  <div key={tmpl.id} className="border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-500 hover:shadow-lg transition bg-white group" style={{ minHeight: '200px' }}>
                    <div className="p-4 flex flex-col">
                      <div className="mb-3">
                        <span className="inline-block px-2 py-1 mb-2 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">{tmpl.category}</span>
                        <h3 className="font-extrabold text-sm text-slate-900 mb-1">{tmpl.title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed max-h-16 overflow-hidden">{tmpl.desc}</p>
                      </div>
                      <button 
                        onClick={() => addSectionFromTemplate(tmpl.id)} 
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 flex-shrink-0 mt-auto"
                      >
                        <span>+</span>
                        <span>Add This Section</span>
                      </button>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      <ElementCatalogModal
        isOpen={isElementModalOpen}
        onClose={() => setIsElementModalOpen(false)}
        onSelectElement={(preset) => addElement(preset)}
      />

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

export default function WebsiteEditor({
  initialPages,
  onSave,
  backUrl,
  title,
}: {
  initialPages?: Page[];
  onSave?: (pages: Page[], pageSettings: PageSettings) => Promise<void>;
  backUrl?: string;
  title?: string;
}) {
  const props: Record<string, unknown> = {};
  if (initialPages !== undefined) props.initialPages = initialPages;
  if (onSave !== undefined) props.onSave = onSave;

  return (
    <EditorProvider {...props}>
      <EditorLayout backUrl={backUrl} title={title} />
    </EditorProvider>
  );
}
