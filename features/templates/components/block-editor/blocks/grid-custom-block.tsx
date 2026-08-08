"use client";

import type { GridCustomProps } from "../../../lib/block-types";
import { gridColsClass } from "../../../lib/block-types";
import { getBlockIcon } from "../../../lib/block-icons";

export function GridCustomBlock({ props }: { props: GridCustomProps }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 space-y-2 text-center">
        <h2 className="text-2xl font-extrabold text-white md:text-3xl">
          {props.title}
        </h2>
        <p className="text-xs text-slate-400">{props.subtitle}</p>
      </div>
      <div
        className={`grid grid-cols-1 ${gridColsClass(props.columnsCount)} ${props.gap}`}
      >
        {props.columns.map((col, idx) => {
          const Icon = getBlockIcon(col.icon);
          return (
            <div
              key={idx}
              style={{ backgroundColor: col.bgColor, color: col.textColor }}
              className="flex flex-col justify-between rounded-2xl border border-slate-800/80 p-6 shadow-lg transition-all"
            >
              <div>
                <div
                  style={{ color: col.accentColor }}
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg"
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-bold">{col.title}</h3>
                <p className="mb-6 text-xs leading-relaxed opacity-80">
                  {col.desc}
                </p>
              </div>
              {col.btnText && (
                <a
                  href={col.btnUrl || "#"}
                  style={{ backgroundColor: col.accentColor }}
                  className="inline-block w-full rounded-xl py-2.5 text-center text-xs font-semibold text-white shadow-md"
                >
                  {col.btnText}
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
