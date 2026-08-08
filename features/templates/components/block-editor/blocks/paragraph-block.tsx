"use client";

import type { ParagraphProps } from "../../../lib/block-types";
import { textAlignClass } from "../../../lib/block-types";

export function ParagraphBlock({ props }: { props: ParagraphProps }) {
  return (
    <div className="px-6 py-3">
      <p
        style={{ color: props.textColor }}
        className={`${props.fontSize} ${textAlignClass(props.align)} ${props.maxWidth} mx-auto leading-relaxed`}
      >
        {props.text}
      </p>
    </div>
  );
}
