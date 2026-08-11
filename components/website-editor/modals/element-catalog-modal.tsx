'use client';

import { useState } from 'react';
import { Icon, type IconName } from '../ui/icon-library';
import { ELEMENT_CATEGORIES, getCategoryLabel, getCategoryDescription } from '../lib/element-categories';
import { ELEMENT_PRESETS_BY_CATEGORY, type ElementPreset } from '../lib/element-presets';
import { t } from '../lib/translations';
import type { ElementCategory } from '../lib/block-types';

interface ElementCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectElement: (preset: ElementPreset) => void;
}

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; hoverBg: string }> = {
  blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-600',    hoverBg: 'hover:bg-blue-100' },
  purple:  { bg: 'bg-purple-50',  border: 'border-purple-200',  text: 'text-purple-600',  hoverBg: 'hover:bg-purple-100' },
  green:   { bg: 'bg-green-50',   border: 'border-green-200',   text: 'text-green-600',   hoverBg: 'hover:bg-green-100' },
  orange:  { bg: 'bg-orange-50',  border: 'border-orange-200',  text: 'text-orange-600',  hoverBg: 'hover:bg-orange-100' },
  indigo:  { bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-600',  hoverBg: 'hover:bg-indigo-100' },
  pink:    { bg: 'bg-pink-50',    border: 'border-pink-200',    text: 'text-pink-600',    hoverBg: 'hover:bg-pink-100' },
};

const DEFAULT_COLOR = { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', hoverBg: 'hover:bg-blue-100' };

export function ElementCatalogModal({ isOpen, onClose, onSelectElement }: ElementCatalogModalProps) {
  const [view, setView] = useState<'categories' | 'elements'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const selectedCat = ELEMENT_CATEGORIES.find(c => c.id === selectedCategory);
  const elements = selectedCategory ? ELEMENT_PRESETS_BY_CATEGORY[selectedCategory] : [];

  const filteredElements = searchQuery
    ? elements.filter(e => e.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : elements;

  const handleCategoryClick = (categoryId: ElementCategory) => {
    const elems = ELEMENT_PRESETS_BY_CATEGORY[categoryId];
    if (elems.length === 0) return;
    setSelectedCategory(categoryId);
    setView('elements');
    setSearchQuery('');
  };

  const handleBack = () => {
    setView('categories');
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const handleClose = () => {
    onClose();
    setView('categories');
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const handleSelectElement = (preset: ElementPreset) => {
    onSelectElement(preset);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[800px] max-h-[80vh] flex flex-col overflow-hidden animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            {view === 'elements' && (
              <button onClick={handleBack} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition">
                <Icon name="arrowLeft" className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {view === 'categories' ? t('elements.modal.title') : selectedCat ? getCategoryLabel(selectedCat) : ''}
              </h2>
              <p className="text-xs text-slate-500">
                {view === 'categories' ? t('elements.modal.subtitle') : `${elements.length} ${elements.length === 1 ? 'element' : 'elements'}`}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition">
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {view === 'categories' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ELEMENT_CATEGORIES.map(cat => {
                const colors = (COLOR_MAP[cat.color] || DEFAULT_COLOR) as { bg: string; border: string; text: string; hoverBg: string };
                const elemCount = ELEMENT_PRESETS_BY_CATEGORY[cat.id].length;
                const isEmpty = elemCount === 0;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                     disabled={isEmpty}
                     className={`relative flex flex-col items-center p-6 rounded-xl border-2 transition-all ${
                       isEmpty
                         ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                         : `${colors.bg} ${colors.border} ${colors.hoverBg} cursor-pointer hover:scale-[1.02] hover:shadow-md`
                     }`}
                   >
                     {!isEmpty && (
                       <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>
                        {elemCount} {elemCount === 1 ? 'element' : 'elements'}
                      </span>
                    )}
                    {isEmpty && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                        {t('elements.modal.coming_soon')}
                      </span>
                    )}
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${colors.bg}`}>
                       <Icon name={cat.icon as IconName} className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <div className="text-sm font-bold text-slate-800">{getCategoryLabel(cat)}</div>
                    <div className="text-[11px] text-slate-500 text-center mt-1">{getCategoryDescription(cat)}</div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {elements.length > 10 && (
                <div className="relative">
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('elements.modal.search_placeholder')}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition"
                  />
                </div>
              )}

              {filteredElements.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  {t('elements.modal.empty_category')}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredElements.map(preset => (
                    <button
                      key={preset.type}
                      onClick={() => handleSelectElement(preset)}
                      className="flex items-center space-x-3 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 group transition text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 group-hover:border-blue-400 text-slate-600 group-hover:text-blue-600 flex items-center justify-center shrink-0">
                        <Icon name={preset.icon as IconName} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600">{preset.label}</div>
                        <div className="text-[11px] text-slate-500">{t(preset.descriptionKey as any)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
