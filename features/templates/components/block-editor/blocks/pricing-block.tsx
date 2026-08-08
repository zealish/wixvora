"use client";

import { Check } from "lucide-react";
import type { PricingProps } from "../../../lib/block-types";

export function PricingBlock({ props }: { props: PricingProps }) {
  return (
    <div className="mx-auto max-w-sm px-6 py-10">
      <div
        style={{ backgroundColor: props.bgColor, color: props.textColor }}
        className="relative rounded-3xl border border-slate-800 p-8 text-center shadow-2xl"
      >
        {props.badge && (
          <span
            style={{ backgroundColor: props.accentColor }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase"
          >
            {props.badge}
          </span>
        )}
        <h3 className="mt-1 text-xl font-bold">{props.planName}</h3>
        <div className="my-4">
          <span className="text-4xl font-extrabold">{props.price}</span>
          {props.period && (
            <span className="ml-1 text-xs opacity-70">{props.period}</span>
          )}
        </div>
        <ul className="my-6 space-y-2.5 border-t border-b border-slate-800/80 py-4 text-left">
          {props.features.map((f, i) => (
            <li key={i} className="flex items-center text-xs opacity-90">
              <Check className="mr-2 h-3.5 w-3.5 shrink-0 text-blue-400" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <a
          href={props.buttonUrl || "#"}
          style={{ backgroundColor: props.accentColor }}
          className="inline-block w-full rounded-xl py-3 text-center text-xs font-semibold text-white shadow-lg"
        >
          {props.buttonText}
        </a>
      </div>
    </div>
  );
}
