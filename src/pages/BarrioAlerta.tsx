/**
 * BarrioAlerta.tsx — Módulo de administración completo
 * Para: batallagroup-dashboard
 *
 * INSTALACIÓN:
 *   cd C:\Proyectos\personal\batallagroup-dashboard
 *   copy BarrioAlerta.tsx src\pages\BarrioAlerta.tsx
 *
 * El archivo src\supabase.ts ya existe, solo asegúrate de que
 * VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén en .env
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Category =
  | 'Crime' | 'Accident' | 'Missing' | 'Notice' | 'Sanitary'
  | 'Environment' | 'Fire' | 'Infrastructure' | 'Utility' | 'Health'
  | 'Other' | 'SOS';

type NoticeCategory = 'Corte de luz' | 'Obras' | 'Evento' | 'Agua' | 'Transporte' | 'General';

interface Incident {
  id: string;
  user_id: string | null;
  user_name: string | null;
  category: Category;
  title: string;
  description: string;
  lat: number;
  lng: number;
  created_at: string;
  verified_count: number;
  report_count: number;
  is_sensitive: boolean;
  is_sos: boolean;
  image_url: string | null;
}

interface Notice {
  id: string;
  user_id: string;
  user_name: string;
  title: string;
  body: string;
  category: NoticeCategory;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

interface User {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  reputation: any;
  verification: any;
  last_seen: string | null;
  created_at: string;
}

interface Stats {
  totalIncidents: number;
  totalUsers: number;
  totalReports: number;
  sosCount: number;
  incidentsToday: number;
  sensitiveCount: number;
}

type Tab = 'overview' | 'incidents' | 'notices' | 'users' | 'create';
type CreateType = 'incident' | 'notice';

// ─── Constantes ───────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<Category, string> = {
  Crime: '👮 Crimen', Accident: '🚑 Siniestro', Missing: '🔍 Búsqueda',
  Notice: '🚧 Aviso', Sanitary: '🏥 Sanidad', Environment: '🌿 Ambiental',
  Fire: '🔥 Incendio', Infrastructure: '🔨 Infraestructura',
  Utility: '⚡ Servicios', Health: '🩺 Salud', Other: '❓ Otro', SOS: '🚨 SOS',
};

const CATEGORY_COLORS: Record<Category, string> = {
  Crime: '#ef4444', Accident: '#f59e0b', Missing: '#3b82f6',
  Notice: '#94a3b8', Sanitary: '#10b981', Environment: '#22c55e',
  Fire: '#ea580c', Infrastructure: '#eab308', Utility: '#22d3ee',
  Health: '#fb7185', Other: '#64748b', SOS: '#ef4444',
};

const NOTICE_CATEGORIES: NoticeCategory[] = [
  'Corte de luz', 'Obras', 'Evento', 'Agua', 'Transporte', 'General',
];

const INCIDENT_CATEGORIES: Category[] = [
  'Crime', 'Accident', 'Missing', 'Notice', 'Sanitary', 'Environment',
  'Fire', 'Infrastructure', 'Utility', 'Health', 'Other', 'SOS',
];

// ─── Estilos base ─────────────────────────────────────────────────────────────

const S = {
  page: {
    minHeight: '100vh', width: '100%',
    background: '#080810',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    color: '#c8c8e8',
  } as React.CSSProperties,
  header: {
    background: '#0a0a16',
    borderBottom: '1px solid #12122a',
    padding: '14px 28px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    position: 'sticky' as const, top: 0, zIndex: 100,
  },
  card: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: '20px 22px',
  } as React.CSSProperties,
  btn: (color = '#3b82f6') => ({
    background: `${color}18`,
    border: `1px solid ${color}40`,
    borderRadius: 8, color,
    padding: '8px 18px', cursor: 'pointer',
    fontSize: 12, fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
    transition: 'all 0.15s',
  } as React.CSSProperties),
  btnDanger: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 8, color: '#ef4444',
    padding: '6px 14px', cursor: 'pointer',
    fontSize: 11, fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
  } as React.CSSProperties,
  input: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, color: '#c8c8e8',
    padding: '10px 14px', width: '100%',
    fontSize: 13,
    fontFamily: "'JetBrains Mono', monospace",
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  label: {
    color: '#4a4a6a', fontSize: 11, letterSpacing: '0.2em',
    display: 'block', marginBottom: 6,
  } as React.CSSProperties,
  tag: (color: string) => ({
    background: `${color}20`,
    border: `1px solid ${color}50`,
    borderRadius: 6, color,
    padding: '2px 8px', fontSize: 10, fontWeight: 700,
    display: 'inline-block',
  } as React.CSSProperties),
  row: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 16px',
    background: 'rgba(0,0,0,0.25)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: 10, marginBottom: 8,
  } as React.CSSProperties,
  section: { color: '#2a2a48', fontSize: 10, letterSpacing: '0.35em', margin: '0 0 14px' } as React.CSSProperties,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtDateShort(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
}

// ─── PowerShell helpers ───────────────────────────────────────────────────────

function PSBox({ cmd, label }: { cmd: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div style={{ margin: '8px 0' }}>
      {label && <p style={S.label}>{label}</p>}
      <div style={{
        background: '#050508', border: '1px solid #1a1a30',
        borderRadius: 8, padding: '10px 14px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
      }}>
        <code style={{ color: '#60a5fa', fontSize: 12, flex: 1, wordBreak: 'break-all' as const }}>{cmd}</code>
        <button onClick={copy} style={{
          ...S.btn('#60a5fa'), padding: '4px 10px', flexShrink: 0,
        }}>
          {copied ? '✓ OK' : 'Copiar'}
        </button>
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview',   label: 'Resumen',    icon: '◉' },
  { id: 'incidents',  label: 'Incidentes', icon: '⚠' },
  { id: 'notices',    label: 'Avisos',     icon: '📢' },
  { id: 'users',      label: 'Usuarios',   icon: '👤' },
  { id: 'create',     label: 'Crear',      icon: '+' },
];

// ─── Overview ─────────────────────────────────────────────────────────────────

function Overview({ stats, incidents, loading }: { stats: Stats; incidents: Incident[]; loading: boolean }) {
  const KPIs = [
    { label: 'Total incidentes', value: stats.totalIncidents, color: '#3b82f6', icon: '⚠' },
    { label: 'Usuarios registrados', value: stats.totalUsers, color: '#22c55e', icon: '👤' },
    { label: 'Reportes pendientes', value: stats.totalReports, color: '#f59e0b', icon: '🚩' },
    { label: 'SOS activos (15d)', value: stats.sosCount, color: '#ef4444', icon: '🚨' },
    { label: 'Hoy', value: stats.incidentsToday, color: '#8b5cf6', icon: '📅' },
    { label: 'Sensibles ocultos', value: stats.sensitiveCount, color: '#94a3b8', icon: '🔒' },
  ];

  const byCat: Record<string, number> = {};
  incidents.forEach(i => { byCat[i.category] = (byCat[i.category] ?? 0) + 1; });
  const catEntries = Object.entries(byCat).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <p style={S.section}>━━ KPIs BARRIO ALERTA</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {KPIs.map(k => (
          <div key={k.label} style={{ ...S.card, borderLeft: `3px solid ${k.color}` }}>
            <p style={{ color: '#2a2a48', fontSize: 10, letterSpacing: '0.2em', margin: '0 0 6px' }}>
              {k.icon} {k.label.toUpperCase()}
            </p>
            <p style={{ color: '#fff', fontSize: 30, fontWeight: 900, margin: 0, lineHeight: 1 }}>
              {loading ? '…' : k.value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={S.card}>
          <p style={S.section}>━━ DISTRIBUCIÓN POR CATEGORÍA</p>
          {loading
            ? <p style={{ color: '#3a3a58', fontSize: 12 }}>Cargando…</p>
            : catEntries.length === 0
              ? <p style={{ color: '#3a3a58', fontSize: 12 }}>Sin datos</p>
              : catEntries.map(([cat, count]) => {
                const pct = Math.round((count / stats.totalIncidents) * 100);
                const color = CATEGORY_COLORS[cat as Category] ?? '#64748b';
                return (
                  <div key={cat} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#8080a8', fontSize: 11 }}>
                        {CATEGORY_LABELS[cat as Category] ?? cat}
                      </span>
                      <span style={{ color: color, fontSize: 11, fontWeight: 700 }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.6s' }} />
                    </div>
                  </div>
                );
              })}
        </div>

        <div style={S.card}>
          <p style={S.section}>━━ ÚLTIMOS INCIDENTES</p>
          {loading
            ? <p style={{ color: '#3a3a58', fontSize: 12 }}>Cargando…</p>
            : incidents.slice(0, 6).map(i => (
              <div key={i.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>
                  {CATEGORY_LABELS[i.category]?.split(' ')[0] ?? '?'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#a0a0c8', fontSize: 12, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {i.title}
                  </p>
                  <p style={{ color: '#2a2a48', fontSize: 10, margin: 0 }}>{fmtDateShort(i.created_at)} · {i.user_name ?? 'Anónimo'}</p>
                </div>
                {i.is_sos && <span style={S.tag('#ef4444')}>SOS</span>}
                {i.is_sensitive && <span style={S.tag('#94a3b8')}>🔒</span>}
              </div>
            ))}
        </div>
      </div>

      <div style={{ ...S.card, marginTop: 14 }}>
        <p style={S.section}>━━ COMANDOS GIT / POWERSHELL (BarrioAlerta)</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <PSBox label="Ver estado" cmd="cd C:\Proyectos\personal\barrioalerta; git status" />
          <PSBox label="Pull últimos cambios" cmd="cd C:\Proyectos\personal\barrioalerta; git pull origin main" />
          <PSBox label="Build + sync Android" cmd="cd C:\Proyectos\personal\barrioalerta; npm run cap:sync" />
          <PSBox label="Abrir en dev" cmd="cd C:\Proyectos\personal\barrioalerta; npm run dev" />
          <PSBox label="Push cambios" cmd="cd C:\Proyectos\personal\barrioalerta; git add . ; git commit -m 'update' ; git push origin main" />
          <PSBox label="Dashboard – dev" cmd="cd C:\Proyectos\personal\batallagroup-dashboard; npm run dev" />
          <PSBox label="Dashboard – build" cmd="cd C:\Proyectos\personal\batallagroup-dashboard; npm run build" />
          <PSBox label="Dashboard – deploy (Vercel)" cmd="cd C:\Proyectos\personal\batallagroup-dashboard; npx vercel --prod" />
        </div>
      </div>
    </div>
  );
}

// ─── Incidents ────────────────────────────────────────────────────────────────

function Incidents({ incidents, loading, onRefresh }: {
  incidents: Incident[]; loading: boolean; onRefresh: () => void;
}) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterSOS, setFilterSOS] = useState(false);
  const [filterSensitive, setFilterSensitive] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const filtered = incidents.filter(i => {
    if (search && !i.title.toLowerCase().includes(search.toLowerCase()) &&
        !(i.user_name ?? '').toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat !== 'all' && i.category !== filterCat) return false;
    if (filterSOS && !i.is_sos) return false;
    if (filterSensitive && !i.is_sensitive) return false;
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este incidente? Esta acción no se puede deshacer.')) return;
    setDeleting(id);
    await supabase.from('incidents').delete().eq('id', id);
    setDeleting(null);
    onRefresh();
  };

  const handleToggleSensitive = async (i: Incident) => {
    setToggling(i.id);
    await supabase.from('incidents').update({ is_sensitive: !i.is_sensitive }).eq('id', i.id);
    setToggling(null);
    onRefresh();
  };

  const handleToggleSOS = async (i: Incident) => {
    setToggling(i.id);
    await supabase.from('incidents').update({ is_sos: !i.is_sos }).eq('id', i.id);
    setToggling(null);
    onRefresh();
  };

  const handleResetReports = async (id: string) => {
    await supabase.from('incidents').update({ report_count: 0 }).eq('id', id);
    onRefresh();
  };

  return (
    <div>
      {/* Filtros */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' as const, alignItems: 'center' }}>
        <input
          style={{ ...S.input, width: 220 }}
          placeholder="Buscar título o usuario…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          style={{ ...S.input, width: 180 }}
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
        >
          <option value="all">Todas las categorías</option>
          {INCIDENT_CATEGORIES.map(c => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
        <button
          onClick={() => setFilterSOS(v => !v)}
          style={{ ...S.btn('#ef4444'), opacity: filterSOS ? 1 : 0.4 }}
        >🚨 Solo SOS</button>
        <button
          onClick={() => setFilterSensitive(v => !v)}
          style={{ ...S.btn('#94a3b8'), opacity: filterSensitive ? 1 : 0.4 }}
        >🔒 Sensibles</button>
        <button onClick={onRefresh} style={S.btn('#22c55e')}>↻ Actualizar</button>
        <span style={{ color: '#3a3a58', fontSize: 11, marginLeft: 'auto' }}>
          {filtered.length} de {incidents.length} incidentes
        </span>
      </div>

      {loading
        ? <p style={{ color: '#3a3a58', padding: '40px 0', textAlign: 'center' }}>Cargando incidentes…</p>
        : filtered.length === 0
          ? <p style={{ color: '#3a3a58', padding: '40px 0', textAlign: 'center' }}>Sin resultados</p>
          : filtered.map(i => {
            const color = CATEGORY_COLORS[i.category] ?? '#64748b';
            const isBusy = deleting === i.id || toggling === i.id;
            return (
              <div key={i.id} style={{
                ...S.row,
                borderLeft: `3px solid ${color}`,
                opacity: isBusy ? 0.5 : 1,
                transition: 'opacity 0.2s',
                flexWrap: 'wrap' as const,
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 2, flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' as const }}>
                    <span style={S.tag(color)}>{CATEGORY_LABELS[i.category]}</span>
                    {i.is_sos && <span style={S.tag('#ef4444')}>SOS</span>}
                    {i.is_sensitive && <span style={S.tag('#94a3b8')}>🔒 Oculto</span>}
                    {i.report_count > 0 && <span style={S.tag('#f59e0b')}>🚩 {i.report_count} reportes</span>}
                  </div>
                  <p style={{ color: '#c0c0e0', fontSize: 13, fontWeight: 700, margin: '4px 0 2px' }}>{i.title}</p>
                  <p style={{ color: '#4a4a6a', fontSize: 11, margin: 0 }}>
                    {i.user_name ?? 'Anónimo'} · {fmtDate(i.created_at)} · ✓{i.verified_count}
                  </p>
                  <p style={{ color: '#3a3a58', fontSize: 11, margin: '2px 0 0' }}>
                    📍 {i.lat?.toFixed(4)}, {i.lng?.toFixed(4)}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, flexShrink: 0 }}>
                  <button
                    onClick={() => handleToggleSensitive(i)}
                    disabled={isBusy}
                    style={S.btn(i.is_sensitive ? '#22c55e' : '#94a3b8')}
                    title={i.is_sensitive ? 'Hacer público' : 'Ocultar (sensible)'}
                  >{i.is_sensitive ? '👁 Mostrar' : '🔒 Ocultar'}</button>
                  <button
                    onClick={() => handleToggleSOS(i)}
                    disabled={isBusy}
                    style={S.btn(i.is_sos ? '#f59e0b' : '#ef4444')}
                  >{i.is_sos ? 'Quitar SOS' : '🚨 SOS'}</button>
                  {i.report_count > 0 && (
                    <button
                      onClick={() => handleResetReports(i.id)}
                      disabled={isBusy}
                      style={S.btn('#f59e0b')}
                    >Limpiar reportes</button>
                  )}
                  <button
                    onClick={() => handleDelete(i.id)}
                    disabled={isBusy}
                    style={S.btnDanger}
                  >{deleting === i.id ? 'Borrando…' : '🗑 Eliminar'}</button>
                </div>
              </div>
            );
          })}
    </div>
  );
}

