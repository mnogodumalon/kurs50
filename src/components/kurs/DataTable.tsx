import { type ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading: boolean;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  getId: (item: T) => string;
  emptyText?: string;
}

export function DataTable<T>({ data, columns, loading, onEdit, onDelete, getId, emptyText }: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
        <span className="text-4xl">📭</span>
        <p className="font-medium">{emptyText || 'Noch keine Einträge vorhanden.'}</p>
        <p className="text-sm">Klicken Sie auf „Neu", um den ersten Eintrag zu erstellen.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {columns.map(col => (
              <TableHead key={col.key} className="font-semibold text-foreground/70 text-sm">
                {col.header}
              </TableHead>
            ))}
            <TableHead className="text-right font-semibold text-foreground/70 text-sm">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(item => (
            <TableRow key={getId(item)} className="hover:bg-muted/30 transition-colors">
              {columns.map(col => (
                <TableCell key={col.key} className="py-3">
                  {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '—')}
                </TableCell>
              ))}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item)}
                    className="h-8 w-8 p-0 hover:bg-accent"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
