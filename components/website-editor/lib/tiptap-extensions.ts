import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";

export const EDITOR_COLORS = [
  "#000000", "#434343", "#666666", "#999999",
  "#e11d48", "#ea580c", "#ca8a04", "#16a34a",
  "#2563eb", "#7c3aed", "#db2777", "#0891b2",
];

export function getExtensions(mode: "inline" | "block" = "block") {
  const extensions: any[] = [
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
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
