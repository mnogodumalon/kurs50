import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  count?: number;
  onAdd: () => void;
  addLabel?: string;
  icon?: ReactNode;
}

export function SectionHeader({ title, description, count, onAdd, addLabel, icon }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-xl stat-hero">
            {icon}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">{title}</h2>
            {count !== undefined && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                {count}
              </span>
            )}
          </div>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      <Button onClick={onAdd} className="btn-brand shrink-0 gap-1.5">
        <Plus className="h-4 w-4" />
        {addLabel || 'Neu'}
      </Button>
    </div>
  );
}
