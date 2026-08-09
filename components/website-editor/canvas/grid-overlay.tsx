"use client";

import { memo, useMemo } from "react";

interface GridOverlayProps {
  showGrid: boolean;
  gridSize: number;
  zoom: number;
  panX: number;
  panY: number;
}

// Memoize grid overlay to prevent re-renders when props haven't changed
export const GridOverlay = memo(function GridOverlay({
  showGrid,
  gridSize,
  zoom,
  panX,
  panY,
}: GridOverlayProps) {
  if (!showGrid) return null;

  // Memoize background calculations to avoid expensive recalculations on every render
  const backgroundSize = useMemo(() => `${gridSize / zoom}px ${gridSize / zoom}px`, [gridSize, zoom]);
  const backgroundPosition = useMemo(() => `${panX / zoom}px ${panY / zoom}px`, [panX, panY, zoom]);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        backgroundSize,
        backgroundPosition,
        backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px)`,
      }}
    />
  );
}, (prevProps, nextProps) => {
  // Only re-render if showGrid changes or grid parameters change
  return prevProps.showGrid === nextProps.showGrid && 
         prevProps.gridSize === nextProps.gridSize &&
         prevProps.zoom === nextProps.zoom &&
         prevProps.panX === nextProps.panX &&
         prevProps.panY === nextProps.panY;
});
