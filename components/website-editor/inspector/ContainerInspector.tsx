"use client";

import { useState } from "react";
import type { Element, ContainerLayout } from "../lib/block-types";
import { useEditor } from "../editor-provider";
import { Icon } from "../ui/icon-library";
import { t } from "../lib/translations";
import { ELEMENT_PRESETS } from "../lib/element-presets";

export function ContainerInspector({
  element,
  sectionId,
  onUpdate,
}: {
  element: Element;
  sectionId: string;
  onUpdate: (sectionId: string, elementId: string, props: Partial<Element>) => void;
}) {
  const update = (props: Partial<Element>) => onUpdate(sectionId, element.id, props);
  const { removeChildFromContainer, moveElementOutOfContainer, addChildElement, selectElement } = useEditor();
  const [inspectorTab, setInspectorTab] = useState<'layout' | 'style' | 'children'>('layout');
  const [addChildOpen, setAddChildOpen] = useState(false);
  const cl = element.containerLayout;

  const updateContainerLayout = (layoutProps: Partial<ContainerLayout>) => {
    update({ containerLayout: { ...cl, ...layoutProps } as ContainerLayout });
  };

  const nonContainerPresets = ELEMENT_PRESETS.filter(
    p => p.type !== 'container' && p.type !== 'flex-row' && p.type !== 'grid'
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 border-b border-slate-200 text-[11px] bg-slate-50 rounded-t-lg">
        {(['layout', 'style', 'children'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setInspectorTab(tab)}
            className={`py-2 font-semibold transition ${inspectorTab === tab ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {tab === 'layout' ? t('inspector.container.layout') : tab === 'style' ? t('inspector.container.style') : t('inspector.children')}
          </button>
        ))}
      </div>

      {inspectorTab === 'layout' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500">{t('inspector.container.layout_type')}</label>
            <div className="grid grid-cols-2 gap-1">
              {(['flex', 'grid'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => updateContainerLayout({ type })}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold transition ${cl?.type === type ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {type === 'flex' ? 'Flex' : 'Grid'}
                </button>
              ))}
            </div>
          </div>

          {cl?.type === 'flex' && (
            <>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400">{t('inspector.container.direction')}</label>
                <div className="grid grid-cols-2 gap-1">
                  {(['row', 'column'] as const).map(dir => (
                    <button
                      key={dir}
                      onClick={() => updateContainerLayout({ direction: dir })}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition ${cl?.direction === dir ? 'bg-blue-100 text-blue-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                      {dir === 'row' ? 'Row' : 'Column'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-400">{t('inspector.container.align_items')}</label>
                <select
                  value={cl?.alignItems || 'start'}
                  onChange={(e) => updateContainerLayout({ alignItems: e.target.value as 'start' | 'center' | 'end' | 'stretch' })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
                >
                  {['start', 'center', 'end', 'stretch'].map(v => (
                    <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-400">{t('inspector.container.justify_content')}</label>
                <select
                  value={cl?.justifyContent || 'start'}
                  onChange={(e) => updateContainerLayout({ justifyContent: e.target.value as 'start' | 'center' | 'end' | 'space-between' | 'space-around' })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
                >
                  {['start', 'center', 'end', 'space-between', 'space-around'].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {cl?.type === 'grid' && (
            <div className="space-y-1">
              <label className="text-[9px] text-slate-400">{t('inspector.container.columns')}</label>
              <select
                value={cl?.columns || 3}
                onChange={(e) => updateContainerLayout({ columns: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
              >
                {[2, 3, 4].map(v => (
                  <option key={v} value={v}>{v} Columns</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[9px] text-slate-400">{t('inspector.container.gap')} (px)</label>
            <input
              type="number"
              value={cl?.gap || 16}
              onChange={(e) => updateContainerLayout({ gap: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-slate-400">Padding (px)</label>
            <input
              type="text"
              value={element.padding || ''}
              onChange={(e) => update({ padding: e.target.value })}
              placeholder="e.g., 16px"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
            />
          </div>
        </div>
      )}

      {inspectorTab === 'style' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-500">Background</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={element.bgColor || '#ffffff'}
                onChange={(e) => update({ bgColor: e.target.value })}
                className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
              />
              <span className="font-mono text-[11px] text-slate-600">{element.bgColor || 'transparent'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-500">Border Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={element.borderColor || '#e2e8f0'}
                onChange={(e) => update({ borderColor: e.target.value })}
                className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
              />
              <span className="font-mono text-[11px] text-slate-600">{element.borderColor || 'none'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500">Border Radius</label>
            <input
              type="text"
              value={element.borderRadius || '8px'}
              onChange={(e) => update({ borderRadius: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
            />
          </div>
        </div>
      )}

      {inspectorTab === 'children' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-500">{t('inspector.children')}</label>
            <div className="relative">
              <button
                onClick={() => setAddChildOpen(!addChildOpen)}
                className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold transition"
              >
                {t('inspector.children.add')}
              </button>
              {addChildOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg p-1 z-50">
                  {nonContainerPresets.map(p => (
                    <button
                      key={p.type}
                      onClick={() => { addChildElement(p, element.id); setAddChildOpen(false); }}
                      className="w-full text-left px-3 py-1.5 rounded text-[11px] hover:bg-slate-50 font-medium text-slate-700"
                    >
                      {p.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setAddChildOpen(false)}
                    className="w-full text-left px-3 py-1.5 rounded text-[10px] text-slate-400 hover:bg-slate-50 mt-1 border-t border-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {(!element.children || element.children.length === 0) ? (
            <div className="text-center py-6 text-slate-400 text-[11px] bg-slate-50 rounded-lg border border-dashed border-slate-200">
              {t('inspector.children.empty')}
            </div>
          ) : (
            <div className="space-y-1">
              {element.children.map((child) => (
                <div
                  key={child.id}
                  onClick={() => selectElement(child.id)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-300 cursor-pointer transition"
                >
                  <div className="flex items-center gap-2">
                    <Icon name="gripVertical" className="w-3 h-3 text-slate-400" />
                    <span className="text-[11px] font-medium text-slate-700">{child.name || child.type}</span>
                    <span className="text-[9px] text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">{child.type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveElementOutOfContainer(child.id, element.id, sectionId); }}
                      className="p-0.5 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition"
                      title={t('inspector.children.move_out')}
                    >
                      <Icon name="arrowUp" className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeChildFromContainer(child.id, element.id, sectionId); }}
                      className="p-0.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                      title="Delete"
                    >
                      <Icon name="trash" className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
