"use client";

import { Check } from "lucide-react";
import type { PricingProps } from "../../../lib/block-types";

export function PricingBlock({ props }: { props: PricingProps }) {
  return (
    <div className="py-10 px-6 max-w-sm mx-auto">
      <div
        style={{ backgroundColor: props.bgColor, color: props.textColor }}
        className="p-8 rounded-3xl border border-slate-800 shadow-2xl relative text-center"
      >
        {props.badge && (
          <span
            style={{ backgroundColor: props.accentColor }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider"
          >
            {props.badge}
          </span>
        )}
        <h3 className="text-xl font-bold mt-1">{props.planName}</h3>
        <div className="my-4">
          <span className="text-4xl font-extrabold">{props.price}</span>
          {props.period && <span className="text-xs opacity-70 ml-1">{props.period}</span>}
        </div>
        <ul className="space-y-2.5 text-left my-6 border-t border-b border-slate-800/80 py-4">
          {props.features.map((f, i) => (
            <li key={i} className="flex items-center text-xs opacity-90">
              <Check className="w-3.5 h-3.5 text-blue-400 mr-2 shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <a
          href={props.buttonUrl || "#"}
          style={{ backgroundColor: props.accentColor }}
          className="w-full py-3 rounded-xl text-white font-semibold text-xs shadow-lg inline-block text-center"
        >
          {props.buttonText}
        </a>
      </div>
    </div>
  );
}
