'use client';

import { Inbox } from 'lucide-react';

interface DataTableEmptyStateProps {
  message?: string;
}

export function DataTableEmptyState({
  message = 'No results found.',
}: DataTableEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Inbox className="mb-4 size-12" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
