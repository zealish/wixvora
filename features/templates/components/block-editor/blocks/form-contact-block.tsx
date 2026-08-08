"use client";

import type { FormContactProps } from "../../../lib/block-types";

export function FormContactBlock({ props }: { props: FormContactProps }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div
        style={{ backgroundColor: props.bgColor, color: props.textColor }}
        className="space-y-4 rounded-3xl border border-slate-800 p-8 text-center shadow-xl"
      >
        <h3 className="text-xl font-bold">{props.title}</h3>
        <p className="mx-auto max-w-md text-xs opacity-80">{props.subtitle}</p>
        <div className="mx-auto flex max-w-md flex-col gap-2 pt-2 sm:flex-row">
          <input
            type="email"
            placeholder={props.placeholder || "Enter your email address..."}
            className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500"
          />
          <button
            type="button"
            style={{ backgroundColor: props.accentColor }}
            className="shrink-0 rounded-xl px-5 py-2.5 text-xs font-semibold text-white"
          >
            {props.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
