"use client";

import type { HeroProps } from "../../../lib/block-types";
import { justifyAlignClass, textAlignClass } from "../../../lib/block-types";

export function HeroBlock({ props }: { props: HeroProps }) {
  return (
    <div
      style={{ backgroundColor: props.bgColor, color: props.textColor }}
      className={`relative py-16 px-6 ${props.bgGradient} ${textAlignClass(props.align)} transition-all`}
    >
      <div className="max-w-4xl mx-auto space-y-5">
        {props.badge && (
          <span className="inline-block px-4 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {props.badge}
          </span>
        )}
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
          {props.title}
        </h1>
        <p className="text-sm md:text-base opacity-80 max-w-2xl mx-auto">{props.subtitle}</p>
        <div className={`pt-4 flex flex-wrap ${justifyAlignClass(props.align)} gap-4`}>
          {props.buttonText && (
            <a
              href={props.buttonUrl || "#"}
              className="inline-block px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 transition hover:bg-blue-500"
            >
              {props.buttonText}
            </a>
          )}
          {props.secondaryButtonText && (
            <a
              href={props.secondaryButtonUrl || "#"}
              className="inline-block px-6 py-3 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 transition hover:bg-slate-700"
            >
              {props.secondaryButtonText}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
