import type { Element, Section, Viewport, ViewportLayout } from './block-types';

export const VIEWPORT_WIDTHS: Record<Viewport, number> = {
  desktop: 1024,
  tablet: 768,
  mobile: 375
};

export function getLayout(element: Element, viewport: Viewport): ViewportLayout {
  if (element.layouts && element.layouts[viewport]) {
    return element.layouts[viewport];
  }

  const desk = element.layouts?.desktop || {
    x: 40,
    y: 40,
    width: 200,
    height: 50,
    hidden: false
  };

  if (viewport === 'desktop') return desk;

  const targetCanvasWidth = VIEWPORT_WIDTHS[viewport];
  const deskCanvasWidth = VIEWPORT_WIDTHS.desktop;
  const ratio = targetCanvasWidth / deskCanvasWidth;

  const scaledWidth = Math.min(desk.width, targetCanvasWidth - 40);
  let scaledX = Math.round(desk.x * ratio);
  if (scaledX + scaledWidth > targetCanvasWidth - 20) {
    scaledX = Math.max(20, targetCanvasWidth - scaledWidth - 20);
  }

  return {
    x: Math.max(10, scaledX),
    y: desk.y,
    width: scaledWidth,
    height: desk.height,
    hidden: desk.hidden || false
  };
}

export function getSectionHeight(section: Section, viewport: Viewport): number {
  if (section.heights && section.heights[viewport] !== undefined) {
    return section.heights[viewport];
  }
  if (viewport === 'mobile') return Math.max(section.heights?.desktop || 400, 520);
  if (viewport === 'tablet') return Math.max(section.heights?.desktop || 400, 460);
  return section.heights?.desktop || 480;
}

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
