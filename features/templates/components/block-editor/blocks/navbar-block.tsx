"use client";

import type { NavbarProps } from "../../../lib/block-types";

export function NavbarBlock({ props }: { props: NavbarProps }) {
  return (
    <nav
      style={{ backgroundColor: props.bgColor, color: props.textColor }}
      className="flex items-center justify-between border-b border-slate-800 px-6 py-4 transition-all"
    >
      <div className="text-lg font-extrabold tracking-tight">
        {props.logoText}
      </div>
      <div className="hidden items-center space-x-6 text-xs font-semibold md:flex">
        {props.links.map((l, i) => (
          <a
            key={i}
            href={l.url || "#"}
            className="transition hover:text-blue-400"
          >
            {l.label}
          </a>
        ))}
      </div>
      <a
        href={props.ctaUrl || "#"}
        style={{ backgroundColor: props.accentColor }}
        className="inline-block rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md"
      >
        {props.ctaText}
      </a>
    </nav>
  );
}
