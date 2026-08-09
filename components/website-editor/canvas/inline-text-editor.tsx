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
  const isUserTyping = useRef(false);

  useEffect(() => {
    if (ref.current && !isUserTyping.current) {
      ref.current.innerHTML = value;
    }
    isUserTyping.current = false;
  }, [value, isPreviewMode]);

  useEffect(() => {
    if (ref.current && style) {
      Object.assign(ref.current.style, style);
    }
  }, [style]);

  if (isPreviewMode) {
    return createElement(Tag, { className, style }, value || placeholder);
  }

  const handleInput = () => {
    if (ref.current) {
      isUserTyping.current = true;
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
  });
}
