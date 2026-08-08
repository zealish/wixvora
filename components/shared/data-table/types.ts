import type {
  ColumnDef,
  InitialTableState,
  PaginationState,
  SortingState,
  ColumnFiltersState,
  RowData,
} from "@tanstack/react-table";

// String path to support nested access (e.g. 'staff.department')
export type DataTableField = string;

// Responsive breakpoint for column visibility
export type ResponsiveBreakpoint = "always" | "md" | "lg" | "xl";

export interface DataTableProps<TData> {
  tableId: string;
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  rowId?: (row: TData) => string;
  loading?: boolean;
  error?: Error | null;
  initialState?: Partial<InitialTableState>;
  enabledFeatures?: Partial<DataTableFeatures>;
  search?: DataTableSearch;
  filters?: DataTableFilter[];
  bulkActions?: DataTableBulkAction<TData>[];
  exportOptions?: DataTableExportOptions<TData>;
  pagination?: PaginationState;
  pageSizeOptions?: number[];
  pageCount?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  onGlobalFilterChange?: (filter: string) => void;
  locale?: DataTableLocale;
  slots?: DataTableSlots<TData>;
}

export interface DataTableFeatures {
  sorting: boolean;
  filtering: boolean;
  pagination: boolean;
  export: boolean;
  rowSelection: boolean;
  columnVisibility: boolean;
}

export interface DataTableSearch {
  keys: DataTableField[];
  placeholder?: string;
  debounce?: number;
}

export interface DataTableFilter {
  id: string;
  label: string;
  type: "faceted" | "advanced";
  column: DataTableField;
  options?: FilterOption[];
}

export interface FilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface DataTableBulkAction<TData> {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "destructive";
  onAction: (context: BulkActionContext<TData>) => void | Promise<void>;
}

export interface BulkActionContext<TData> {
  rows: TData[];
  table: DataTableInstance<TData>;
}

export interface DataTableExportOptions<TData> {
  csv?: boolean;
  excel?: boolean;
  filename?: string;
  excludeColumns?: string[];
  onlySelected?: boolean;
  transform?: (row: TData) => unknown;
}

export interface DataTableLocale {
  searchPlaceholder?: string;
  noResults?: string;
  rowsSelected?: (count: number) => string;
  loading?: string;
  error?: string;
  export?: {
    csv?: string;
    excel?: string;
  };
}

export interface DataTableSlots<TData> {
  emptyState?: React.ComponentType;
  loading?: React.ComponentType;
  error?: React.ComponentType<{ error: Error }>;
  toolbar?: React.ComponentType<{ table: DataTableInstance<TData> }>;
}

export interface DataTableInstance<TData> {
  getSelectedRows: () => TData[];
  resetRowSelection: () => void;
}

// Column meta augmentation for DataTable-specific features
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
    filterVariant?: "text" | "select" | "date" | "number";
    exportable?: boolean;
    hideOnExport?: boolean;
    searchable?: boolean;
    copyable?: boolean;
    align?: "left" | "center" | "right";
    sortableLabel?: string;
    tooltip?: string;
    exportFormatter?: (value: unknown) => string | number | boolean | null;
    
    // Width constraints
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    
    // Text behavior
    wrap?: boolean;
    truncate?: boolean;
    
    // Responsive visibility
    visibleFrom?: ResponsiveBreakpoint;
    
    // Custom styling
    className?: string;
    headerClassName?: string;
    cellClassName?: string;
    cellStyle?: React.CSSProperties;
    headerStyle?: React.CSSProperties;
    
    // Future-proofing
    sticky?: "left" | "right";
  }
}
