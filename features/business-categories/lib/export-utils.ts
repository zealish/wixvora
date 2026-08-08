import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { CategoryWithChildren } from "../types";

export interface ExportRow {
  name: string;
  slug: string;
  parentCategory: string;
  icon: string;
  displayOrder: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function prepareExportData(
  categories: CategoryWithChildren[],
  selectedIds: string[]
): ExportRow[] {
  const rows: ExportRow[] = [];
  const parentMap = new Map<string, string>();
  const categoryMap = new Map<string, ExportRow>();

  const flatten = (
    cats: CategoryWithChildren[],
    parentName: string | null = null
  ) => {
    for (const cat of cats) {
      if (parentName) {
        parentMap.set(cat.id, parentName);
      }

      const row: ExportRow = {
        name: cat.name,
        slug: cat.slug,
        parentCategory: parentMap.get(cat.id) || "—",
        icon: cat.icon || "—",
        displayOrder: cat.displayOrder,
        status: cat.status,
        createdAt: cat.createdAt.toISOString(),
        updatedAt: cat.updatedAt.toISOString(),
      };

      rows.push(row);
      categoryMap.set(cat.id, row);

      if (cat.children && cat.children.length > 0) {
        flatten(cat.children, cat.name);
      }
    }
  };

  flatten(categories);

  if (selectedIds.length > 0) {
    return selectedIds
      .map((id) => categoryMap.get(id))
      .filter((row): row is ExportRow => row !== undefined);
  }

  return rows;
}

function generateFilename(format: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const timestamp = `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
  return `business-categories-${timestamp}.${format}`;
}

export function exportToCSV(data: ExportRow[], filename?: string): void {
  try {
    if (data.length === 0) {
      throw new Error("No data to export");
    }

    const headers = [
      "Name",
      "Slug",
      "Parent Category",
      "Icon",
      "Display Order",
      "Status",
      "Created At",
      "Updated At",
    ];

    const escapeCSV = (value: string | number): string => {
      const str = String(value);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        [
          escapeCSV(row.name),
          escapeCSV(row.slug),
          escapeCSV(row.parentCategory),
          escapeCSV(row.icon),
          escapeCSV(row.displayOrder),
          escapeCSV(row.status),
          escapeCSV(row.createdAt),
          escapeCSV(row.updatedAt),
        ].join(",")
      ),
    ];

    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, filename || generateFilename("csv"));
  } catch (error) {
    console.error("CSV export failed:", error);
    throw error;
  }
}

export function exportToExcel(data: ExportRow[], filename?: string): void {
  try {
    if (data.length === 0) {
      throw new Error("No data to export");
    }

    const headers = [
      "Name",
      "Slug",
      "Parent Category",
      "Icon",
      "Display Order",
      "Status",
      "Created At",
      "Updated At",
    ];

    const rows = data.map((row) => [
      row.name,
      row.slug,
      row.parentCategory,
      row.icon,
      row.displayOrder,
      row.status,
      row.createdAt,
      row.updatedAt,
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    const columnWidths = headers.map((header, i) => {
      const maxLength = Math.max(
        header.length,
        ...rows.map((row) => String(row[i]).length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
    worksheet["!cols"] = columnWidths;

    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = { font: { bold: true } };
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, filename || generateFilename("xlsx"));
  } catch (error) {
    console.error("Excel export failed:", error);
    throw error;
  }
}

export function exportToJSON(data: ExportRow[], filename?: string): void {
  try {
    if (data.length === 0) {
      throw new Error("No data to export");
    }

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], {
      type: "application/json;charset=utf-8;",
    });
    saveAs(blob, filename || generateFilename("json"));
  } catch (error) {
    console.error("JSON export failed:", error);
    throw error;
  }
}
