"use client";

import type { GridCustomProps } from "../../../lib/block-types";
import { gridColsClass } from "../../../lib/block-types";
import { getBlockIcon } from "../../../lib/block-icons";

export function GridCustomBlock({ props }: { props: GridCustomProps }) {
  return (
    <div className="py-12 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-10 space-y-2">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">{props.title}</h2>
        <p className="text-xs text-slate-400">{props.subtitle}</p>
      </div>
      <div className={`grid grid-cols-1 ${gridColsClass(props.columnsCount)} ${props.gap}`}>
        {props.columns.map((col, idx) => {
          const Icon = getBlockIcon(col.icon);
          return (
            <div
              key={idx}
              style={{ backgroundColor: col.bgColor, color: col.textColor }}
              className="p-6 rounded-2xl border border-slate-800/80 shadow-lg flex flex-col justify-between transition-all"
            >
              <div>
                <div
                  style={{ color: col.accentColor }}
                  className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4 text-lg"
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold mb-2">{col.title}</h3>
                <p className="text-xs opacity-80 leading-relaxed mb-6">{col.desc}</p>
              </div>
              {col.btnText && (
                <a
                  href={col.btnUrl || "#"}
                  style={{ backgroundColor: col.accentColor }}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-white shadow-md text-center inline-block"
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
