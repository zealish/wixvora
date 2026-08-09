"use client";

import { useEffect } from "react";
import { Icon } from "./icon-library";

interface ToastProps {
  show: boolean;
  message: string;
  onClose: () => void;
}

export function Toast({ show, message, onClose }: ToastProps) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-white shadow-lg">
        <Icon name="check" size={18} />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
