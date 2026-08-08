"use client";

import type { FooterProps } from "../../../lib/block-types";

export function FooterBlock({ props }: { props: FooterProps }) {
  return (
    <footer
      style={{ backgroundColor: props.bgColor, color: props.textColor }}
      className="py-8 px-6 border-t border-slate-800 text-center text-xs space-y-2"
    >
      <div className="font-bold text-sm">{props.brandName}</div>
      <p className="opacity-70">{props.copyright}</p>
    </footer>
  );
}
