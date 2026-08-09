"use client";

interface GridOverlayProps {
  showGrid: boolean;
  gridSize: number;
  zoom: number;
  panX: number;
  panY: number;
}

export function GridOverlay({
  showGrid,
  gridSize,
  zoom,
  panX,
  panY,
}: GridOverlayProps) {
  if (!showGrid) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        backgroundSize: `${gridSize / zoom}px ${gridSize / zoom}px`,
        backgroundPosition: `${panX / zoom}px ${panY / zoom}px`,
        backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px)`,
      }}
    />
  );
}
