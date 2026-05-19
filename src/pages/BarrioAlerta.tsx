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

type Tab = 'overview' | 'incidents' | 'notices' | 'users' | 'phones';

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


const INCIDENT_CATEGORIES: Category[] = [
  'Crime', 'Accident', 'Missing', 'Notice', 'Sanitary', 'Environment',
  'Fire', 'Infrastructure', 'Utility', 'Health', 'Other', 'SOS',
];

// ─── Estilos base ─────────────────────────────────────────────────────────────

const S = {
  page: {
    minHeight: '100vh', width: '100%',
    background: '#080810',
    fontFamily: "'Inter', system-ui, sans-serif",
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
    fontFamily: "'Inter', system-ui, sans-serif",
    transition: 'all 0.15s',
  } as React.CSSProperties),
  btnDanger: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 8, color: '#ef4444',
    padding: '6px 14px', cursor: 'pointer',
    fontSize: 11, fontWeight: 700,
    fontFamily: "'Inter', system-ui, sans-serif",
  } as React.CSSProperties,
  input: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, color: '#c8c8e8',
    padding: '10px 14px', width: '100%',
    fontSize: 13,
    fontFamily: "'Inter', system-ui, sans-serif",
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
  section: { color: '#6060a0', fontSize: 10, letterSpacing: '0.35em', margin: '0 0 14px' } as React.CSSProperties,
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
  { id: 'phones',     label: 'Teléfonos',  icon: '📞' },
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
            <p style={{ color: '#6060a0', fontSize: 10, letterSpacing: '0.2em', margin: '0 0 6px' }}>
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
                  <p style={{ color: '#6060a0', fontSize: 10, margin: 0 }}>{fmtDateShort(i.created_at)} · {i.user_name ?? 'Anónimo'}</p>
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
                <p style={{ color: '#6060a0', fontSize: 10, margin: 0 }}>
                  Desde {fmtDateShort(u.created_at)} · Último: {u.last_seen ? fmtDateShort(u.last_seen) : '—'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' as const, flexShrink: 0 }}>
                <span style={S.tag('#8b5cf6')}>Nv. {lvl}</span>
                <span style={S.tag('#3b82f6')}>{pts} pts</span>
                <span style={{ ...S.tag('#6060a0'), fontSize: 9 }}>{u.id.slice(0, 8)}…</span>
                <button onClick={() => handleDelete(u.id)} style={S.btnDanger}>🗑</button>
              </div>
            </div>
          );
        })}
    </div>
  );
}

// ─── Create ───────────────────────────────────────────────────────────────────

// ─── Directorio de Teléfonos ──────────────────────────────────────────────────

interface PhoneEntry {
  id: string;
  name: string;
  number: string;
  location: string;
  lat: string;
  lng: string;
  type: 'policia' | 'emergencia' | 'municipal' | 'otro';
  notes: string;
}

const TYPE_LABELS: Record<PhoneEntry['type'], string> = {
  policia: '👮 Policía',
  emergencia: '🚑 Emergencia',
  municipal: '🏛️ Municipal',
  otro: '📞 Otro',
};

const TYPE_COLORS: Record<PhoneEntry['type'], string> = {
  policia: '#3b82f6',
  emergencia: '#ef4444',
  municipal: '#f59e0b',
  otro: '#6060a0',
};

const PHONE_PLACEHOLDER: PhoneEntry[] = [
  { id: '1', name: 'Policía Municipal Tulancingo', number: '771-717-0000', location: 'Tulancingo, Hidalgo', lat: '20.0853', lng: '-98.3625', type: 'policia', notes: 'Central principal' },
  { id: '2', name: 'Policía Estatal Hidalgo', number: '771-714-1111', location: 'Pachuca, Hidalgo', lat: '20.1011', lng: '-98.7591', type: 'policia', notes: '' },
  { id: '3', name: 'Cruz Roja Tulancingo', number: '771-717-0068', location: 'Tulancingo, Hidalgo', lat: '20.0853', lng: '-98.3625', type: 'emergencia', notes: 'Servicio 24h' },
  { id: '4', name: 'Bomberos Municipales', number: '771-717-2233', location: 'Tulancingo, Hidalgo', lat: '20.0853', lng: '-98.3625', type: 'emergencia', notes: '' },
  { id: '5', name: 'Protección Civil Hidalgo', number: '800-727-2828', location: 'Hidalgo (estatal)', lat: '20.1011', lng: '-98.7591', type: 'municipal', notes: 'Número gratuito' },
];

