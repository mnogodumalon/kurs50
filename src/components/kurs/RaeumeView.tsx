import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Building2 } from 'lucide-react';
import { LivingAppsService } from '@/services/livingAppsService';
import type { Raeume } from '@/types/app';
import { DataTable } from './DataTable';
import type { ColumnDef } from './DataTable';
import { EntityDialog } from './EntityDialog';
import type { FieldDef } from './EntityDialog';
import { DeleteConfirm } from './DeleteConfirm';
import { SectionHeader } from './SectionHeader';

export function RaeumeView() {
  const [raeume, setRaeume] = useState<Raeume[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editItem, setEditItem] = useState<Raeume | null>(null);
  const [deleteItem, setDeleteItem] = useState<Raeume | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRaeume(await LivingAppsService.getRaeume());
    } catch {
      toast.error('Fehler beim Laden der Räume');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fields: FieldDef[] = [
    { name: 'raumname', label: 'Raumname', type: 'text', required: true },
    { name: 'gebaeude', label: 'Gebäude', type: 'text' },
    { name: 'kapazitaet', label: 'Kapazität (Personen)', type: 'number' },
  ];

  const columns: ColumnDef<Raeume>[] = [
    { key: 'raumname', header: 'Raumname', render: item => <span className="font-semibold">{item.fields.raumname}</span> },
    { key: 'gebaeude', header: 'Gebäude', render: item => item.fields.gebaeude ?? '—' },
    { key: 'kapazitaet', header: 'Kapazität', render: item => item.fields.kapazitaet != null ? `${item.fields.kapazitaet} Pers.` : '—' },
  ];

  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (editItem) {
        await LivingAppsService.updateRaeumeEntry(editItem.record_id, data as Raeume['fields']);
        toast.success('Raum aktualisiert');
      } else {
        await LivingAppsService.createRaeumeEntry(data as Raeume['fields']);
        toast.success('Raum erstellt');
      }
      setDialogOpen(false);
      setEditItem(null);
      await load();
    } catch {
      toast.error('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setSaving(true);
    try {
      await LivingAppsService.deleteRaeumeEntry(deleteItem.record_id);
      toast.success('Raum gelöscht');
      setDeleteOpen(false);
      setDeleteItem(null);
      await load();
    } catch {
      toast.error('Fehler beim Löschen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Räume"
        description="Unterrichtsräume verwalten"
        count={raeume.length}
        onAdd={() => { setEditItem(null); setDialogOpen(true); }}
        addLabel="Neuer Raum"
        icon={<Building2 className="h-5 w-5 text-primary-foreground" />}
      />
      <div className="card-elevated overflow-hidden">
        <DataTable
          data={raeume}
          columns={columns}
          loading={loading}
          onEdit={item => { setEditItem(item); setDialogOpen(true); }}
          onDelete={item => { setDeleteItem(item); setDeleteOpen(true); }}
          getId={item => item.record_id}
          emptyText="Noch keine Räume vorhanden."
        />
      </div>
      <EntityDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditItem(null); }}
        onSave={handleSave}
        title={editItem ? 'Raum bearbeiten' : 'Neuer Raum'}
        fields={fields}
        initialData={editItem ? editItem.fields as Record<string, unknown> : undefined}
        loading={saving}
      />
      <DeleteConfirm
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteItem(null); }}
        onConfirm={handleDelete}
        label={deleteItem?.fields.raumname ?? ''}
        loading={saving}
      />
    </div>
  );
}
