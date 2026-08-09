"use client";

import { useState } from "react";
import { useEditor } from "../editor-provider";
import { Icon } from "../ui/icon-library";
import { generateFullHTML } from "../lib/html-generator";

export function ExportModal() {
  const { showExportModal, setShowExportModal, blocks, pageSettings } =
    useEditor();
  const [copied, setCopied] = useState(false);

  if (!showExportModal) return null;

  const html = generateFullHTML(blocks, pageSettings);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = html;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Icon name="code" size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Kode HTML Siap Pakai
              </h2>
              <p className="text-sm text-slate-500">
                Salin kode ini dan tempel ke file .html
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowExportModal(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <pre className="bg-slate-900 text-blue-300 font-mono text-sm whitespace-pre-wrap p-6 rounded-xl overflow-x-auto">
            {html}
          </pre>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Icon name={copied ? "check" : "copy"} size={16} />
            {copied ? "Tersalin!" : "Salin Kode"}
          </button>
          <button
            onClick={() => setShowExportModal(false)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
