import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { FontSize } from "./font-size-extension";

export const EDITOR_COLORS = [
  "#000000", "#434343", "#666666", "#999999",
  "#e11d48", "#ea580c", "#ca8a04", "#16a34a",
  "#2563eb", "#7c3aed", "#db2777", "#0891b2",
];

export const FONT_SIZES = [
  { label: "Small", value: "12px" },
  { label: "Normal", value: "14px" },
  { label: "Medium", value: "16px" },
  { label: "Large", value: "18px" },
  { label: "X-Large", value: "24px" },
  { label: "XX-Large", value: "32px" },
];

export function getExtensions(mode: "inline" | "block" = "block") {
  const extensions: any[] = [
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    FontSize,
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: "editor-link" },
    }),
  ];

  if (mode === "block") {
    extensions.push(
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      })
    );
  } else {
    extensions.push(
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      })
    );
  }

  return extensions;
}
