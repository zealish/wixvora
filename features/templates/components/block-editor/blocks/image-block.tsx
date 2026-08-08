"use client";

import type { ImageProps } from "../../../lib/block-types";

export function ImageBlock({ props }: { props: ImageProps }) {
  return (
    <div className="py-6 px-4 max-w-4xl mx-auto text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={props.url}
        alt={props.alt || "Visual"}
        className={`w-full h-auto ${props.rounded} ${props.shadow} border border-slate-800 mx-auto max-h-[480px] object-cover`}
      />
      {props.caption && <p className="mt-2 text-xs text-slate-400">{props.caption}</p>}
    </div>
  );
}
