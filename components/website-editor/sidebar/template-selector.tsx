"use client";

import { useState } from "react";
import { useEditor } from "../editor-provider";
import { PRESET_TEMPLATES } from "../lib/template-presets";
import { Toast } from "../ui/toast";
import { Icon } from "../ui/icon-library";

export function TemplateSelector() {
  const { setBlocks } = useEditor();
  const [showToast, setShowToast] = useState(false);

  const handleLoadTemplate = (key: string) => {
    const template = PRESET_TEMPLATES[key];
    if (template) {
      setBlocks(template.blocks);
      setShowToast(true);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-3">
      <div className="space-y-3">
        {Object.entries(PRESET_TEMPLATES).map(([key, template]) => (
          <button
            key={key}
            onClick={() => handleLoadTemplate(key)}
            className="group w-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-blue-500 to-purple-600 p-4 text-left text-white shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
                <Icon name="layout" size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold">{template.name}</h4>
                <p className="mt-0.5 text-xs text-white/70">
                  {template.blocks.length} blok siap pakai
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <Toast
        show={showToast}
        message="Template berhasil dimuat!"
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
