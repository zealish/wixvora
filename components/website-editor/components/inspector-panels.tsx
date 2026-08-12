"use client";

import { Icon } from "../ui/icon-library";
import { t } from "../lib/translations";
import { useEditor } from "../editor-provider";
import { getLayout } from "../lib/viewport-utils";
import { findElementById } from "./element-renderer";
import { RichTextEditor } from "../rich-text/RichTextEditor";
import { ButtonInspector } from "../inspector/ButtonInspector";
import { BadgeInspector } from "../inspector/BadgeInspector";
import { CardInspector } from "../inspector/CardInspector";
import { VideoInspector } from "../inspector/VideoInspector";
import { ImageInspector } from "../inspector/ImageInspector";
import { ContainerInspector } from "../inspector/ContainerInspector";
import { DividerInspector } from "../inspector/DividerInspector";
import { SpacerInspector } from "../inspector/SpacerInspector";
import { IconTextInspector } from "../inspector/IconTextInspector";

export function InspectorPanels() {
  const {
    sections, selectedSectionId, selectedElementId, viewport, inspectorTab,
    isPreviewMode, pageSettings,
    setInspectorTab, setPageSettings,
    updateElementProps, updateElementViewportLayout, updateSectionProps,
  } = useEditor();

  if (isPreviewMode) return null;

  const selectedSection = sections.find(s => s.id === selectedSectionId);
  const selectedElement = selectedSection ? findElementById(selectedSection.elements, selectedElementId || '') : undefined;
  const selectedElementVPLayout = selectedElement ? getLayout(selectedElement, viewport) : null;

  if (selectedElement && selectedElementVPLayout) {
    return (
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
                <ImageInspector
                  element={selectedElement}
                  sectionId={selectedSectionId!}
                  onUpdate={updateElementProps}
                />
              )}

              {selectedElement.type === 'container' && (
                <ContainerInspector element={selectedElement} sectionId={selectedSectionId!} onUpdate={updateElementProps} />
              )}
              {selectedElement.type === 'flex-row' && (
                <ContainerInspector element={selectedElement} sectionId={selectedSectionId!} onUpdate={updateElementProps} />
              )}
              {selectedElement.type === 'grid' && (
                <ContainerInspector element={selectedElement} sectionId={selectedSectionId!} onUpdate={updateElementProps} />
              )}
              {selectedElement.type === 'divider' && (
                <DividerInspector element={selectedElement} sectionId={selectedSectionId!} onUpdate={updateElementProps} />
              )}
              {selectedElement.type === 'spacer' && (
                <SpacerInspector />
              )}
              {selectedElement.type === 'icon-text' && (
                <IconTextInspector element={selectedElement} sectionId={selectedSectionId!} onUpdate={updateElementProps} />
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
    );
  }

  if (selectedSection) {
    return (
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
    );
  }

  return (
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
  );
}
