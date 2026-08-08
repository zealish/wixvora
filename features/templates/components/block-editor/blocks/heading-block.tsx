"use client";

import type { HeadingProps } from "../../../lib/block-types";
import { textAlignClass } from "../../../lib/block-types";

export function HeadingBlock({ props }: { props: HeadingProps }) {
  const HeadingTag = props.level;
  return (
    <div className={`py-4 px-6 ${textAlignClass(props.align)}`}>
      <HeadingTag
        style={{ color: props.textColor }}
        className={`${props.fontSize} ${props.weight} tracking-tight leading-snug`}
      >
        {props.text}
      </HeadingTag>
    </div>
  );
}
