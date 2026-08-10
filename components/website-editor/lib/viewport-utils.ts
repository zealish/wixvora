// components/website-editor/lib/viewport-utils.ts

import type { Block, Section, Viewport, ViewportLayout } from './block-types';

export const VIEWPORT_WIDTHS: Record<Viewport, number> = {
  desktop: 1024,
  tablet: 768,
  mobile: 375
};

const DEFAULT_LAYOUT: ViewportLayout = {
  x: 40,
  y: 40,
  width: 200,
  height: 100,
  hidden: false
};

/**
 * Get the layout for a block in a specific viewport.
 * Falls back to auto-scaling from desktop if viewport layout is missing.
 */
export function getLayout(block: Block, viewport: Viewport): ViewportLayout {
  // If block has explicit layouts, use them
  if (block.layouts && block.layouts[viewport]) {
    return block.layouts[viewport];
  }

  // Fallback: use desktop as base
  const baseLayout: ViewportLayout = block.layouts?.desktop || {
    x: block.x ?? DEFAULT_LAYOUT.x,
    y: block.y ?? DEFAULT_LAYOUT.y,
    width: block.width ?? DEFAULT_LAYOUT.width,
    height: block.height ?? DEFAULT_LAYOUT.height,
    hidden: block.hidden ?? DEFAULT_LAYOUT.hidden
  };

  if (viewport === 'desktop') return baseLayout;

  // Auto-scale for tablet/mobile
  const targetWidth = VIEWPORT_WIDTHS[viewport];
  const desktopWidth = VIEWPORT_WIDTHS.desktop;
  const ratio = targetWidth / desktopWidth;

  return {
    x: Math.max(20, Math.round(baseLayout.x * ratio)),
    y: baseLayout.y,
    width: Math.min(baseLayout.width, targetWidth - 40),
    height: baseLayout.height,
    hidden: baseLayout.hidden
  };
}

/**
 * Get the height for a section in a specific viewport.
 */
export function getSectionHeight(section: Section, viewport: Viewport): number {
  if (section.heights && section.heights[viewport] !== undefined) {
    return section.heights[viewport];
  }
  return 600;
}

/**
 * Constrain a position within section boundaries.
 */
export function constrainToSection(
  x: number,
  y: number,
  width: number,
  height: number,
  sectionWidth: number,
  sectionHeight: number
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(sectionWidth - width, x)),
    y: Math.max(0, Math.min(sectionHeight - height, y))
  };
}
