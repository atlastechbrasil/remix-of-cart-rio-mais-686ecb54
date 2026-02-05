import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  /** Hide this column on mobile cards (still shows in table) */
  hideOnMobile?: boolean;
  /** Custom render function */
  render?: (item: T, index: number) => React.ReactNode;
  /** CSS class for the cell */
  className?: string;
}

export interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  /** Key extractor for React list keys */
  keyExtractor: (item: T, index: number) => string;
  /** Optional: render custom actions for each row */
  renderActions?: (item: T, index: number) => React.ReactNode;
  /** Optional: custom empty state */
  emptyMessage?: string;
  /** Optional: loading state */
  isLoading?: boolean;
  /** Optional: class for table container */
  className?: string;
  /** Optional: callback when row is clicked */
  onRowClick?: (item: T, index: number) => void;
}

function getCellValue<T>(item: T, key: keyof T | string): React.ReactNode {
  if (typeof key === "string" && key.includes(".")) {
    // Handle nested keys like "user.name"
    const keys = key.split(".");
    let value: unknown = item;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return value as React.ReactNode;
  }
  return item[key as keyof T] as React.ReactNode;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  renderActions,
  emptyMessage = "Nenhum item encontrado",
  isLoading = false,
  className,
  onRowClick,
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  // Mobile: Card layout
  if (isMobile) {
    return (
      <div className={cn("space-y-3", className)}>
        {data.map((item, index) => (
          <Card
            key={keyExtractor(item, index)}
            className={cn(
              "overflow-hidden",
              onRowClick && "cursor-pointer active:bg-muted/50"
            )}
            onClick={() => onRowClick?.(item, index)}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                {columns
                  .filter((col) => !col.hideOnMobile)
                  .map((column) => (
                    <div
                      key={String(column.key)}
                      className="flex items-start justify-between gap-2"
                    >
                      <span className="text-sm font-medium text-muted-foreground">
                        {column.header}
                      </span>
                      <span className={cn("text-sm text-right", column.className)}>
                        {column.render
                          ? column.render(item, index)
                          : getCellValue(item, column.key)}
                      </span>
                    </div>
                  ))}
              </div>
              {renderActions && (
                <div className="mt-4 flex justify-end gap-2 border-t pt-3">
                  {renderActions(item, index)}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop: Table layout
  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={String(column.key)} className={column.className}>
                {column.header}
              </TableHead>
            ))}
            {renderActions && <TableHead className="w-[100px]">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={keyExtractor(item, index)}
              className={cn(onRowClick && "cursor-pointer")}
              onClick={() => onRowClick?.(item, index)}
            >
              {columns.map((column) => (
                <TableCell key={String(column.key)} className={column.className}>
                  {column.render
                    ? column.render(item, index)
                    : getCellValue(item, column.key)}
                </TableCell>
              ))}
              {renderActions && (
                <TableCell>
                  <div className="flex items-center gap-1">
                    {renderActions(item, index)}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
