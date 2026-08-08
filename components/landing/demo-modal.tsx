"use client";

import { useEffect, useCallback } from "react";
import { X, PlayCircle } from "lucide-react";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleEscape]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-all duration-300 ${
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="mb-4 text-xl font-bold text-slate-900">
          Wixvora AI Builder Demo
        </h3>
        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-slate-900 text-white">
          <PlayCircle className="h-16 w-16 cursor-pointer text-indigo-500 transition hover:scale-110" />
          <p className="absolute bottom-4 text-xs text-slate-300">
            Interactive demo video preview
          </p>
        </div>
      </div>
    </div>
  );
}
