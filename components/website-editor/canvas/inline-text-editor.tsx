"use client";

import { useRef, useEffect, createElement } from "react";

type TagName = "span" | "h1" | "h2" | "h3" | "h4" | "p" | "div" | "a";

interface InlineTextProps {
  value: string;
  onChange?: (value: string) => void;
  tagName?: TagName;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  isPreviewMode?: boolean;
  multiline?: boolean;
  setIsEditingInline?: (editing: boolean) => void;
}

export function InlineText({
  value,
  onChange,
  tagName: Tag = "span",
  className = "",
  style,
  placeholder = "Click to edit",
  isPreviewMode = false,
  multiline = true,
  setIsEditingInline,
}: InlineTextProps) {
  const ref = useRef<HTMLElement>(null);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (ref.current && isInternalUpdate.current === false) {
      if (ref.current.innerHTML !== value) {
        ref.current.innerHTML = value;
      }
    }
    isInternalUpdate.current = false;
  }, [value]);

  if (isPreviewMode) {
    return createElement(Tag, { className, style }, value || placeholder);
  }

  const handleInput = () => {
    if (ref.current) {
      isInternalUpdate.current = true;
      onChange?.(ref.current.innerHTML);
    }
  };

  const handleBlur = () => {
    setIsEditingInline?.(false);
  };

  const handleFocus = () => {
    setIsEditingInline?.(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      ref.current?.blur();
    }
  };

  return createElement(Tag, {
    ref,
    className: `editable-text-field ${className}`,
    style,
    contentEditable: true,
    suppressContentEditableWarning: true,
    onInput: handleInput,
    onBlur: handleBlur,
    onFocus: handleFocus,
    onKeyDown: handleKeyDown,
    dangerouslySetInnerHTML: { __html: value || placeholder },
  });
}
