"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: {
    id: number;
    name: string;
    categoryLabel: string;
    image: string;
    badge?: string | null;
  } | null;
}

export function PreviewModal({ isOpen, onClose, template }: PreviewModalProps) {
  if (!template) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl space-y-6 rounded-3xl bg-white p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-100">
              <img
                src={template.image}
                className="h-full w-full object-cover"
                alt={template.name}
              />
              {template.badge && (
                <span className="absolute right-3 top-3 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">
                  {template.badge}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-slate-900">{template.name}</h3>
              <p className="mt-1 text-sm font-semibold text-brand-600">{template.categoryLabel}</p>
              <p className="mt-3 text-sm text-slate-600">
                Fully responsive template equipped with modern layouts, custom CMS fields, and seamless animations ready to publish.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-2">
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Close
              </button>
              <a
                href="#"
                className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-brand-700"
              >
                Use This Template
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
