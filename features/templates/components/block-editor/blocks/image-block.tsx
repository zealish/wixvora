"use client";

import type { ImageProps } from "../../../lib/block-types";

export function ImageBlock({ props }: { props: ImageProps }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={props.url}
        alt={props.alt || "Visual"}
        className={`h-auto w-full ${props.rounded} ${props.shadow} mx-auto max-h-[480px] border border-slate-800 object-cover`}
      />
      {props.caption && (
        <p className="mt-2 text-xs text-slate-400">{props.caption}</p>
      )}
    </div>
  );
}
