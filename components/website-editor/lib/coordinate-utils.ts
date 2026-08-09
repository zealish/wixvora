// components/website-editor/lib/coordinate-utils.ts

/**
 * Convert screen/viewport coordinates → canvas coordinates
 * @param screenX - Mouse X coordinate in screen space
 * @param screenY - Mouse Y coordinate in screen space
 * @param canvasBounds - Canvas DOM element bounding rectangle
 * @param zoom - Current zoom level (e.g., 1.0 = 100%)
 * @param panX - Horizontal pan offset
 * @param panY - Vertical pan offset
 * @returns Canvas coordinates {x, y}
 */
export function screenToCanvas(
  screenX: number,
  screenY: number,
  canvasBounds: DOMRect,
  zoom: number,
  panX: number,
  panY: number
): { x: number; y: number } {
  const canvasX = (screenX - canvasBounds.left - panX) / zoom;
  const canvasY = (screenY - canvasBounds.top - panY) / zoom;
  return { x: canvasX, y: canvasY };
}

/**
 * Convert canvas coordinates → screen/viewport coordinates
 * @param canvasX - Canvas X coordinate
 * @param canvasY - Canvas Y coordinate
 * @param canvasBounds - Canvas DOM element bounding rectangle
 * @param zoom - Current zoom level
 * @param panX - Horizontal pan offset
 * @param panY - Vertical pan offset
 * @returns Screen coordinates {x, y}
 */
export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  canvasBounds: DOMRect,
  zoom: number,
  panX: number,
  panY: number
): { x: number; y: number } {
  const screenX = (canvasX * zoom) + canvasBounds.left + panX;
  const screenY = (canvasY * zoom) + canvasBounds.top + panY;
  return { x: screenX, y: screenY };
}

/**
 * Snap a value to the nearest grid cell
 * @param value - Position value to snap
 * @param gridSize - Grid size in pixels
 * @returns Snapped value
 */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Check if a point is inside a rectangular area (in canvas coordinates)
 */
export function isPointInRect(
  pointX: number,
  pointY: number,
  rectX: number,
  rectY: number,
  rectWidth: number,
  rectHeight: number
): boolean {
  return (
    pointX >= rectX &&
    pointX <= rectX + rectWidth &&
    pointY >= rectY &&
    pointY <= rectY + rectHeight
  );
}
