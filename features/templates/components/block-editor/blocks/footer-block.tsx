"use client";

import type { FooterProps } from "../../../lib/block-types";

export function FooterBlock({ props }: { props: FooterProps }) {
  return (
    <footer
      style={{ backgroundColor: props.bgColor, color: props.textColor }}
      className="space-y-2 border-t border-slate-800 px-6 py-8 text-center text-xs"
    >
      <div className="text-sm font-bold">{props.brandName}</div>
      <p className="opacity-70">{props.copyright}</p>
    </footer>
  );
}
