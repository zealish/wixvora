"use client";

import { forwardRef, useImperativeHandle, useMemo, useCallback } from "react";
import type { BlockConfig, PageSettings } from "../../lib/block-types";
import { useBlockEditor } from "./hooks/use-block-editor";
import type { EditorTab } from "./hooks/use-block-editor";
import { EditorToolbar } from "./toolbar";
import { EditorCanvas } from "./canvas";
import { BlockPalette } from "./block-palette";
import { LayerTree } from "./layer-tree";
import { PresetTemplatesPanel } from "./preset-templates-panel";
import { PageSettingsPanel } from "./page-settings-panel";
import { InspectorPanel } from "./inspector-panel";
import { Plus, Layers, Layout, Settings } from "lucide-react";

export interface BlockEditorHandle {
  getData: () => { blocks: BlockConfig[]; pageSettings: PageSettings };
}

interface BlockEditorProps {
  initialBlocks: BlockConfig[];
  initialPageSettings?: PageSettings;
}

const TABS: { value: EditorTab; label: string; Icon: typeof Plus }[] = [
  { value: "blocks", label: "Add", Icon: Plus },
  { value: "layers", label: "Layers", Icon: Layers },
  { value: "templates", label: "Templates", Icon: Layout },
  { value: "settings", label: "Page", Icon: Settings },
];

export const BlockEditor = forwardRef<BlockEditorHandle, BlockEditorProps>(
  function BlockEditor({ initialBlocks, initialPageSettings }, ref) {
    const editor = useBlockEditor(initialBlocks, initialPageSettings);

    useImperativeHandle(
      ref,
      () => ({
        getData: () => ({
          blocks: editor.blocks,
          pageSettings: editor.pageSettings,
        }),
      }),
      [editor.blocks, editor.pageSettings]
    );

    const activeBlock = useMemo(
      () => editor.blocks.find((b) => b.id === editor.selectedBlockId) ?? null,
      [editor.blocks, editor.selectedBlockId]
    );

    const handleExportHTML = useCallback(() => {
      import("../../lib/html-generator").then(({ generateHTMLSnapshot }) => {
        const html = generateHTMLSnapshot(editor.blocks, editor.pageSettings);
        copyToClipboard(html);
      });
    }, [editor.blocks, editor.pageSettings]);

    const handleExportJSON = useCallback(() => {
      downloadFile(
        JSON.stringify(editor.blocks, null, 2),
        `webcraft-layout-${Date.now()}.json`,
        "application/json"
      );
    }, [editor.blocks]);

    const handleImportJSON = useCallback(
      (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const parsed = JSON.parse(String(e.target?.result ?? "[]"));
            if (Array.isArray(parsed)) {
              editor.loadBlocks(parsed as BlockConfig[]);
            }
          } catch {
            // ignore malformed files; the editor stays untouched
          }
        };
        reader.readAsText(file, "UTF-8");
      },
      [editor]
    );

    return (
      <div className="flex h-[80vh] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-gray-100">
        <EditorToolbar
          viewport={editor.viewport}
          onViewportChange={editor.setViewport}
          canUndo={editor.historyIndex > 0}
          canRedo={editor.historyIndex < editor.historyLength - 1}
          onUndo={editor.undo}
          onRedo={editor.redo}
          isPreviewMode={editor.isPreviewMode}
          onTogglePreview={() => editor.setPreviewMode(!editor.isPreviewMode)}
          onExportHTML={handleExportHTML}
          onExportJSON={handleExportJSON}
          onImportJSON={handleImportJSON}
        />

        <div className="flex flex-1 overflow-hidden">
          {!editor.isPreviewMode && (
            <aside className="flex w-72 shrink-0 flex-col overflow-hidden border-r border-slate-800/80 bg-slate-900/90 select-none">
              <div className="grid grid-cols-4 border-b border-slate-800 bg-slate-950 p-1 text-[11px]">
                {TABS.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => editor.setActiveTab(value)}
                    className={`flex flex-col items-center justify-center space-y-1 rounded-lg py-2 font-medium transition ${
                      editor.activeTab === value
                        ? "border border-blue-500/30 bg-blue-600/20 text-blue-400"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {editor.activeTab === "blocks" && (
                <BlockPalette onAddBlock={editor.addBlock} />
              )}
              {editor.activeTab === "layers" && (
                <LayerTree
                  blocks={editor.blocks}
                  selectedBlockId={editor.selectedBlockId}
                  onSelect={editor.setSelectedBlockId}
                  onToggleVisibility={editor.toggleBlockVisibility}
                  onMove={editor.moveBlock}
                  onDelete={editor.deleteBlock}
                />
              )}
              {editor.activeTab === "templates" && (
                <PresetTemplatesPanel onLoad={editor.loadPreset} />
              )}
              {editor.activeTab === "settings" && (
                <PageSettingsPanel
                  pageSettings={editor.pageSettings}
                  onChange={editor.setPageSettings}
                />
              )}
            </aside>
          )}

          <EditorCanvas
            blocks={editor.blocks}
            pageSettings={editor.pageSettings}
            viewport={editor.viewport}
            selectedBlockId={editor.selectedBlockId}
            isPreviewMode={editor.isPreviewMode}
            onSelectBlock={editor.setSelectedBlockId}
            onMove={editor.moveBlock}
            onDuplicate={editor.duplicateBlock}
            onDelete={editor.deleteBlock}
          />

          {!editor.isPreviewMode && activeBlock && (
            <aside className="flex w-80 shrink-0 flex-col overflow-hidden border-l border-slate-800/80 bg-slate-900/90 select-none">
              <InspectorPanel
                block={activeBlock}
                onUpdateProps={(patch: Record<string, unknown>) =>
                  editor.updateBlockProps(activeBlock.id, patch)
                }
              />
            </aside>
          )}
        </div>
      </div>
    );
  }
);

function copyToClipboard(text: string): void {
  void navigator.clipboard.writeText(text);
}

function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
