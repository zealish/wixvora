"use client";

import type React from "react";

export type IconName =
  | "plus"
  | "minus"
  | "x"
  | "trash"
  | "copy"
  | "arrowUp"
  | "arrowDown"
  | "eye"
  | "eyeOff"
  | "code"
  | "desktop"
  | "tablet"
  | "mobile"
  | "undo"
  | "redo"
  | "layers"
  | "palette"
  | "sparkles"
  | "settings"
  | "download"
  | "upload"
  | "type"
  | "image"
  | "layout"
  | "check"
  | "grid"
  | "star"
  | "edit"
  | "mail"
  | "box"
  | "bold"
  | "italic"
  | "underline"
  | "alignLeft"
  | "alignCenter"
  | "alignRight"
  | "chevronRight"
  | "publish"
  | "page"
  | "move"
  | "resize"
  | "arrowLeft"
  | "save"
  | "text"
  | "cursor"
  | "media"
  | "layoutGrid"
  | "navigation"
  | "form";

const icons: Record<IconName, React.ReactElement> = {
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  minus: (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  x: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  trash: (
    <>
      <polyline points="3,6 5,6 21,6" />
      <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5,15H4a2,2,0,0,1-2-2V4A2,2,0,0,1,4,2H13a2,2,0,0,1,2,2v1" />
    </>
  ),
  arrowUp: (
    <>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5,12 12,5 19,12" />
    </>
  ),
  arrowDown: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19,12 12,19 5,12" />
    </>
  ),
  eye: (
    <>
      <path d="M1,12S5,4,12,4s11,8,11,8-4,8-11,8S1,12,1,12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M17.94,17.94A10.07,10.07,0,0,1,12,20c-7,0-11-8-11-8a18.45,18.45,0,0,1,5.06-5.94" />
      <path d="M9.9,4.24A9.12,9.12,0,0,1,12,4c7,0,11,8,11,8a18.5,18.5,0,0,1-2.16,3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M14.12,14.12a3,3,0,1,1-4.24-4.24" />
    </>
  ),
  code: (
    <>
      <polyline points="16,18 22,12 16,6" />
      <polyline points="8,6 2,12 8,18" />
    </>
  ),
  desktop: (
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </>
  ),
  tablet: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </>
  ),
  mobile: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </>
  ),
  undo: (
    <>
      <polyline points="1,4 1,10 7,10" />
      <path d="M3.51,15a9,9,0,1,0,2.13-9.36L1,10" />
    </>
  ),
  redo: (
    <>
      <polyline points="23,4 23,10 17,10" />
      <path d="M20.49,15a9,9,0,1,1-2.12-9.36L23,10" />
    </>
  ),
  layers: (
    <>
      <polygon points="12,2 2,7 12,12 22,7" />
      <polyline points="2,17 12,22 22,17" />
      <polyline points="2,12 12,17 22,12" />
    </>
  ),
  palette: (
    <>
      <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
      <path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10c.93,0,1.5-0.67,1.5-1.5,0-.39-0.14-0.74-0.29-1.02-0.13-0.26-0.28-0.53-0.28-0.86,0-0.83,0.67-1.5,1.5-1.5H16c3.31,0,6-2.69,6-6C22,5.92,17.5,2,12,2Z" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12,3l1.912,5.813L20,10l-6.088,1.187L12,17l-1.912-5.813L4,10l6.088-1.187Z" />
      <path d="M18,14l1.266,3.874L23,19l-3.734,1.126L18,24l-1.266-3.874L13,19l3.734-1.126Z" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4,15a1.65,1.65,0,0,0,.33,1.82l.06.06a2,2,0,0,1,0,2.83,2,2,0,0,1-2.83,0l-.06-.06a1.65,1.65,0,0,0-1.82-.33,1.65,1.65,0,0,0-1,1.51V21a2,2,0,0,1-4,0v-.09A1.65,1.65,0,0,0,9,19.4a1.65,1.65,0,0,0-1.82.33l-.06.06a2,2,0,0,1-2.83-2.83l.06-.06A1.65,1.65,0,0,0,4.68,15a1.65,1.65,0,0,0-1.51-1H3a2,2,0,0,1,0-4h.09A1.65,1.65,0,0,0,4.6,9a1.65,1.65,0,0,0-.33-1.82l-.06-.06a2,2,0,0,1,2.83-2.83l.06.06A1.65,1.65,0,0,0,9,4.68a1.65,1.65,0,0,0,1-1.51V3a2,2,0,0,1,4,0v.09a1.65,1.65,0,0,0,1,1.51,1.65,1.65,0,0,0,1.82-.33l.06-.06a2,2,0,0,1,2.83,2.83l-.06.06A1.65,1.65,0,0,0,19.4,9a1.65,1.65,0,0,0,1.51,1H21a2,2,0,0,1,0,4h-.09a1.65,1.65,0,0,0-1.51,1Z" />
    </>
  ),
  download: (
    <>
      <path d="M21,15v4a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2V15" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </>
  ),
  upload: (
    <>
      <path d="M21,15v4a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2V15" />
      <polyline points="17,8 12,3 7,8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </>
  ),
  type: (
    <>
      <polyline points="4,7 4,4 20,4 20,7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21,15 16,10 5,21" />
    </>
  ),
  layout: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </>
  ),
  check: (
    <>
      <polyline points="20,6 9,17 4,12" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </>
  ),
  star: (
    <>
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </>
  ),
  edit: (
    <>
      <path d="M11,4H4a2,2,0,0,0-2,2V20a2,2,0,0,0,2,2H18a2,2,0,0,0,2-2V13" />
      <path d="M18.5,2.5a2.121,2.121,0,0,1,3,3L12,15,8,16l1-4Z" />
    </>
  ),
  mail: (
    <>
      <path d="M4,4h16c1.1,0,2,0.9,2,2v12c0,1.1-0.9,2-2,2H4c-1.1,0-2-0.9-2-2V6C2,4.9,2.9,4,4,4Z" />
      <polyline points="22,6 12,13 2,6" />
    </>
  ),
  box: (
    <>
      <path d="M21,16V8a2,2,0,0,0-1-1.73l-7-4a2,2,0,0,0-2,0l-7,4A2,2,0,0,0,3,8v8a2,2,0,0,0,1,1.73l7,4a2,2,0,0,0,2,0l7-4A2,2,0,0,0,21,16Z" />
      <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </>
  ),
  bold: (
    <>
      <path d="M6,4H16a3,3,0,0,1,3,3v0a3,3,0,0,1-3,3H6Z" />
      <path d="M6,10H17a3,3,0,0,1,3,3v0a3,3,0,0,1-3,3H6Z" />
    </>
  ),
  italic: (
    <>
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </>
  ),
  underline: (
    <>
      <path d="M6,3v7a6,6,0,0,0,6,6,6,6,0,0,0,6-6V3" />
      <line x1="4" y1="21" x2="20" y2="21" />
    </>
  ),
  alignLeft: (
    <>
      <line x1="17" y1="10" x2="3" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="17" y1="18" x2="3" y2="18" />
    </>
  ),
  alignCenter: (
    <>
      <line x1="18" y1="10" x2="6" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="18" y1="18" x2="6" y2="18" />
    </>
  ),
  alignRight: (
    <>
      <line x1="21" y1="10" x2="7" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="21" y1="18" x2="7" y2="18" />
    </>
  ),
  chevronRight: (
    <>
      <polyline points="9,18 15,12 9,6" />
    </>
  ),
  publish: (
    <>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </>
  ),
  page: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </>
  ),
  move: (
    <>
      <polyline points="5 9 2 12 5 15" />
      <polyline points="9 5 12 2 15 5" />
      <polyline points="15 19 12 22 9 19" />
      <polyline points="19 9 22 12 19 15" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="12" y1="2" x2="12" y2="22" />
    </>
  ),
  resize: (
    <>
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </>
  ),
  arrowLeft: (
    <>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12,19 5,12 12,5" />
    </>
  ),
  save: (
    <>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </>
  ),
  text: (
    <>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="16" y2="12" />
      <line x1="4" y1="18" x2="18" y2="18" />
    </>
  ),
  cursor: (
    <>
      <path d="M4,4 L10,12 L13,9 L20,16" />
      <path d="M15,14 L20,16 L22,21 L17,19 L14,22 L12,19 L4,4 Z" />
    </>
  ),
  media: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polygon points="10,8 16,12 10,16" />
    </>
  ),
  layoutGrid: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
    </>
  ),
  navigation: (
    <>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </>
  ),
  form: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="7" y1="8" x2="17" y2="8" />
      <line x1="7" y1="12" x2="13" y2="12" />
      <polyline points="7,15 9,17 13,13" />
    </>
  ),
};

interface IconProps extends React.SVGAttributes<SVGElement> {
  name: IconName;
  className?: string;
  size?: number;
}

export function Icon({ name, className, size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      width={size}
      height={size}
      className={className}
      {...props}
    >
      {icons[name]}
    </svg>
  );
}
