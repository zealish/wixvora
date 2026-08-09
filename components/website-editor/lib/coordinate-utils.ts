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

/**
 * Snap one edge/center to another object's edge/center
 * @param value1 - Position of first object (x or width)
 * @param value2 - Object reference position/size
 * @param alignment - How to align: 'left', 'right', or 'center'
 * @returns Snapped position
 */
export function snapToEdge(
  x1: number,
  width1: number,
  x2: number,
  width2: number,
  alignment: 'left' | 'right' | 'center'
): number {
  // Calculate the target position based on alignment
  let targetPosition: number;
  
  switch (alignment) {
    case 'left':
      // Align left edges
      targetPosition = x2;
      break;
    case 'right':
      // Align right edges
      targetPosition = x2 + width2 - width1;
      break;
    case 'center':
      // Center x1 relative to x2
      targetPosition = x2 + (width2 / 2) - (width1 / 2);
      break;
    default:
      return x1;
  }
  
  return targetPosition;
}

/**
 * Calculate potential snap positions for a block based on all other blocks
 * @param currentX - Current X position of the block being dragged
 * @param currentY - Current Y position of the block being dragged
 * @param currentWidth - Width of the block being dragged
 * @param currentHeight - Height of the block being dragged
 * @param allBlocks - All other blocks in the canvas
 * @param threshold - Distance threshold in pixels for snapping (default: 10)
 * @returns Array of potential snap positions with their distances
 */
export function getSnappedPosition(
  currentX: number,
  currentY: number,
  currentWidth: number,
  currentHeight: number,
  allBlocks: any[],
  threshold: number = 10
): {
  x: number;
  y: number;
  snaps: {
    type: string;
    distance: number;
    targetBlockId: string;
    alignment: string;
  }[];
} {
  const snaps: {
    type: string;
    distance: number;
    targetBlockId: string;
    alignment: string;
  }[] = [];
  
  let snappedX = currentX;
  let snappedY = currentY;
  
  // Check horizontal alignments with other blocks
  for (const block of allBlocks) {
    if (!block.x || !block.props?.width || !block.props?.height) continue;
    
  const bX = block.x;
  const bY = block.y;
  const bWidth = block.props.width;
  const bHeight = block.props.height;
  
  // Skip if it's the same block
  if (block.id === 'dragging-block') continue;
  
  // Calculate offsets for different alignments
  const offsetX_Left = bX - currentX;
  const offsetX_Right = (bX + bWidth) - (currentX + currentWidth);
  const offsetX_Center = (bX + bWidth / 2) - (currentX + currentWidth / 2);
  
  // Vertical alignments
  const offsetY_Top = bY - currentY;
  const offsetY_Bottom = (bY + bHeight) - (currentY + currentHeight);
  const offsetY_Middle = (bY + bHeight / 2) - (currentY + currentHeight / 2);
    
    // Check if any offset is within threshold
    const absLeft = Math.abs(offsetX_Left);
    const absRight = Math.abs(offsetX_Right);
    const absCenter = Math.abs(offsetX_Center);
    
    if (absLeft < threshold) {
      snaps.push({
        type: 'edge',
        distance: absLeft,
        targetBlockId: block.id,
        alignment: 'left'
      });
      if (absLeft < Math.abs(snappedX - currentX)) {
        snappedX = currentX + offsetX_Left;
      }
    }
    
    if (absRight < threshold) {
      snaps.push({
        type: 'edge',
        distance: absRight,
        targetBlockId: block.id,
        alignment: 'right'
      });
      if (absRight < Math.abs(snappedX - currentX)) {
        snappedX = currentX + offsetX_Right;
      }
    }
    
    if (absCenter < threshold) {
      snaps.push({
        type: 'edge',
        distance: absCenter,
        targetBlockId: block.id,
        alignment: 'center'
      });
      if (absCenter < Math.abs(snappedX - currentX)) {
        snappedX = currentX + offsetX_Center;
      }
    }
    
    // Vertical alignments
    const absTop = Math.abs(offsetY_Top);
    const absBottom = Math.abs(offsetY_Bottom);
    const absMiddle = Math.abs(offsetY_Middle);
    
    if (absTop < threshold) {
      snaps.push({
        type: 'edge',
        distance: absTop,
        targetBlockId: block.id,
        alignment: 'top'
      });
      if (absTop < Math.abs(snappedY - currentY)) {
        snappedY = currentY + offsetY_Top;
      }
    }
    
    if (absBottom < threshold) {
      snaps.push({
        type: 'edge',
        distance: absBottom,
        targetBlockId: block.id,
        alignment: 'bottom'
      });
      if (absBottom < Math.abs(snappedY - currentY)) {
        snappedY = currentY + offsetY_Bottom;
      }
    }
    
    if (absMiddle < threshold) {
      snaps.push({
        type: 'edge',
        distance: absMiddle,
        targetBlockId: block.id,
        alignment: 'middle'
      });
      if (absMiddle < Math.abs(snappedY - currentY)) {
        snappedY = currentY + offsetY_Middle;
      }
    }
  }
  
  return {
    x: snappedX,
    y: snappedY,
    snaps
  };
}
