import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Users } from 'lucide-react';
import { LivingAppsService } from '@/services/livingAppsService';
import type { Teilnehmer } from '@/types/app';
import { DataTable } from './DataTable';
import type { ColumnDef } from './DataTable';
import { EntityDialog } from './EntityDialog';
import type { FieldDef } from './EntityDialog';
import { DeleteConfirm } from './DeleteConfirm';
import { SectionHeader } from './SectionHeader';

export function TeilnehmerView() {
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editItem, setEditItem] = useState<Teilnehmer | null>(null);
  const [deleteItem, setDeleteItem] = useState<Teilnehmer | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTeilnehmer(await LivingAppsService.getTeilnehmer());
    } catch {
      toast.error('Fehler beim Laden der Teilnehmer');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fields: FieldDef[] = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'E-Mail', type: 'email' },
    { name: 'telefon', label: 'Telefon', type: 'text' },
    { name: 'geburtsdatum', label: 'Geburtsdatum', type: 'date' },
  ];

  const columns: ColumnDef<Teilnehmer>[] = [
    { key: 'name', header: 'Name', render: item => <span className="font-semibold">{item.fields.name}</span> },
    { key: 'email', header: 'E-Mail', render: item => item.fields.email ?? '—' },
    { key: 'telefon', header: 'Telefon', render: item => item.fields.telefon ?? '—' },
    { key: 'geburtsdatum', header: 'Geburtsdatum', render: item => item.fields.geburtsdatum ?? '—' },
  ];

  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (editItem) {
        await LivingAppsService.updateTeilnehmerEntry(editItem.record_id, data as Teilnehmer['fields']);
        toast.success('Teilnehmer aktualisiert');
      } else {
        await LivingAppsService.createTeilnehmerEntry(data as Teilnehmer['fields']);
        toast.success('Teilnehmer erstellt');
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
      await LivingAppsService.deleteTeilnehmerEntry(deleteItem.record_id);
      toast.success('Teilnehmer gelöscht');
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
        title="Teilnehmer"
        description="Angemeldete Personen verwalten"
        count={teilnehmer.length}
        onAdd={() => { setEditItem(null); setDialogOpen(true); }}
        addLabel="Neuer Teilnehmer"
        icon={<Users className="h-5 w-5 text-primary-foreground" />}
      />
      <div className="card-elevated overflow-hidden">
        <DataTable
          data={teilnehmer}
          columns={columns}
          loading={loading}
          onEdit={item => { setEditItem(item); setDialogOpen(true); }}
          onDelete={item => { setDeleteItem(item); setDeleteOpen(true); }}
          getId={item => item.record_id}
          emptyText="Noch keine Teilnehmer vorhanden."
        />
      </div>
      <EntityDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditItem(null); }}
        onSave={handleSave}
        title={editItem ? 'Teilnehmer bearbeiten' : 'Neuer Teilnehmer'}
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
