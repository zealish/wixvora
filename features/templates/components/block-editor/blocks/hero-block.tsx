"use client";

import type { HeroProps } from "../../../lib/block-types";
import { justifyAlignClass, textAlignClass } from "../../../lib/block-types";

export function HeroBlock({ props }: { props: HeroProps }) {
  return (
    <div
      style={{ backgroundColor: props.bgColor, color: props.textColor }}
      className={`relative px-6 py-16 ${props.bgGradient} ${textAlignClass(props.align)} transition-all`}
    >
      <div className="mx-auto max-w-4xl space-y-5">
        {props.badge && (
          <span className="inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1 text-[11px] font-semibold text-blue-400">
            {props.badge}
          </span>
        )}
        <h1 className="text-3xl leading-tight font-extrabold tracking-tight md:text-5xl">
          {props.title}
        </h1>
        <p className="mx-auto max-w-2xl text-sm opacity-80 md:text-base">
          {props.subtitle}
        </p>
        <div
          className={`flex flex-wrap pt-4 ${justifyAlignClass(props.align)} gap-4`}
        >
          {props.buttonText && (
            <a
              href={props.buttonUrl || "#"}
              className="inline-block rounded-xl bg-blue-600 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500"
            >
              {props.buttonText}
            </a>
          )}
          {props.secondaryButtonText && (
            <a
              href={props.secondaryButtonUrl || "#"}
              className="inline-block rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              {props.secondaryButtonText}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
