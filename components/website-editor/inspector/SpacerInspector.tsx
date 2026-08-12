"use client";

import type { Element } from "../lib/block-types";

export function SpacerInspector({
  element,
  sectionId,
  onUpdate,
}: {
  element: Element;
  sectionId: string;
  onUpdate: (sectionId: string, elementId: string, props: Partial<Element>) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-500 leading-relaxed">
        Spacer creates vertical whitespace. Resize it using the canvas handles to adjust height.
      </div>
    </div>
  );
}