// ─── Notices ──────────────────────────────────────────────────────────────────

const NOTICE_COLORS: Record<NoticeCategory, string> = {
  'Corte de luz': '#eab308', Obras: '#f97316', Evento: '#a855f7',
  Agua: '#3b82f6', Transporte: '#22c55e', General: '#94a3b8',
};

function Notices(_props: { loading?: boolean; onRefresh: () => void }) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [notLoading, setNotLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setNotLoading(true);
    const { data } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setNotices(data ?? []);
    setNotLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este aviso?')) return;
    setDeleting(id);
    await supabase.from('notices').delete().eq('id', id);
    setDeleting(null);
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ ...S.section, margin: 0 }}>━━ AVISOS COMUNITARIOS</p>
        <button onClick={load} style={S.btn('#22c55e')}>↻ Actualizar</button>
      </div>
      {notLoading
        ? <p style={{ color: '#3a3a58', padding: '40px 0', textAlign: 'center' }}>Cargando…</p>
        : notices.length === 0
          ? <p style={{ color: '#3a3a58', padding: '40px 0', textAlign: 'center' }}>Sin avisos</p>
          : notices.map(n => {
            const color = NOTICE_COLORS[n.category] ?? '#94a3b8';
            return (
              <div key={n.id} style={{ ...S.row, borderLeft: `3px solid ${color}`, flexWrap: 'wrap' as const }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' as const }}>
                    <span style={S.tag(color)}>{n.category}</span>
                  </div>
                  <p style={{ color: '#c0c0e0', fontSize: 13, fontWeight: 700, margin: '0 0 2px' }}>{n.title}</p>
                  <p style={{ color: '#6060a0', fontSize: 12, margin: '0 0 2px' }}>{n.body}</p>
                  <p style={{ color: '#3a3a58', fontSize: 11, margin: 0 }}>
                    {n.user_name} · {fmtDate(n.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(n.id)}
                  disabled={deleting === n.id}
                  style={S.btnDanger}
                >{deleting === n.id ? 'Borrando…' : '🗑 Eliminar'}</button>
              </div>
            );
          })}
    </div>
  );
}

