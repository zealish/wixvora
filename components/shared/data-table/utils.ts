import { cn } from "@/lib/utils";
import type { ResponsiveBreakpoint } from "./types";

export function getValue<T = unknown>(
  obj: Record<string, unknown>,
  path: string
): T | undefined {
  if (!path) return obj as T;
  const keys = path.split(".");
  let result: unknown = obj;
  for (const key of keys) {
    if (result === null || result === undefined) return undefined;
    result = (result as Record<string, unknown>)[key];
  }
  return result as T;
}

export function formatExportValue(value: unknown): string | number | boolean {
  if (value instanceof Date) {
    return value.toISOString().split("T")[0] || "";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }
  return String(value);
}

interface ColumnMetaNormalized {
  align: "left" | "center" | "right";
  wrap: boolean;
  truncate: boolean;
  visibleFrom: ResponsiveBreakpoint;
  exportable: boolean;
  hideOnExport: boolean;
}

export function normalizeColumnMeta(
  meta?: Partial<ColumnMetaNormalized>
): ColumnMetaNormalized {
  return {
    align: meta?.align ?? "left",
    wrap: meta?.wrap ?? false,
    truncate: meta?.truncate ?? true,
    visibleFrom: meta?.visibleFrom ?? "always",
    exportable: meta?.exportable ?? true,
    hideOnExport: meta?.hideOnExport ?? false,
  };
}

export function getResponsiveClasses(
  visibleFrom?: ResponsiveBreakpoint
): string {
  if (!visibleFrom || visibleFrom === "always") return "";
  
  // Mobile-first: hide on mobile, show on larger screens
  // md = hide below 768px, show at 768px+
  // lg = hide below 1024px, show at 1024px+
  switch (visibleFrom) {
    case "md":
      return "hidden md:table-cell";
    case "lg":
      return "hidden lg:table-cell";
    case "xl":
      return "hidden xl:table-cell";
    default:
      return "";
  }
}

export function getHeaderStyles(meta?: {
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  headerStyle?: React.CSSProperties;
}): React.CSSProperties {
  const styles: React.CSSProperties = { ...meta?.headerStyle };

  if (meta?.width) {
    styles.width = `${meta.width}px`;
  }

  if (meta?.minWidth) {
    styles.minWidth = `${meta.minWidth}px`;
  }

  if (meta?.maxWidth) {
    styles.maxWidth = `${meta.maxWidth}px`;
  }

  return styles;
}

export function getCellStyles(meta?: {
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  cellStyle?: React.CSSProperties;
}): React.CSSProperties {
  const styles: React.CSSProperties = { ...meta?.cellStyle };

  if (meta?.width) {
    styles.width = `${meta.width}px`;
  }

  if (meta?.minWidth) {
    styles.minWidth = `${meta.minWidth}px`;
  }

  if (meta?.maxWidth) {
    styles.maxWidth = `${meta.maxWidth}px`;
  }

  return styles;
}

export function getColumnClasses(
  meta?: {
    align?: "left" | "center" | "right";
    wrap?: boolean;
    truncate?: boolean;
    visibleFrom?: ResponsiveBreakpoint;
    cellClassName?: string;
  },
  type: "header" | "cell" = "cell"
): string {
  const normalized = normalizeColumnMeta(meta);
  const customClassName = type === "header" ? meta?.cellClassName : meta?.cellClassName;

  return cn(
    normalized.align === "center" && "text-center",
    normalized.align === "right" && "text-right",
    normalized.truncate && !normalized.wrap && "truncate",
    normalized.wrap && "whitespace-normal",
    getResponsiveClasses(normalized.visibleFrom),
    customClassName
  );
}

export function getHeaderClasses(meta?: {
  align?: "left" | "center" | "right";
  visibleFrom?: ResponsiveBreakpoint;
  headerClassName?: string;
}): string {
  const normalized = normalizeColumnMeta(meta);

  return cn(
    normalized.align === "center" && "text-center",
    normalized.align === "right" && "text-right",
    getResponsiveClasses(normalized.visibleFrom),
    meta?.headerClassName
  );
}

export function getCellClasses(meta?: {
  align?: "left" | "center" | "right";
  wrap?: boolean;
  truncate?: boolean;
  visibleFrom?: ResponsiveBreakpoint;
  cellClassName?: string;
}): string {
  const normalized = normalizeColumnMeta(meta);

  return cn(
    normalized.align === "center" && "text-center",
    normalized.align === "right" && "text-right",
    normalized.truncate && !normalized.wrap && "truncate",
    normalized.wrap && "whitespace-normal",
    getResponsiveClasses(normalized.visibleFrom),
    meta?.cellClassName
  );
}
