import { useState } from 'react';
import { BookOpen, GraduationCap, Users, Building2, ClipboardList, Menu, X } from 'lucide-react';
import { Toaster } from 'sonner';
import { KurseView } from '@/components/kurs/KurseView';
import { DozentView } from '@/components/kurs/DozentView';
import { TeilnehmerView } from '@/components/kurs/TeilnehmerView';
import { RaeumeView } from '@/components/kurs/RaeumeView';
import { AnmeldungenView } from '@/components/kurs/AnmeldungenView';

type Section = 'kurse' | 'dozenten' | 'teilnehmer' | 'raeume' | 'anmeldungen';

const navItems: { id: Section; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'kurse', label: 'Kurse', icon: <BookOpen className="h-4.5 w-4.5" />, desc: 'Kursverwaltung' },
  { id: 'dozenten', label: 'Dozenten', icon: <GraduationCap className="h-4.5 w-4.5" />, desc: 'Lehrende' },
  { id: 'teilnehmer', label: 'Teilnehmer', icon: <Users className="h-4.5 w-4.5" />, desc: 'Angemeldete' },
  { id: 'raeume', label: 'Räume', icon: <Building2 className="h-4.5 w-4.5" />, desc: 'Unterrichtsräume' },
  { id: 'anmeldungen', label: 'Anmeldungen', icon: <ClipboardList className="h-4.5 w-4.5" />, desc: 'Buchungen' },
];

function SectionView({ section }: { section: Section }) {
  switch (section) {
    case 'kurse': return <KurseView />;
    case 'dozenten': return <DozentView />;
    case 'teilnehmer': return <TeilnehmerView />;
    case 'raeume': return <RaeumeView />;
    case 'anmeldungen': return <AnmeldungenView />;
  }
}

export default function Dashboard() {
  const [section, setSection] = useState<Section>('kurse');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const current = navItems.find(n => n.id === section)!;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 flex flex-col
          bg-sidebar text-sidebar-foreground
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:flex
        `}
        style={{ boxShadow: '4px 0 24px -4px rgba(0,0,0,0.18)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl stat-hero flex-shrink-0">
            <BookOpen className="h-5 w-5" style={{ color: 'oklch(0.98 0 0)' }} />
          </div>
          <div>
            <div className="font-bold text-sm" style={{ color: 'oklch(0.95 0.01 270)' }}>
              KursManager
            </div>
            <div className="text-xs" style={{ color: 'oklch(0.6 0.04 270)' }}>
              Kursverwaltung
            </div>
          </div>
          <button
            className="ml-auto lg:hidden p-1 rounded-md hover:bg-sidebar-accent"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'oklch(0.5 0.04 270)' }}>
            Verwaltung
          </p>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setSection(item.id); setSidebarOpen(false); }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150 text-left
                ${section === item.id ? 'nav-item-active' : 'nav-item'}
              `}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
              {section === item.id && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-sidebar-border">
          <div className="text-xs" style={{ color: 'oklch(0.45 0.04 270)' }}>
            Alle Daten werden sicher gespeichert
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 sm:px-6 py-4 bg-surface border-b border-border sticky top-0 z-20"
          style={{ boxShadow: 'var(--shadow-card)' }}>
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{current.icon}</span>
            <h1 className="text-base sm:text-lg font-bold">{current.label}</h1>
          </div>
          <span className="hidden sm:block text-sm text-muted-foreground">— {current.desc}</span>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 py-6 overflow-auto">
          <SectionView section={section} />
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
