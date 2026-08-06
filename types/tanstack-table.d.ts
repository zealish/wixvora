import '@tanstack/table-core';

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData, TValue> {
    label?: string;
    filterVariant?: 'text' | 'select' | 'date' | 'number';
    exportable?: boolean;
    searchable?: boolean;
    copyable?: boolean;
    align?: 'left' | 'center' | 'right';
    width?: number;
    className?: string;
    headerClassName?: string;
    sortableLabel?: string;
    tooltip?: string;
    truncate?: boolean;
    exportFormatter?: (value: unknown) => string | number | boolean | null;
  }
}
