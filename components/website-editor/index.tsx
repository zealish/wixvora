"use client";

import { useEffect, useRef } from "react";
import { EditorProvider, useEditor } from "./editor-provider";
import { Icon } from "./ui/icon-library";
import { getLayout, getSectionHeight, VIEWPORT_WIDTHS } from "./lib/viewport-utils";
import { ELEMENT_PRESETS } from "./lib/element-presets";
import type { Element, Page, Section, PageSettings, Viewport } from "./lib/block-types";

function RenderElementContent({ element, updateProps, isPreviewMode }: { element: Element; updateProps: (p: Partial<Element>) => void; isPreviewMode: boolean }) {
  if (element.type === 'heading') {
    return (
      <InlineText
        value={element.text || ''}
        onChange={(newText) => updateProps({ text: newText })}
        tagName="h2"
        className="w-full h-full flex items-center"
        style={{
          color: element.textColor,
          fontSize: element.fontSize,
          fontWeight: element.fontWeight,
          textAlign: (element.textAlign as any) || 'left',
          wordBreak: 'break-word'
        }}
        isPreviewMode={isPreviewMode}
      />
    );
  }
  if (element.type === 'paragraph') {
    return (
      <InlineText
        value={element.text || ''}
        onChange={(newText) => updateProps({ text: newText })}
        tagName="p"
        className="w-full h-full flex items-center"
        style={{
          color: element.textColor,
          fontSize: element.fontSize,
          fontWeight: element.fontWeight,
          textAlign: (element.textAlign as any) || 'left',
          wordBreak: 'break-word'
        }}
        isPreviewMode={isPreviewMode}
        multiline={true}
      />
    );
  }
  if (element.type === 'button') {
    return (
      <div
        style={{
          backgroundColor: element.bgColor,
          color: element.textColor,
          borderRadius: element.borderRadius,
          border: element.borderColor ? `1px solid ${element.borderColor}` : 'none',
          fontSize: element.fontSize,
          fontWeight: element.fontWeight
        }}
        className="w-full h-full flex items-center justify-center shadow-md hover:opacity-90 transition px-4 cursor-pointer"
      >
        <InlineText
          value={element.text || ''}
          onChange={(newText) => updateProps({ text: newText })}
          tagName="span"
          isPreviewMode={isPreviewMode}
        />
      </div>
    );
  }
  if (element.type === 'badge') {
    return (
      <div
        style={{
          backgroundColor: element.bgColor,
          color: element.textColor,
          borderRadius: element.borderRadius,
          border: `1px solid ${element.borderColor}`,
          fontSize: element.fontSize
        }}
        className="w-full h-full flex items-center justify-center font-bold px-3"
      >
        <InlineText
          value={element.text || ''}
          onChange={(newText) => updateProps({ text: newText })}
          tagName="span"
          isPreviewMode={isPreviewMode}
        />
      </div>
    );
  }
  if (element.type === 'image') {
    return (
      <img
        src={element.url}
        alt={element.alt || 'Visual'}
        style={{ borderRadius: element.borderRadius, objectFit: (element.objectFit as any) || 'cover' }}
        className="w-full h-full shadow-md"
      />
    );
  }
  if (element.type === 'card') {
    return (
      <div
        style={{
          backgroundColor: element.bgColor,
          color: element.textColor,
          borderRadius: element.borderRadius,
          border: `1px solid ${element.borderColor}`
        }}
        className="w-full h-full p-4 flex flex-col justify-between shadow-md box-border overflow-hidden"
      >
        <h3 style={{ color: element.accentColor }} className="font-bold text-base m-0">
          <InlineText
            value={element.title || ''}
            onChange={(newText) => updateProps({ title: newText })}
            tagName="span"
            isPreviewMode={isPreviewMode}
          />
        </h3>
        <p className="text-xs opacity-80 m-0 leading-relaxed">
          <InlineText
            value={element.subtitle || ''}
            onChange={(newText) => updateProps({ subtitle: newText })}
            tagName="span"
            isPreviewMode={isPreviewMode}
            multiline={true}
          />
        </p>
      </div>
    );
  }
  return null;
}

