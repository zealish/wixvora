"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuditLogDetailDialog } from "./audit-log-detail-dialog";
import { AuditLogsExportMenu } from "./audit-logs-export-menu";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Settings, Search, X, FileText } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import type { AuditLogsFilters, AuditLogWithUser } from "../types";
import { columns as allColumns, formatActionEmoji } from "./columns";
import { toast } from "@/components/ui/toast";
import * as XLSX from "xlsx";
import { format } from "date-fns";

interface AuditLogsTableProps {
  data: AuditLogWithUser[];
  total: number;
  filters: AuditLogsFilters;
  distinctActions: string[];
  distinctEntities: string[];
}

async function generateExportBlob(
  data: AuditLogWithUser[],
  format: "csv" | "xlsx" | "json"
): Promise<Blob> {
  if (format === "csv") {
    const headers = [
      "Timestamp",
      "User Name",
      "User Email",
      "Action",
      "Entity",
      "Entity ID",
      "IP Address",
      "User Agent",
      "Metadata",
    ];

    const rows = data.map((log) => {
      const metadataStr = log.metadata
        ? JSON.stringify(log.metadata).replace(/"/g, '""')
        : "";
      return [
        `"${log.createdAt.toISOString()}"`,
        `"${log.user?.name || "System"}"`,
        `"${log.user?.email || ""}"`,
        `"${log.action}"`,
        `"${log.entity}"`,
        `"${log.entityId || ""}"`,
        `"${log.ipAddress || ""}"`,
        `"${log.userAgent || ""}"`,
        `"${metadataStr}"`,
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    return new Blob([csv], { type: "text/csv;charset=utf-8;" });
  } else if (format === "json") {
    const jsonData = data.map((log) => ({
      id: log.id,
      timestamp: log.createdAt.toISOString(),
      user: {
        id: log.user?.id,
        name: log.user?.name,
        email: log.user?.email,
      },
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      metadata: log.metadata,
      loggedById: log.userId,
    }));
    return new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
  } else if (format === "xlsx") {
    const headers = [
      "Timestamp",
      "User Name",
      "User Email",
      "Action",
      "Entity",
      "Entity ID",
      "IP Address",
      "User Agent",
      "Metadata",
    ];

    const rows = data.map((log) => {
      const metadata = log.metadata ? JSON.stringify(log.metadata) : "";
      return [
        log.createdAt.toISOString(),
        log.user?.name || "System",
        log.user?.email || "",
        log.action,
        log.entity,
        log.entityId || "",
        log.ipAddress || "",
        log.userAgent || "",
        metadata,
      ];
    });

    const worksheetData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit Logs");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    return new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }

  return new Blob([]);
}

function getExportFilename(format: string): string {
  const timestamp = new Date().toISOString().split("T")[0];
  return `audit-logs-${timestamp}.${format}`;
}

export function AuditLogsTable({
  data,
  total,
  filters,
  distinctActions,
  distinctEntities,
}: AuditLogsTableProps): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sorting, setSorting] = useState<SortingState>([
    { id: filters.sortBy || "createdAt", desc: filters.sortOrder === "desc" },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [detailLog, setDetailLog] = useState<AuditLogWithUser | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState(filters.searchTerm || "");
  const [selectedAction, setSelectedAction] = useState<string>(filters.action || "");
  const [selectedEntity, setSelectedEntity] = useState<string>(filters.entity || "");
  const [startDateInput, setStartDateInput] = useState(
    filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : ""
  );
  const [endDateInput, setEndDateInput] = useState(
    filters.endDate ? format(filters.endDate, "yyyy-MM-dd") : ""
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (filters.searchTerm || "")) {
        applyFilters({ page: 1, searchTerm: searchInput });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const columnDefs = useMemo(
    () => allColumns as ColumnDef<AuditLogWithUser>[],
    []
  );

  const table = useReactTable({
    data,
    columns: columnDefs,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualSorting: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleRowClick = (row: AuditLogWithUser): void => {
    setDetailLog(row);
  };

  const applyFilters = (newFilters: Partial<AuditLogsFilters>): void => {
    const params = new URLSearchParams(searchParams.toString());

    if (newFilters.page) params.set("page", newFilters.page.toString());
    if (newFilters.pageSize)
      params.set("pageSize", newFilters.pageSize.toString());
    if (newFilters.action) params.set("action", newFilters.action);
    else if ("action" in newFilters) params.delete("action");
    if (newFilters.entity) params.set("entity", newFilters.entity);
    else if ("entity" in newFilters) params.delete("entity");
    if (newFilters.searchTerm) params.set("search", newFilters.searchTerm);
    else if ("searchTerm" in newFilters) params.delete("search");
    if (newFilters.startDate)
      params.set("startDate", format(newFilters.startDate, "yyyy-MM-dd"));
    else if ("startDate" in newFilters) params.delete("startDate");
    if (newFilters.endDate)
      params.set("endDate", format(newFilters.endDate, "yyyy-MM-dd"));
    else if ("endDate" in newFilters) params.delete("endDate");
    if (newFilters.sortBy) params.set("sortBy", newFilters.sortBy);
    if (newFilters.sortOrder) params.set("sortOrder", newFilters.sortOrder);

    router.push(`/staff/audit-logs?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <AuditLogDetailDialog
        open={!!detailLog}
        onOpenChange={(open) => !open && setDetailLog(null)}
        log={detailLog}
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user name, email, or entity ID..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="w-full sm:w-[200px]">
            <label className="text-sm font-medium mb-2 block">Action</label>
            <Select
              value={selectedAction}
              onValueChange={(value) => {
                setSelectedAction(value || "");
                applyFilters({ page: 1, action: value || "" });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All actions</SelectItem>
                {distinctActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    <span className="flex items-center gap-2">
                      <span>{formatActionEmoji(action)}</span>
                      <span>{action}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-[200px]">
            <label className="text-sm font-medium mb-2 block">Entity</label>
            <Select
              value={selectedEntity}
              onValueChange={(value) => {
                setSelectedEntity(value || "");
                applyFilters({ page: 1, entity: value || "" });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All entities</SelectItem>
                {distinctEntities.map((entity) => (
                  <SelectItem key={entity} value={entity}>
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{entity}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="w-full sm:w-[200px]">
            <label className="text-sm font-medium mb-2 block">Start Date</label>
            <Input
              type="date"
              value={startDateInput}
              onChange={(e) => {
                setStartDateInput(e.target.value);
                if (e.target.value) {
                  applyFilters({ page: 1, startDate: new Date(e.target.value) });
                } else {
                  const params = new URLSearchParams(
                    window.location.search
                  );
                  params.delete("startDate");
                  params.set("page", "1");
                  router.push(`/staff/audit-logs?${params.toString()}`);
                }
              }}
            />
          </div>

          <div className="w-full sm:w-[200px]">
            <label className="text-sm font-medium mb-2 block">End Date</label>
            <Input
              type="date"
              value={endDateInput}
              onChange={(e) => {
                setEndDateInput(e.target.value);
                if (e.target.value) {
                  const date = new Date(e.target.value);
                  date.setHours(23, 59, 59, 999);
                  applyFilters({ page: 1, endDate: date });
                } else {
                  const params = new URLSearchParams(
                    window.location.search
                  );
                  params.delete("endDate");
                  params.set("page", "1");
                  router.push(`/staff/audit-logs?${params.toString()}`);
                }
              }}
            />
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setSearchInput("");
              setSelectedAction("");
              setSelectedEntity("");
              setStartDateInput("");
              setEndDateInput("");
              router.push("/staff/audit-logs?page=1");
            }}
            className="w-full sm:w-auto"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">
            {filters.action ||
            filters.entity ||
            filters.searchTerm ||
            filters.startDate ||
            filters.endDate
              ? "Filtered Results"
              : "All Audit Logs"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {filters.action ||
            filters.entity ||
            filters.searchTerm ||
            filters.startDate ||
            filters.endDate
              ? `Viewing filtered results (${total} total)`
              : `Showing ${table.getRowModel().rows.length} of ${total} logs`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AuditLogsExportMenu
            onExport={async (format) => {
              const blob = await generateExportBlob(data, format);
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = getExportFilename(format);
              a.click();
              URL.revokeObjectURL(url);
              toast.add({
                type: "success",
                title: "Export successful",
                description: `Exported as ${format.toUpperCase()}`,
              });
            }}
          />
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
            >
              <Settings className="mr-2 h-4 w-4" />
              Columns
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {header.column.getCanSort() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-2"
                        onClick={() => {
                          if (!header.column.getIsSorted()) {
                            applyFilters({
                              sortBy: header.column.id as
                                | "createdAt"
                                | "action"
                                | "entity",
                              sortOrder: "asc",
                            });
                          } else if (header.column.getIsSorted() === "asc") {
                            applyFilters({
                              sortBy: header.column.id as
                                | "createdAt"
                                | "action"
                                | "entity",
                              sortOrder: "desc",
                            });
                          } else {
                            applyFilters({
                              sortBy: "createdAt",
                              sortOrder: "desc",
                            });
                          }
                        }}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-4xl">📄</span>
                    <p className="text-muted-foreground">No audit logs found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={
                    hoveredRowId === row.id
                      ? "bg-accent/50 cursor-pointer"
                      : "cursor-pointer hover:bg-accent/50"
                  }
                  onClick={() => handleRowClick(row.original)}
                  onMouseEnter={() => setHoveredRowId(row.id)}
                  onMouseLeave={() => setHoveredRowId(null)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex-1 text-sm text-muted-foreground">
          <span>
            Page {filters.page || 1} of{" "}
            {Math.ceil(total / (filters.pageSize || 50))}
          </span>
          {" | "}
          <span>{total} total logs</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyFilters({ page: Math.max(1, (filters.page || 1) - 1) })}
            disabled={filters.page === undefined || filters.page === 1}
          >
            {"<"} Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyFilters({ page: (filters.page || 1) + 1 })}
            disabled={
              filters.page !== undefined &&
              filters.page >= Math.ceil(total / (filters.pageSize || 50))
            }
          >
            Next {">"}
          </Button>
        </div>
      </div>
    </div>
  );
}
