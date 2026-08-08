"use client";

import type { NavbarProps } from "../../../lib/block-types";

export function NavbarBlock({ props }: { props: NavbarProps }) {
  return (
    <nav
      style={{ backgroundColor: props.bgColor, color: props.textColor }}
      className="py-4 px-6 border-b border-slate-800 flex items-center justify-between transition-all"
    >
      <div className="font-extrabold text-lg tracking-tight">{props.logoText}</div>
      <div className="hidden md:flex items-center space-x-6 text-xs font-semibold">
        {props.links.map((l, i) => (
          <a key={i} href={l.url || "#"} className="hover:text-blue-400 transition">
            {l.label}
          </a>
        ))}
      </div>
      <a
        href={props.ctaUrl || "#"}
        style={{ backgroundColor: props.accentColor }}
        className="px-4 py-2 rounded-xl font-bold text-xs text-white shadow-md inline-block"
      >
        {props.ctaText}
      </a>
    </nav>
  );
}