function InlineText({
  value,
  onChange,
  tagName = 'span',
  className = '',
  style = {},
  isPreviewMode = false,
  multiline = false,
  onFocusState
}: {
  value: string;
  onChange: (v: string) => void;
  tagName?: string;
  className?: string;
  style?: React.CSSProperties;
  isPreviewMode?: boolean;
  multiline?: boolean;
  onFocusState?: (v: boolean) => void;
}) {
  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerText !== (value || '')) {
      contentRef.current.innerText = value || '';
    }
  }, [value]);

  if (isPreviewMode) {
    const Tag = tagName as any;
    return <Tag className={className} style={style}>{value}</Tag>;
  }

  const Tag = tagName as any;

  return (
    <Tag
      ref={contentRef}
      contentEditable={!isPreviewMode}
      suppressContentEditableWarning={true}
      onFocus={() => onFocusState && onFocusState(true)}
      onBlur={(e: any) => {
        if (onFocusState) onFocusState(false);
        const newText = e.target.innerText;
        if (newText !== value) {
          onChange(newText);
        }
      }}
      onKeyDown={(e: any) => {
        if (!multiline && e.key === 'Enter') {
          e.preventDefault();
          e.target.blur();
        }
      }}
      className={`editable-text-field ${className}`}
      style={style}
      title="Klik untuk edit teks"
    >
      {value}
    </Tag>
  );
}

