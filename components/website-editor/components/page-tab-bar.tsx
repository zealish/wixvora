"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Icon } from "../ui/icon-library";
import { useEditor } from "../editor-provider";

export function PageTabBar() {
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
