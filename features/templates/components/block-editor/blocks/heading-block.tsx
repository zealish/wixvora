"use client";

import type { HeadingProps } from "../../../lib/block-types";
import { textAlignClass } from "../../../lib/block-types";

export function HeadingBlock({ props }: { props: HeadingProps }) {
  const HeadingTag = props.level;
  return (
    <div className={`px-6 py-4 ${textAlignClass(props.align)}`}>
      <HeadingTag
        style={{ color: props.textColor }}
        className={`${props.fontSize} ${props.weight} leading-snug tracking-tight`}
      >
        {props.text}
      </HeadingTag>
    </div>
  );
}