function EditorLayout({ backUrl, title }: { backUrl?: string | undefined; title?: string | undefined }) {
  const {
    sections, selectedSectionId, selectedElementId, viewport, inspectorTab,
    isPreviewMode, toast, snapToGrid, snapGuideX,
    addMenuOpen, activeFlyout, isSectionModalOpen, pages, canUndo, canRedo,
    isSaving, pageSettings,
    showToast, setViewport, setInspectorTab, setIsPreviewMode,
    setSnapToGrid, setSnapGuideX, setAddMenuOpen, setActiveFlyout, setIsSectionModalOpen,
    setPageSettings,
    selectSection, selectElement, addSectionFromTemplate, deleteSection, moveSection,
    addElement, duplicateElement, deleteElement, updateElementViewportLayout,
    updateElementProps, updateSectionHeight, undo, redo,
    saveWebsite
  } = useEditor();

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
            <a href={backUrl} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition" title="Kembali">
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
              <span className="hidden md:inline">{vp === 'desktop' ? 'Desktop' : vp === 'tablet' ? 'Tablet' : 'Mobile'}</span>
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
            <button onClick={undo} disabled={!canUndo} className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 transition" title="Undo"><Icon name="undo" className="w-3.5 h-3.5" /></button>
            <button onClick={redo} disabled={!canRedo} className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 transition" title="Redo"><Icon name="redo" className="w-3.5 h-3.5" /></button>
          </div>

          <button onClick={() => setIsPreviewMode(!isPreviewMode)} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${isPreviewMode ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
            <Icon name={isPreviewMode ? 'eyeOff' : 'eye'} className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isPreviewMode ? 'Keluar Pratinjau' : 'Pratinjau'}</span>
          </button>

          <button
            onClick={saveWebsite}
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition disabled:opacity-50"
          >
            <Icon name="download" className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
          </button>
        </div>
      </header>

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
                title="Kembali ke Daftar Template"
              >
                <Icon name="arrowUp" className="w-4 h-4 rotate-[-90deg]" />
              </a>

              {/* Add Button */}
              <div className="relative w-full flex justify-center">
                <button
                  onClick={() => setAddMenuOpen(!addMenuOpen)}
                  className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center transition-all shadow-md ${addMenuOpen ? 'bg-blue-600 text-white scale-105 ring-4 ring-blue-500/20' : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white hover:scale-105 hover:shadow-blue-500/20'}`}
                  title="Tambah Elemen, Seksi, Halaman"
                >
                  <Icon name="plus" className="w-6 h-6" />
                </button>

                {addMenuOpen && (
                  <div className="absolute left-16 top-0 w-64 bg-white/98 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1 text-slate-700 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Tambah Ke Website (Wix Style)
                    </div>

                    <button
                      onClick={() => { setActiveFlyout('elements'); setAddMenuOpen(false); }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600 text-left transition group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                          <Icon name="sparkles" className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold">Elemen Baru</div>
                          <div className="text-[10px] text-slate-400">Teks, Tombol, Gambar, Card</div>
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
                          <div className="font-bold">Seksi Templat</div>
                          <div className="text-[10px] text-slate-400">Pilih dari modal templat seksi</div>
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
                          <div className="font-bold">Kelola Halaman</div>
                          <div className="text-[10px] text-slate-400">Beranda, Tentang, Kontak</div>
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
                  onClick={() => setActiveFlyout(activeFlyout === 'elements' ? null : 'elements')}
                  className={`w-full py-2.5 rounded-xl flex flex-col items-center justify-center transition text-[10px] font-semibold ${activeFlyout === 'elements' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                  title="Katalog Elemen"
                >
                  <Icon name="sparkles" className="w-4 h-4 mb-0.5" />
                  <span>Elemen</span>
                </button>

                <button
                  onClick={() => setActiveFlyout(activeFlyout === 'sections_list' ? null : 'sections_list')}
                  className={`w-full py-2.5 rounded-xl flex flex-col items-center justify-center transition text-[10px] font-semibold ${activeFlyout === 'sections_list' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                  title="Pengelola Seksi / Layer"
                >
                  <Icon name="layers" className="w-4 h-4 mb-0.5" />
                  <span>Seksi</span>
                </button>

                <button
                  onClick={() => setActiveFlyout(activeFlyout === 'pages' ? null : 'pages')}
                  className={`w-full py-2.5 rounded-xl flex flex-col items-center justify-center transition text-[10px] font-semibold ${activeFlyout === 'pages' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                  title="Pengelola Halaman Website"
                >
                  <Icon name="page" className="w-4 h-4 mb-0.5" />
                  <span>Halaman</span>
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
                {activeFlyout === 'elements' && <><Icon name="sparkles" className="w-4 h-4 text-blue-600" /><span>Katalog Elemen</span></>}
                {activeFlyout === 'sections_list' && <><Icon name="layers" className="w-4 h-4 text-emerald-600" /><span>Struktur Seksi ({sections.length})</span></>}
                {activeFlyout === 'pages' && <><Icon name="page" className="w-4 h-4 text-amber-600" /><span>Halaman Website</span></>}
              </h3>
              <button onClick={() => setActiveFlyout(null)} className="text-slate-400 hover:text-slate-700"><Icon name="x" className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {activeFlyout === 'elements' && (
                <div className="space-y-2">
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[10px] text-blue-700 leading-relaxed">
                    💡 Klik elemen untuk menyisipkan ke seksi aktif dalam mode <strong>{viewport.toUpperCase()}</strong>.
                  </div>
                  {ELEMENT_PRESETS.map((preset, idx) => (
                    <button key={idx} onClick={() => addElement(preset)} className="w-full flex items-center space-x-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 group transition text-left">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 group-hover:border-blue-500 text-slate-600 group-hover:text-blue-600 flex items-center justify-center shrink-0">
                        <Icon name={preset.icon as any} className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600">{preset.label}</div>
                        <div className="text-[10px] text-slate-500">Tambah ke seksi</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {activeFlyout === 'sections_list' && (
                <div className="space-y-2">
                  <button
                    onClick={() => { setIsSectionModalOpen(true); setActiveFlyout(null); }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <Icon name="plus" className="w-4 h-4" />
                    <span>Tambah Seksi Templat</span>
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
                            <button onClick={(e) => { e.stopPropagation(); moveSection(sec.id, 'up'); }} className="p-1 text-slate-400 hover:text-blue-600" title="Naikkan"><Icon name="arrowUp" className="w-3.5 h-3.5" /></button>
                            <button onClick={(e) => { e.stopPropagation(); moveSection(sec.id, 'down'); }} className="p-1 text-slate-400 hover:text-blue-600" title="Turunkan"><Icon name="arrowDown" className="w-3.5 h-3.5" /></button>
                            <button onClick={(e) => { e.stopPropagation(); deleteSection(sec.id); }} className="p-1 text-slate-400 hover:text-red-600" title="Hapus"><Icon name="trash" className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center justify-between">
                          <span>{sec.elements.length} Elemen</span>
                          <span>Tinggi: {getSectionHeight(sec, viewport)}px</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeFlyout === 'pages' && (
                <div className="space-y-3">
                  <div className="text-[11px] text-slate-500">Struktur Halaman Situs Anda:</div>
                  {pages.map(page => (
                    <div key={page.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="flex items-center space-x-2">
                        <Icon name="page" className="w-4 h-4 text-amber-600" />
                        <span>{page.title}</span>
                      </span>
                      {page.isHomePage && <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-extrabold">UTAMA</span>}
                    </div>
                  ))}
                  <button onClick={() => showToast("Fitur Tambah Halaman telah siap di WebCraft Studio Pro!")} className="w-full py-2 border border-dashed border-slate-300 hover:border-slate-400 rounded-xl text-xs text-slate-600 flex items-center justify-center space-x-1">
                    <Icon name="plus" className="w-3.5 h-3.5" />
                    <span>+ Halaman Baru</span>
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
                  style={{ height: `${currentSecHeight}px`, backgroundColor: sec.bgColor }}
                  className={`wix-section-container w-full ${sec.bgGradient || ''} ${isSectionSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-100' : ''}`}
                >
                  {!isPreviewMode && (
                    <div className={`absolute top-2 left-2 z-30 flex items-center space-x-2 transition ${isSectionSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <span className="px-2.5 py-1 rounded-lg bg-white/95 text-slate-800 text-[10px] font-bold tracking-wider border border-slate-200 shadow-sm flex items-center space-x-1.5">
                        <Icon name="layout" className="w-3 h-3 text-blue-600" />
                        <span>SEKSI: {sec.title} ({currentSecHeight}px)</span>
                      </span>
                      <button onClick={() => { const p = ELEMENT_PRESETS[0]; if (p) addElement(p, sec.id); }} className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold shadow-sm transition flex items-center space-x-1">
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
                          />

                          {!isPreviewMode && isElementSelected && (
                            <>
                              <div onMouseDown={(e) => handleResizeMouseDown(e, sec.id, el, 'br')} className="resize-handle resize-handle-br"></div>
                              <div onMouseDown={(e) => handleResizeMouseDown(e, sec.id, el, 'r')} className="resize-handle resize-handle-r"></div>
                              <div onMouseDown={(e) => handleResizeMouseDown(e, sec.id, el, 'b')} className="resize-handle resize-handle-b"></div>

                              <div className="absolute -bottom-8 right-0 bg-white border border-slate-200 text-slate-700 rounded-lg shadow-lg flex items-center space-x-1 px-1.5 py-0.5 z-50 text-[10px]">
                                <button onClick={(e) => { e.stopPropagation(); duplicateElement(sec.id, el.id); }} className="p-1 hover:text-blue-600" title="Duplikasi"><Icon name="copy" className="w-3 h-3" /></button>
                                <button onClick={(e) => { e.stopPropagation(); deleteElement(sec.id, el.id); }} className="p-1 hover:text-red-600" title="Hapus"><Icon name="trash" className="w-3 h-3" /></button>
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
                      title="Tarik untuk merubah tinggi seksi"
                    >
                      <div className="text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1">
                        <Icon name="resize" className="w-3 h-3" />
                        <span>Tinggi Seksi ({viewport.toUpperCase()}): {currentSecHeight}px</span>
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
                <span>Inspector Elemen</span>
              </h2>
              <span className="text-[10px] bg-blue-100 text-blue-700 font-mono px-2 py-0.5 rounded border border-blue-200 font-bold">{selectedElement.type}</span>
            </div>

            <div className="grid grid-cols-2 border-b border-slate-200 text-[11px] bg-slate-50">
              <button onClick={() => setInspectorTab('position')} className={`py-2 font-semibold transition ${inspectorTab === 'position' ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Posisi [{viewport.toUpperCase()}]</button>
              <button onClick={() => setInspectorTab('style')} className={`py-2 font-semibold transition ${inspectorTab === 'style' ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Style & Konten</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-700">
              {inspectorTab === 'position' && (
                <div className="space-y-4">
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[10px] text-blue-700 leading-relaxed">
                    📌 Perubahan posisi X, Y & ukuran <strong>hanya berlaku untuk mode {viewport.toUpperCase()}</strong>.
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Posisi X (Kiri)</label>
                      <input
                        type="number"
                        value={selectedElementVPLayout.x}
                        onChange={(e) => updateElementViewportLayout(selectedSectionId!, selectedElement.id, viewport, { x: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Posisi Y (Atas)</label>
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
                      <label className="text-[10px] font-bold text-slate-500">Lebar (Width)</label>
                      <input
                        type="number"
                        value={selectedElementVPLayout.width}
                        onChange={(e) => updateElementViewportLayout(selectedSectionId!, selectedElement.id, viewport, { width: Math.max(30, parseInt(e.target.value) || 30) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Tinggi (Height)</label>
                      <input
                        type="number"
                        value={selectedElementVPLayout.height}
                        onChange={(e) => updateElementViewportLayout(selectedSectionId!, selectedElement.id, viewport, { height: Math.max(20, parseInt(e.target.value) || 20) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600">Sembunyikan di {viewport.toUpperCase()}</span>
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
                  {(selectedElement.type === 'heading' || selectedElement.type === 'paragraph' || selectedElement.type === 'button' || selectedElement.type === 'badge') && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Teks Konten</label>
                      <textarea
                        rows={3}
                        value={selectedElement.text || ''}
                        onChange={(e) => updateElementProps(selectedSectionId!, selectedElement.id, { text: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  {selectedElement.type === 'card' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Judul Kartu</label>
                        <input
                          type="text"
                          value={selectedElement.title || ''}
                          onChange={(e) => updateElementProps(selectedSectionId!, selectedElement.id, { title: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Sub-deskripsi Kartu</label>
                        <textarea
                          rows={3}
                          value={selectedElement.subtitle || ''}
                          onChange={(e) => updateElementProps(selectedSectionId!, selectedElement.id, { subtitle: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {selectedElement.type === 'image' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">URL Gambar (URL)</label>
                      <input
                        type="text"
                        value={selectedElement.url || ''}
                        onChange={(e) => updateElementProps(selectedSectionId!, selectedElement.id, { url: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
                      />
                    </div>
                  )}

                  {selectedElement.textColor !== undefined && (
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-500">Warna Teks</label>
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

                  {selectedElement.bgColor !== undefined && (
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-500">Warna Background</label>
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

        {/* PAGE SETTINGS INSPECTOR (when no element selected) */}
        {!isPreviewMode && !selectedElement && (
          <aside className="w-80 border-l border-slate-200 bg-white flex flex-col z-20 shrink-0 select-none shadow-lg">
            <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Icon name="settings" className="w-4 h-4 text-blue-600" />
                <span>Pengaturan Halaman</span>
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-700">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">Judul Halaman</label>
                <input
                  type="text"
                  value={pageSettings.title}
                  onChange={(e) => setPageSettings({ ...pageSettings, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500">Warna Background</label>
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
                <h2 className="text-base font-extrabold text-slate-900">Pilih Templat Seksi (Wix Sections)</h2>
                <p className="text-xs text-slate-500">Tambahkan seksi siap pakai ke halaman website Anda.</p>
              </div>
              <button onClick={() => setIsSectionModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"><Icon name="x" className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                const { SECTION_TEMPLATES } = require('./lib/section-templates');
                return SECTION_TEMPLATES.map((tmpl: any) => (
                  <div key={tmpl.id} className="border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-500 hover:shadow-lg transition flex flex-col group bg-white">
                    <div className={`h-24 ${tmpl.previewBg} p-4 flex items-end justify-between`}>
                      <span className="px-2.5 py-1 rounded-md bg-white/90 text-slate-800 text-[10px] font-bold shadow-sm">{tmpl.category}</span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 mb-1">{tmpl.title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{tmpl.desc}</p>
                      </div>
                      <button onClick={() => addSectionFromTemplate(tmpl.id)} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm">
                        + Tambahkan Seksi Ini
                      </button>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

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
  initialSections,
  initialPageSettings,
  onSave,
  backUrl,
  title,
}: {
  initialSections?: Section[];
  initialPageSettings?: PageSettings;
  onSave?: (pages: Page[], pageSettings: PageSettings) => Promise<void>;
  backUrl?: string;
  title?: string;
}) {
  const props: Record<string, unknown> = {};
  if (initialSections !== undefined) props.initialSections = initialSections;
  if (initialPageSettings !== undefined) props.initialPageSettings = initialPageSettings;
  if (onSave !== undefined) props.onSave = onSave;

  return (
    <EditorProvider {...props}>
      <EditorLayout backUrl={backUrl} title={title} />
    </EditorProvider>
  );
}
