import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { BookOpen } from 'lucide-react';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { APP_IDS } from '@/types/app';
import type { Kurse, Dozenten, Raeume } from '@/types/app';
import { DataTable } from './DataTable';
import type { ColumnDef } from './DataTable';
import { EntityDialog } from './EntityDialog';
import type { FieldDef } from './EntityDialog';
import { DeleteConfirm } from './DeleteConfirm';
import { SectionHeader } from './SectionHeader';

export function KurseView() {
  const [kurse, setKurse] = useState<Kurse[]>([]);
  const [dozenten, setDozenten] = useState<Dozenten[]>([]);
  const [raeume, setRaeume] = useState<Raeume[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editItem, setEditItem] = useState<Kurse | null>(null);
  const [deleteItem, setDeleteItem] = useState<Kurse | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, d, r] = await Promise.all([
        LivingAppsService.getKurse(),
        LivingAppsService.getDozenten(),
        LivingAppsService.getRaeume(),
      ]);
      setKurse(k);
      setDozenten(d);
      setRaeume(r);
    } catch {
      toast.error('Fehler beim Laden der Kurse');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const dozentName = (url?: string) => {
    const id = extractRecordId(url);
    return dozenten.find(d => d.record_id === id)?.fields.name ?? '—';
  };
  const raumName = (url?: string) => {
    const id = extractRecordId(url);
    return raeume.find(r => r.record_id === id)?.fields.raumname ?? '—';
  };

  const fields: FieldDef[] = [
    { name: 'titel', label: 'Titel', type: 'text', required: true },
    { name: 'beschreibung', label: 'Beschreibung', type: 'textarea' },
    { name: 'startdatum', label: 'Startdatum', type: 'date' },
    { name: 'enddatum', label: 'Enddatum', type: 'date' },
    { name: 'max_teilnehmer', label: 'Max. Teilnehmer', type: 'number' },
    { name: 'preis', label: 'Preis (€)', type: 'number' },
    {
      name: 'dozent', label: 'Dozent', type: 'select',
      options: dozenten.map(d => ({
        value: createRecordUrl(APP_IDS.DOZENTEN, d.record_id),
        label: d.fields.name ?? d.record_id,
      })),
    },
    {
      name: 'raum', label: 'Raum', type: 'select',
      options: raeume.map(r => ({
        value: createRecordUrl(APP_IDS.RAEUME, r.record_id),
        label: r.fields.raumname ?? r.record_id,
      })),
    },
  ];

  const columns: ColumnDef<Kurse>[] = [
    { key: 'titel', header: 'Titel', render: item => <span className="font-semibold">{item.fields.titel}</span> },
    { key: 'startdatum', header: 'Start', render: item => item.fields.startdatum ?? '—' },
    { key: 'dozent', header: 'Dozent', render: item => dozentName(item.fields.dozent) },
    { key: 'raum', header: 'Raum', render: item => raumName(item.fields.raum) },
    {
      key: 'preis', header: 'Preis', render: item =>
        item.fields.preis != null ? `${item.fields.preis.toFixed(2)} €` : '—'
    },
    {
      key: 'max_teilnehmer', header: 'Max. TN', render: item =>
        item.fields.max_teilnehmer != null ? String(item.fields.max_teilnehmer) : '—'
    },
  ];

  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (editItem) {
        await LivingAppsService.updateKurseEntry(editItem.record_id, data as Kurse['fields']);
        toast.success('Kurs aktualisiert');
      } else {
        await LivingAppsService.createKurseEntry(data as Kurse['fields']);
        toast.success('Kurs erstellt');
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
      await LivingAppsService.deleteKurseEntry(deleteItem.record_id);
      toast.success('Kurs gelöscht');
      setDeleteOpen(false);
      setDeleteItem(null);
      await load();
    } catch {
      toast.error('Fehler beim Löschen');
    } finally {
      setSaving(false);
    }
  };

  const initialData = editItem ? {
    ...editItem.fields,
    dozent: editItem.fields.dozent ?? '',
    raum: editItem.fields.raum ?? '',
  } as Record<string, unknown> : undefined;

  return (
    <div>
      <SectionHeader
        title="Kurse"
        description="Alle Kurse verwalten"
        count={kurse.length}
        onAdd={() => { setEditItem(null); setDialogOpen(true); }}
        addLabel="Neuer Kurs"
        icon={<BookOpen className="h-5 w-5 text-primary-foreground" />}
      />
      <div className="card-elevated overflow-hidden">
        <DataTable
          data={kurse}
          columns={columns}
          loading={loading}
          onEdit={item => { setEditItem(item); setDialogOpen(true); }}
          onDelete={item => { setDeleteItem(item); setDeleteOpen(true); }}
          getId={item => item.record_id}
          emptyText="Noch keine Kurse vorhanden."
        />
      </div>
      <EntityDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditItem(null); }}
        onSave={handleSave}
        title={editItem ? 'Kurs bearbeiten' : 'Neuer Kurs'}
        fields={fields}
        initialData={initialData}
        loading={saving}
      />
      <DeleteConfirm
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteItem(null); }}
        onConfirm={handleDelete}
        label={deleteItem?.fields.titel ?? ''}
        loading={saving}
      />
    </div>
  );
}
