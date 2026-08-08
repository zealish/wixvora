"use client";

import type { FormContactProps } from "../../../lib/block-types";

export function FormContactBlock({ props }: { props: FormContactProps }) {
  return (
    <div className="py-10 px-6 max-w-2xl mx-auto">
      <div
        style={{ backgroundColor: props.bgColor, color: props.textColor }}
        className="p-8 rounded-3xl border border-slate-800 text-center space-y-4 shadow-xl"
      >
        <h3 className="text-xl font-bold">{props.title}</h3>
        <p className="text-xs opacity-80 max-w-md mx-auto">{props.subtitle}</p>
        <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
          <input
            type="email"
            placeholder={props.placeholder || "Enter your email address..."}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
          />
          <button
            type="button"
            style={{ backgroundColor: props.accentColor }}
            className="px-5 py-2.5 rounded-xl text-white text-xs font-semibold shrink-0"
          >
            {props.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
