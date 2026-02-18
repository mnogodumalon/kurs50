import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export interface FieldDef {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select' | 'boolean';
  required?: boolean;
  options?: { value: string; label: string }[];
}

interface EntityDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  title: string;
  fields: FieldDef[];
  initialData?: Record<string, unknown>;
  loading?: boolean;
}

export function EntityDialog({ open, onClose, onSave, title, fields, initialData, loading }: EntityDialogProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Record<string, unknown>>();

  useEffect(() => {
    if (open) {
      if (initialData) {
        fields.forEach(f => {
          setValue(f.name, initialData[f.name] ?? '');
        });
      } else {
        reset({});
      }
    }
  }, [open, initialData, fields, setValue, reset]);

  const onSubmit = async (data: Record<string, unknown>) => {
    const cleaned: Record<string, unknown> = {};
    fields.forEach(f => {
      const val = data[f.name];
      if (f.type === 'number') {
        cleaned[f.name] = val !== '' && val != null ? Number(val) : undefined;
      } else if (f.type === 'boolean') {
        cleaned[f.name] = val === true || val === 'true';
      } else {
        cleaned[f.name] = val !== '' ? val : undefined;
      }
    });
    await onSave(cleaned);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {fields.map(field => (
            <div key={field.name} className="space-y-1.5">
              <Label htmlFor={field.name} className="text-sm font-medium">
                {field.label}{field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.name}
                  {...register(field.name, { required: field.required })}
                  rows={3}
                  className="resize-none"
                />
              ) : field.type === 'boolean' ? (
                <div className="flex items-center gap-2">
                  <Switch
                    id={field.name}
                    checked={!!watch(field.name)}
                    onCheckedChange={val => setValue(field.name, val)}
                  />
                  <span className="text-sm text-muted-foreground">{watch(field.name) ? 'Ja' : 'Nein'}</span>
                </div>
              ) : field.type === 'select' && field.options ? (
                <Select
                  value={String(watch(field.name) ?? '')}
                  onValueChange={val => setValue(field.name, val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`${field.label} wählen…`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.name}
                  type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : 'text'}
                  step={field.type === 'number' ? 'any' : undefined}
                  {...register(field.name, { required: field.required })}
                  className={errors[field.name] ? 'border-destructive' : ''}
                />
              )}
              {errors[field.name] && (
                <p className="text-xs text-destructive">Pflichtfeld</p>
              )}
            </div>
          ))}
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading} className="btn-brand">
              {loading ? 'Speichern…' : 'Speichern'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