// ─── Users ────────────────────────────────────────────────────────────────────

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    setUsers(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u =>
    !search ||
    (u.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar usuario? Esto NO elimina su cuenta de Auth.')) return;
    await supabase.from('users').delete().eq('id', id);
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <input
          style={{ ...S.input, width: 260 }}
          placeholder="Buscar email o nombre…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button onClick={load} style={S.btn('#22c55e')}>↻ Actualizar</button>
        <span style={{ color: '#3a3a58', fontSize: 11, marginLeft: 'auto' }}>
          {filtered.length} usuarios
        </span>
      </div>

      {loading
        ? <p style={{ color: '#3a3a58', padding: '40px 0', textAlign: 'center' }}>Cargando…</p>
        : filtered.map(u => {
          const lvl = u.reputation?.level ?? '—';
          const pts = u.reputation?.points ?? '—';
          return (
            <div key={u.id} style={{ ...S.row, flexWrap: 'wrap' as const }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, flexShrink: 0,
              }}>
                {u.avatar_url
                  ? <img src={u.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} />
                  : (u.full_name?.[0] ?? u.email?.[0] ?? '?').toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <p style={{ color: '#c0c0e0', fontSize: 13, fontWeight: 700, margin: '0 0 2px' }}>
                  {u.full_name ?? 'Sin nombre'}
                </p>
                <p style={{ color: '#4a4a6a', fontSize: 11, margin: '0 0 2px' }}>{u.email ?? 'Sin email'}</p>
                <p style={{ color: '#2a2a48', fontSize: 10, margin: 0 }}>
                  Desde {fmtDateShort(u.created_at)} · Último: {u.last_seen ? fmtDateShort(u.last_seen) : '—'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' as const, flexShrink: 0 }}>
                <span style={S.tag('#8b5cf6')}>Nv. {lvl}</span>
                <span style={S.tag('#3b82f6')}>{pts} pts</span>
                <span style={{ ...S.tag('#2a2a48'), fontSize: 9 }}>{u.id.slice(0, 8)}…</span>
                <button onClick={() => handleDelete(u.id)} style={S.btnDanger}>🗑</button>
              </div>
            </div>
          );
        })}
    </div>
  );
}

// ─── Create ───────────────────────────────────────────────────────────────────

function Create() {
  const [type, setType] = useState<CreateType>('incident');
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState('');

  // Incident form
  const [iTitle, setITitle] = useState('');
  const [iDesc, setIDesc] = useState('');
  const [iCat, setICat] = useState<Category>('Notice');
  const [iLat, setILat] = useState('');
  const [iLng, setILng] = useState('');
  const [iSOS, setISOS] = useState(false);
  const [iSensitive, setISensitive] = useState(false);

  // Notice form
  const [nTitle, setNTitle] = useState('');
  const [nBody, setNBody] = useState('');
  const [nCat, setNCat] = useState<NoticeCategory>('General');
  const [nLat, setNLat] = useState('');
  const [nLng, setNLng] = useState('');

  const reset = () => {
    setITitle(''); setIDesc(''); setICat('Notice');
    setILat(''); setILng(''); setISOS(false); setISensitive(false);
    setNTitle(''); setNBody(''); setNCat('General'); setNLat(''); setNLng('');
    setErr(''); setOk(false);
  };

  const handleSave = async () => {
    setSaving(true); setErr(''); setOk(false);
    try {
      if (type === 'incident') {
        if (!iTitle.trim() || !iDesc.trim()) throw new Error('Título y descripción son requeridos');
        const lat = parseFloat(iLat) || 0;
        const lng = parseFloat(iLng) || 0;
        const { error } = await supabase.from('incidents').insert({
          user_id: null,
          user_name: 'Administrador',
          user_photo: null,
          category: iCat,
          title: iTitle.trim(),
          description: iDesc.trim(),
          lat, lng,
          image_url: null,
          image_urls: [],
          is_sensitive: iSensitive,
          is_sos: iSOS,
          broadcast_radius_km: 5,
          verified_count: 0,
          report_count: 0,
          verified_by: [],
        });
        if (error) throw error;
      } else {
        if (!nTitle.trim() || !nBody.trim()) throw new Error('Título y cuerpo son requeridos');
        const lat = nLat ? parseFloat(nLat) : null;
        const lng = nLng ? parseFloat(nLng) : null;
        const { error } = await supabase.from('notices').insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          user_name: 'Administrador',
          user_photo: null,
          title: nTitle.trim(),
          body: nBody.trim(),
          category: nCat,
          lat, lng,
        });
        if (error) throw error;
      }
      setOk(true);
      reset();
    } catch (e: any) {
      setErr(e.message ?? 'Error desconocido');
    }
    setSaving(false);
  };

  const inputStyle = { ...S.input, marginBottom: 14 };
  const labelStyle = { ...S.label, marginBottom: 4, marginTop: 4 };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
      {/* Selector de tipo */}
      <div>
        <p style={S.section}>━━ TIPO</p>
        {(['incident', 'notice'] as CreateType[]).map(t => (
          <button
            key={t}
            onClick={() => { setType(t); reset(); }}
            style={{
              ...S.btn(type === t ? '#3b82f6' : '#2a2a48'),
              width: '100%', marginBottom: 8, textAlign: 'left' as const,
              opacity: type === t ? 1 : 0.5,
            }}
          >
            {t === 'incident' ? '⚠ Incidente' : '📢 Aviso comunitario'}
          </button>
        ))}

        <div style={{ marginTop: 20, ...S.card }}>
          <p style={S.section}>━━ COMANDOS ÚTILES</p>
          <PSBox label="Abrir Supabase Studio" cmd="Start-Process 'https://supabase.com/dashboard/project/kndhnywjtfyhivuxnhag'" />
          <PSBox label="Ver tablas" cmd="cd C:\Proyectos\personal\barrioalerta; cat .env" />
        </div>
      </div>

      {/* Formulario */}
      <div style={S.card}>
        <p style={S.section}>━━ {type === 'incident' ? 'NUEVO INCIDENTE' : 'NUEVO AVISO'}</p>

        {type === 'incident' ? (
          <>
            <label style={labelStyle}>CATEGORÍA</label>
            <select style={{ ...inputStyle }} value={iCat} onChange={e => setICat(e.target.value as Category)}>
              {INCIDENT_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>

            <label style={labelStyle}>TÍTULO *</label>
            <input style={inputStyle} value={iTitle} onChange={e => setITitle(e.target.value)} placeholder="Ej: Robo a mano armada" />

            <label style={labelStyle}>DESCRIPCIÓN *</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical' as const }}
              value={iDesc}
              onChange={e => setIDesc(e.target.value)}
              placeholder="Describe el incidente con detalle…"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>LATITUD</label>
                <input style={inputStyle} value={iLat} onChange={e => setILat(e.target.value)} placeholder="19.8979" />
              </div>
              <div>
                <label style={labelStyle}>LONGITUD</label>
                <input style={inputStyle} value={iLng} onChange={e => setILng(e.target.value)} placeholder="-98.1235" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#8080a8', fontSize: 12 }}>
                <input type="checkbox" checked={iSOS} onChange={e => setISOS(e.target.checked)} />
                🚨 Marcar como SOS
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#8080a8', fontSize: 12 }}>
                <input type="checkbox" checked={iSensitive} onChange={e => setISensitive(e.target.checked)} />
                🔒 Contenido sensible (oculto)
              </label>
            </div>
          </>
        ) : (
          <>
            <label style={labelStyle}>CATEGORÍA</label>
            <select style={{ ...inputStyle }} value={nCat} onChange={e => setNCat(e.target.value as NoticeCategory)}>
              {NOTICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <label style={labelStyle}>TÍTULO *</label>
            <input style={inputStyle} value={nTitle} onChange={e => setNTitle(e.target.value)} placeholder="Ej: Corte de agua Colonia Centro" />

            <label style={labelStyle}>CUERPO *</label>
            <textarea
              style={{ ...inputStyle, minHeight: 100, resize: 'vertical' as const }}
              value={nBody}
              onChange={e => setNBody(e.target.value)}
              placeholder="Detalla el aviso para la comunidad…"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>LATITUD (opcional)</label>
                <input style={inputStyle} value={nLat} onChange={e => setNLat(e.target.value)} placeholder="19.8979" />
              </div>
              <div>
                <label style={labelStyle}>LONGITUD (opcional)</label>
                <input style={inputStyle} value={nLng} onChange={e => setNLng(e.target.value)} placeholder="-98.1235" />
              </div>
            </div>
          </>
        )}

        {err && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
            <p style={{ color: '#ef4444', fontSize: 12, margin: 0 }}>⚠ {err}</p>
          </div>
        )}

        {ok && (
          <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
            <p style={{ color: '#22c55e', fontSize: 12, margin: 0 }}>✓ Publicado correctamente en Supabase. Se verá en la app al instante.</p>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{ ...S.btn('#3b82f6'), fontSize: 13, padding: '12px 28px', opacity: saving ? 0.6 : 1 }}
        >
          {saving ? 'Guardando…' : '✓ Publicar en BarrioAlerta'}
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props { onBack: () => void; }

export default function BarrioAlerta({ onBack }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalIncidents: 0, totalUsers: 0, totalReports: 0,
    sosCount: 0, incidentsToday: 0, sensitiveCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadIncidents = useCallback(async () => {
    setLoading(true);
    const cutoff = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('incidents')
      .select('*')
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false })
      .limit(500);
    const rows = (data ?? []) as Incident[];
    setIncidents(rows);

    // Stats
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [usersRes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
    ]);

    setStats({
      totalIncidents: rows.length,
      totalUsers: usersRes.count ?? 0,
      totalReports: rows.reduce((a, r) => a + (r.report_count ?? 0), 0),
      sosCount: rows.filter(r => r.is_sos).length,
      incidentsToday: rows.filter(r => new Date(r.created_at) >= today).length,
      sensitiveCount: rows.filter(r => r.is_sensitive).length,
    });
    setLoading(false);
  }, []);

  useEffect(() => { loadIncidents(); }, [loadIncidents]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('admin-incidents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, loadIncidents)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadIncidents]);

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={onBack} style={{ ...S.btn('#4a4a6a'), padding: '6px 14px' }}>← Volver</button>
          <div>
            <h1 style={{ color: '#e0e0ff', fontSize: 17, fontWeight: 900, margin: 0, letterSpacing: 1 }}>
              🚨 BarrioAlerta — Admin
            </h1>
            <p style={{ color: '#2a2a48', fontSize: 10, margin: '2px 0 0', letterSpacing: '0.2em' }}>
              PANEL DE ADMINISTRACIÓN · SUPABASE LIVE
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
          <span style={{ color: '#22c55e', fontSize: 10, letterSpacing: '0.2em' }}>REALTIME CONECTADO</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '12px 28px', borderBottom: '1px solid #0f0f20', background: '#08080f' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              ...S.btn(tab === t.id ? '#3b82f6' : '#2a2a48'),
              opacity: tab === t.id ? 1 : 0.5,
              padding: '8px 18px',
            }}
          >{t.icon} {t.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '28px', maxWidth: 1300, margin: '0 auto' }}>
        {tab === 'overview'  && <Overview stats={stats} incidents={incidents} loading={loading} />}
        {tab === 'incidents' && <Incidents incidents={incidents} loading={loading} onRefresh={loadIncidents} />}
        {tab === 'notices'   && <Notices loading={loading} onRefresh={loadIncidents} />}
        {tab === 'users'     && <Users />}
        {tab === 'create'    && <Create />}
      </div>
    </div>
  );
}