function PhoneDirectory() {
  const [phones, setPhones] = useState<PhoneEntry[]>(PHONE_PLACEHOLDER);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<PhoneEntry['type'] | 'all'>('all');
  const [search, setSearch] = useState('');

  // New entry form state
  const [fName, setFName] = useState('');
  const [fNumber, setFNumber] = useState('');
  const [fLocation, setFLocation] = useState('');
  const [fLat, setFLat] = useState('');
  const [fLng, setFLng] = useState('');
  const [fType, setFType] = useState<PhoneEntry['type']>('policia');
  const [fNotes, setFNotes] = useState('');
  const [fErr, setFErr] = useState('');

  const resetForm = () => {
    setFName(''); setFNumber(''); setFLocation('');
    setFLat(''); setFLng(''); setFType('policia'); setFNotes(''); setFErr('');
  };

  const handleAdd = () => {
    if (!fName.trim() || !fNumber.trim() || !fLocation.trim()) {
      setFErr('Nombre, número y ubicación son obligatorios.');
      return;
    }
    const entry: PhoneEntry = {
      id: Date.now().toString(),
      name: fName.trim(),
      number: fNumber.trim(),
      location: fLocation.trim(),
      lat: fLat.trim(),
      lng: fLng.trim(),
      type: fType,
      notes: fNotes.trim(),
    };
    setPhones(prev => [entry, ...prev]);
    resetForm();
    setShowForm(false);
  };

  const handleDelete = (id: string) => setPhones(prev => prev.filter(p => p.id !== id));

  const filtered = phones.filter(p => {
    const matchType = filter === 'all' || p.type === filter;
    const matchSearch = !search || 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.number.includes(search) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const inputS = { ...S.input, marginBottom: 0 };

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <p style={S.section}>━━ DIRECTORIO DE EMERGENCIAS</p>
          <p style={{ color: '#7070b0', fontSize: 12, margin: 0 }}>
            Números mostrados en la app según ubicación y cercanía del usuario.{' '}
            <span style={{ color: '#4a4a80', fontSize: 11 }}>(Pendiente de conectar a BD)</span>
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); resetForm(); }}
          style={{ ...S.btn('#22c55e'), padding: '10px 20px', fontSize: 13 }}
        >
          {showForm ? '✕ Cancelar' : '+ Agregar número'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ ...S.card, marginBottom: 20, borderColor: 'rgba(34,197,94,0.2)', borderWidth: 1 }}>
          <p style={{ ...S.section, marginBottom: 16 }}>━━ NUEVO NÚMERO DE EMERGENCIA</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={S.label}>NOMBRE / INSTITUCIÓN *</label>
              <input style={inputS} value={fName} onChange={e => setFName(e.target.value)}
                placeholder="Ej. Policía Municipal Tulancingo" />
            </div>
            <div>
              <label style={S.label}>NÚMERO TELEFÓNICO *</label>
              <input style={inputS} value={fNumber} onChange={e => setFNumber(e.target.value)}
                placeholder="771-717-0000" />
            </div>
            <div>
              <label style={S.label}>TIPO</label>
              <select
                value={fType}
                onChange={e => setFType(e.target.value as PhoneEntry['type'])}
                style={{ ...inputS, cursor: 'pointer' }}
              >
                {(Object.keys(TYPE_LABELS) as PhoneEntry['type'][]).map(t => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={S.label}>NOTAS (opcional)</label>
              <input style={inputS} value={fNotes} onChange={e => setFNotes(e.target.value)}
                placeholder="Ej. Servicio 24h, número gratuito…" />
            </div>
          </div>

          <div style={{ marginTop: 14, padding: '14px 16px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 10 }}>
            <p style={{ ...S.section, marginBottom: 12, color: '#6090c0' }}>━━ UBICACIÓN (para mostrar por cercanía)</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>CIUDAD / ZONA *</label>
                <input style={inputS} value={fLocation} onChange={e => setFLocation(e.target.value)}
                  placeholder="Ej. Tulancingo, Hidalgo" />
              </div>
              <div>
                <label style={S.label}>LATITUD (opcional)</label>
                <input style={inputS} value={fLat} onChange={e => setFLat(e.target.value)}
                  placeholder="20.0853" type="number" step="any" />
              </div>
              <div>
                <label style={S.label}>LONGITUD (opcional)</label>
                <input style={inputS} value={fLng} onChange={e => setFLng(e.target.value)}
                  placeholder="-98.3625" type="number" step="any" />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <p style={{ color: '#4a6080', fontSize: 11, margin: 0, lineHeight: 1.5 }}>
                  Las coordenadas permiten ordenar resultados por distancia al usuario.
                </p>
              </div>
            </div>
          </div>

          {fErr && (
            <p style={{ color: '#ef4444', fontSize: 12, marginTop: 10, marginBottom: 0 }}>⚠ {fErr}</p>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={handleAdd} style={{ ...S.btn('#22c55e'), padding: '10px 24px' }}>
              ✓ Guardar número
            </button>
            <button onClick={() => { setShowForm(false); resetForm(); }} style={{ ...S.btn('#6060a0'), padding: '10px 20px' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Filters + Search */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <input
          style={{ ...S.input, width: 240, marginBottom: 0 }}
          placeholder="Buscar nombre, número o ciudad…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', ...Object.keys(TYPE_LABELS)] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilter(t as any)}
              style={{
                ...S.btn(t === 'all' ? '#6060a0' : TYPE_COLORS[t as PhoneEntry['type']]),
                padding: '7px 14px',
                opacity: filter === t ? 1 : 0.45,
                fontSize: 11,
              }}
            >
              {t === 'all' ? 'Todos' : TYPE_LABELS[t as PhoneEntry['type']]}
            </button>
          ))}
        </div>
        <span style={{ color: '#5050a0', fontSize: 11, marginLeft: 'auto' }}>
          {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Phone list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{ ...S.card, textAlign: 'center', color: '#4a4a80', padding: '32px' }}>
            Sin resultados para esta búsqueda.
          </div>
        )}
        {filtered.map(p => (
          <div key={p.id} style={{ ...S.row, alignItems: 'center', gap: 16 }}>
            <span style={S.tag(TYPE_COLORS[p.type])}>{TYPE_LABELS[p.type]}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: '#d0d0f0', fontSize: 14, fontWeight: 700, margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.name}
              </p>
              <p style={{ color: '#6060a0', fontSize: 11, margin: 0 }}>
                📍 {p.location}
                {p.lat && p.lng && <span style={{ color: '#4a4a70', marginLeft: 8 }}>({p.lat}, {p.lng})</span>}
                {p.notes && <span style={{ color: '#5a5a90', marginLeft: 12 }}>· {p.notes}</span>}
              </p>
            </div>
            <a
              href={`tel:${p.number.replace(/[^0-9+]/g,'')}`}
              style={{ ...S.btn('#3b82f6'), padding: '6px 16px', textDecoration: 'none', fontSize: 13, fontWeight: 900 }}
            >
              📞 {p.number}
            </a>
            <button onClick={() => handleDelete(p.id)} style={{ ...S.btnDanger, padding: '6px 12px', fontSize: 12 }}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


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
            <p style={{ color: '#6060a0', fontSize: 10, margin: '2px 0 0', letterSpacing: '0.2em' }}>
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
              ...S.btn(tab === t.id ? '#3b82f6' : '#6060a0'),
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
        {tab === 'phones'    && <PhoneDirectory />}
      </div>
    </div>
  );
}
