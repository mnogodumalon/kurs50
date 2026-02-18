import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { GraduationCap } from 'lucide-react';
import { LivingAppsService } from '@/services/livingAppsService';
import type { Dozenten } from '@/types/app';
import { DataTable } from './DataTable';
import type { ColumnDef } from './DataTable';
import { EntityDialog } from './EntityDialog';
import type { FieldDef } from './EntityDialog';
import { DeleteConfirm } from './DeleteConfirm';
import { SectionHeader } from './SectionHeader';

export function DozentView() {
  const [dozenten, setDozenten] = useState<Dozenten[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editItem, setEditItem] = useState<Dozenten | null>(null);
  const [deleteItem, setDeleteItem] = useState<Dozenten | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDozenten(await LivingAppsService.getDozenten());
    } catch {
      toast.error('Fehler beim Laden der Dozenten');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fields: FieldDef[] = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'E-Mail', type: 'email' },
    { name: 'telefon', label: 'Telefon', type: 'text' },
    { name: 'fachgebiet', label: 'Fachgebiet', type: 'text' },
  ];

  const columns: ColumnDef<Dozenten>[] = [
    { key: 'name', header: 'Name', render: item => <span className="font-semibold">{item.fields.name}</span> },
    { key: 'fachgebiet', header: 'Fachgebiet', render: item => item.fields.fachgebiet ?? '—' },
    { key: 'email', header: 'E-Mail', render: item => item.fields.email ?? '—' },
    { key: 'telefon', header: 'Telefon', render: item => item.fields.telefon ?? '—' },
  ];

  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (editItem) {
        await LivingAppsService.updateDozentenEntry(editItem.record_id, data as Dozenten['fields']);
        toast.success('Dozent aktualisiert');
      } else {
        await LivingAppsService.createDozentenEntry(data as Dozenten['fields']);
        toast.success('Dozent erstellt');
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
      await LivingAppsService.deleteDozentenEntry(deleteItem.record_id);
      toast.success('Dozent gelöscht');
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
        title="Dozenten"
        description="Lehrende verwalten"
        count={dozenten.length}
        onAdd={() => { setEditItem(null); setDialogOpen(true); }}
        addLabel="Neuer Dozent"
        icon={<GraduationCap className="h-5 w-5 text-primary-foreground" />}
      />
      <div className="card-elevated overflow-hidden">
        <DataTable
          data={dozenten}
          columns={columns}
          loading={loading}
          onEdit={item => { setEditItem(item); setDialogOpen(true); }}
          onDelete={item => { setDeleteItem(item); setDeleteOpen(true); }}
          getId={item => item.record_id}
          emptyText="Noch keine Dozenten vorhanden."
        />
      </div>
      <EntityDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditItem(null); }}
        onSave={handleSave}
        title={editItem ? 'Dozent bearbeiten' : 'Neuer Dozent'}
        fields={fields}
        initialData={editItem ? editItem.fields as Record<string, unknown> : undefined}
        loading={saving}
      />
      <DeleteConfirm
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteItem(null); }}
        onConfirm={handleDelete}
        label={deleteItem?.fields.name ?? ''}
        loading={saving}
      />
    </div>
  );
}
