"use client";

import type { ContainerProps } from "../../../lib/block-types";

export function ContainerBlock({ props }: { props: ContainerProps }) {
  return (
    <div
      style={{
        backgroundColor: props.bgColor,
        color: props.textColor,
        borderColor: props.borderColor,
      }}
      className={`${props.paddingY} ${props.paddingX} ${props.borderRadius} ${props.borderWidth} ${props.bgGradient} mx-auto my-4 max-w-6xl transition-all`}
    >
      <p className="text-sm leading-relaxed">{props.content}</p>
    </div>
  );
}
