import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { ClipboardList } from 'lucide-react';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { APP_IDS } from '@/types/app';
import type { Anmeldungen, Teilnehmer, Kurse } from '@/types/app';
import { DataTable } from './DataTable';
import type { ColumnDef } from './DataTable';
import { EntityDialog } from './EntityDialog';
import type { FieldDef } from './EntityDialog';
import { DeleteConfirm } from './DeleteConfirm';
import { SectionHeader } from './SectionHeader';

export function AnmeldungenView() {
  const [anmeldungen, setAnmeldungen] = useState<Anmeldungen[]>([]);
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [kurse, setKurse] = useState<Kurse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editItem, setEditItem] = useState<Anmeldungen | null>(null);
  const [deleteItem, setDeleteItem] = useState<Anmeldungen | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, t, k] = await Promise.all([
        LivingAppsService.getAnmeldungen(),
        LivingAppsService.getTeilnehmer(),
        LivingAppsService.getKurse(),
      ]);
      setAnmeldungen(a);
      setTeilnehmer(t);
      setKurse(k);
    } catch {
      toast.error('Fehler beim Laden der Anmeldungen');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const tnName = (url?: string) => {
    const id = extractRecordId(url);
    return teilnehmer.find(t => t.record_id === id)?.fields.name ?? '—';
  };
  const kursTitle = (url?: string) => {
    const id = extractRecordId(url);
    return kurse.find(k => k.record_id === id)?.fields.titel ?? '—';
  };

  const today = new Date().toISOString().slice(0, 10);

  const fields: FieldDef[] = [
    {
      name: 'teilnehmer', label: 'Teilnehmer', type: 'select', required: true,
      options: teilnehmer.map(t => ({
        value: createRecordUrl(APP_IDS.TEILNEHMER, t.record_id),
        label: t.fields.name ?? t.record_id,
      })),
    },
    {
      name: 'kurs', label: 'Kurs', type: 'select', required: true,
      options: kurse.map(k => ({
        value: createRecordUrl(APP_IDS.KURSE, k.record_id),
        label: k.fields.titel ?? k.record_id,
      })),
    },
    { name: 'anmeldedatum', label: 'Anmeldedatum', type: 'date' },
    { name: 'bezahlt', label: 'Bezahlt', type: 'boolean' },
  ];

  const columns: ColumnDef<Anmeldungen>[] = [
    { key: 'teilnehmer', header: 'Teilnehmer', render: item => <span className="font-semibold">{tnName(item.fields.teilnehmer)}</span> },
    { key: 'kurs', header: 'Kurs', render: item => kursTitle(item.fields.kurs) },
    { key: 'anmeldedatum', header: 'Anmeldedatum', render: item => item.fields.anmeldedatum ?? '—' },
    {
      key: 'bezahlt', header: 'Bezahlt', render: item => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${item.fields.bezahlt ? 'badge-status-paid' : 'badge-status-unpaid'}`}>
          {item.fields.bezahlt ? 'Ja' : 'Nein'}
        </span>
      )
    },
  ];

  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (editItem) {
        await LivingAppsService.updateAnmeldungenEntry(editItem.record_id, data as Anmeldungen['fields']);
        toast.success('Anmeldung aktualisiert');
      } else {
        if (!data.anmeldedatum) data.anmeldedatum = today;
        await LivingAppsService.createAnmeldungenEntry(data as Anmeldungen['fields']);
        toast.success('Anmeldung erstellt');
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
      await LivingAppsService.deleteAnmeldungenEntry(deleteItem.record_id);
      toast.success('Anmeldung gelöscht');
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
    teilnehmer: editItem.fields.teilnehmer ?? '',
    kurs: editItem.fields.kurs ?? '',
    anmeldedatum: editItem.fields.anmeldedatum ?? '',
    bezahlt: editItem.fields.bezahlt ?? false,
  } as Record<string, unknown> : undefined;

  const paidCount = anmeldungen.filter(a => a.fields.bezahlt).length;
  const unpaidCount = anmeldungen.filter(a => !a.fields.bezahlt).length;

  return (
    <div>
      <SectionHeader
        title="Anmeldungen"
        description="Kursbuchungen verwalten"
        count={anmeldungen.length}
        onAdd={() => { setEditItem(null); setDialogOpen(true); }}
        addLabel="Neue Anmeldung"
        icon={<ClipboardList className="h-5 w-5 text-primary-foreground" />}
      />
      {anmeldungen.length > 0 && (
        <div className="flex gap-3 mb-4">
          <div className="badge-status-paid px-3 py-1.5 rounded-lg text-sm font-medium">
            {paidCount} bezahlt
          </div>
          <div className="badge-status-unpaid px-3 py-1.5 rounded-lg text-sm font-medium">
            {unpaidCount} ausstehend
          </div>
        </div>
      )}
      <div className="card-elevated overflow-hidden">
        <DataTable
          data={anmeldungen}
          columns={columns}
          loading={loading}
          onEdit={item => { setEditItem(item); setDialogOpen(true); }}
          onDelete={item => { setDeleteItem(item); setDeleteOpen(true); }}
          getId={item => item.record_id}
          emptyText="Noch keine Anmeldungen vorhanden."
        />
      </div>
      <EntityDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditItem(null); }}
        onSave={handleSave}
        title={editItem ? 'Anmeldung bearbeiten' : 'Neue Anmeldung'}
        fields={fields}
        initialData={initialData}
        loading={saving}
      />
      <DeleteConfirm
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteItem(null); }}
        onConfirm={handleDelete}
        label={`Anmeldung von ${tnName(deleteItem?.fields.teilnehmer)}`}
        loading={saving}
      />
    </div>
  );
}
