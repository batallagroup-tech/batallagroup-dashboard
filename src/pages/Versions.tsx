/**
 * Versions.tsx — Gestión de changelog y versiones de tus apps
 * Datos guardados en localStorage — sin Supabase por ahora
 */

import { useState, useEffect } from 'react';
import type { Theme } from '../App';

interface Props { onBack: () => void; theme: Theme; }

interface Version {
  id: string;
  app: string;
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch' | 'hotfix';
  changes: string[];
  notes: string;
}

const INITIAL: Version[] = [
  {
    id: '1', app: 'BarrioAlerta', version: 'v1.2.0', date: '2026-05-18',
    type: 'minor', notes: 'Primera versión funcional completa con Supabase.',
    changes: ['Mapa de incidentes con Leaflet', 'Sistema SOS activo', 'Notificaciones push OneSignal', 'Chat por incidente', 'Sistema de reputación con niveles'],
  },
  {
    id: '2', app: 'VOR', version: 'v1.4.0', date: '2026-05-17',
    type: 'minor', notes: 'Nuevos modos de juego y correcciones de contenido.',
    changes: ['13 modos de juego activos', '2,216 retos en total', 'Filtros por categoría mejorados', 'Fix: crash en modo caliente'],
  },
  {
    id: '3', app: 'Dashboard', version: 'v1.4.0', date: '2026-05-19',
    type: 'minor', notes: 'Panel de administración de BarrioAlerta completo.',
    changes: ['Módulo BarrioAlerta Admin con Supabase Realtime', 'Favicon BG profesional', 'Botón pantalla completa global', 'Analytics, Versiones, Ya Voy! Admin'],
  },
];

const APPS = ['BarrioAlerta', 'VOR', 'Ya Voy!', 'Dashboard'];
const TYPES: Version['type'][] = ['major', 'minor', 'patch', 'hotfix'];
const TYPE_COLORS: Record<string, string> = {
  major: '#ef4444', minor: '#3b82f6', patch: '#22c55e', hotfix: '#f59e0b',
};
const TYPE_LABELS: Record<string, string> = {
  major: '🔴 Major', minor: '🔵 Minor', patch: '🟢 Patch', hotfix: '🟡 Hotfix',
};

const STORAGE_KEY = 'bg_versions';

export default function Versions({ onBack, theme }: Props) {
  const [versions, setVersions] = useState<Version[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL;
    } catch { return INITIAL; }
  });

  const [filterApp, setFilterApp] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Version | null>(null);

  const empty: Version = { id: '', app: 'BarrioAlerta', version: '', date: new Date().toISOString().slice(0,10), type: 'patch', changes: [''], notes: '' };
  const [form, setForm] = useState<Version>({ ...empty });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
  }, [versions]);

  const filtered = versions
    .filter(v => filterApp === 'all' || v.app === filterApp)
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleSave = () => {
    const clean = { ...form, changes: form.changes.filter(c => c.trim()) };
    if (!clean.version || !clean.app) return;
    if (editing) {
      setVersions(prev => prev.map(v => v.id === editing.id ? { ...clean, id: editing.id } : v));
    } else {
      setVersions(prev => [{ ...clean, id: Date.now().toString() }, ...prev]);
    }
    setShowForm(false); setEditing(null); setForm({ ...empty });
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar esta versión?')) return;
    setVersions(prev => prev.filter(v => v.id !== id));
  };

  const handleEdit = (v: Version) => {
    setForm({ ...v }); setEditing(v); setShowForm(true);
  };

  const updateChange = (i: number, val: string) => {
    const arr = [...form.changes]; arr[i] = val; setForm({ ...form, changes: arr });
  };
  const addChange = () => setForm({ ...form, changes: [...form.changes, ''] });
  const removeChange = (i: number) => setForm({ ...form, changes: form.changes.filter((_, idx) => idx !== i) });

  const card = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: '20px 22px' };
  const inp = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, padding: '9px 13px', width: '100%', fontSize: 13, fontFamily: "'Inter', system-ui, sans-serif", outline: 'none', boxSizing: 'border-box' as const, marginBottom: 10 };
  const lbl = { color: theme.textDim, fontSize: 11, letterSpacing: '0.2em', display: 'block', marginBottom: 5, marginTop: 4 } as React.CSSProperties;

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: "'Inter', system-ui, sans-serif", color: theme.text }}>
      <div style={{ background: theme.bg2, borderBottom: `1px solid ${theme.border}`, padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky' as const, top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={onBack} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textMuted, padding: '6px 14px', cursor: 'pointer', fontSize: 12 }}>← Volver</button>
          <div>
            <h1 style={{ color: theme.text, fontSize: 17, fontWeight: 900, margin: 0 }}>📋 Versiones & Changelog</h1>
            <p style={{ color: theme.textDim, fontSize: 10, margin: '2px 0 0', letterSpacing: '0.2em' }}>HISTORIAL DE VERSIONES · LOCAL STORAGE</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={filterApp} onChange={e => setFilterApp(e.target.value)}
            style={{ ...inp, width: 160, marginBottom: 0 }}>
            <option value="all">Todas las apps</option>
            {APPS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button onClick={() => { setForm({ ...empty }); setEditing(null); setShowForm(true); }}
            style={{ background: '#3b82f620', border: '1px solid #3b82f640', borderRadius: 8, color: '#3b82f6', padding: '8px 18px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            + Nueva versión
          </button>
        </div>
      </div>

      <div style={{ padding: '28px', maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: showForm ? '1fr 380px' : '1fr', gap: 20 }}>
        {/* Timeline */}
        <div>
          {filtered.length === 0
            ? <p style={{ color: theme.textDim, textAlign: 'center', padding: '60px 0' }}>Sin versiones registradas</p>
            : filtered.map((v, i) => (
              <div key={v.id} style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                {/* Timeline dot */}
                <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: TYPE_COLORS[v.type], marginTop: 4, boxShadow: `0 0 8px ${TYPE_COLORS[v.type]}80` }} />
                  {i < filtered.length - 1 && <div style={{ width: 1, flex: 1, background: theme.border, marginTop: 4 }} />}
                </div>
                {/* Card */}
                <div style={{ ...card, flex: 1, marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' as const }}>
                        <span style={{ color: theme.text, fontSize: 16, fontWeight: 900 }}>{v.version}</span>
                        <span style={{ background: `${TYPE_COLORS[v.type]}20`, border: `1px solid ${TYPE_COLORS[v.type]}40`, borderRadius: 6, padding: '2px 8px', color: TYPE_COLORS[v.type], fontSize: 10, fontWeight: 700 }}>{TYPE_LABELS[v.type]}</span>
                        <span style={{ background: '#3b82f620', border: '1px solid #3b82f640', borderRadius: 6, padding: '2px 8px', color: '#3b82f6', fontSize: 10, fontWeight: 700 }}>{v.app}</span>
                      </div>
                      <p style={{ color: theme.textDim, fontSize: 11, margin: 0 }}>📅 {new Date(v.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleEdit(v)} style={{ background: '#3b82f615', border: '1px solid #3b82f630', borderRadius: 7, color: '#3b82f6', padding: '5px 12px', cursor: 'pointer', fontSize: 11 }}>✏ Editar</button>
                      <button onClick={() => handleDelete(v.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, color: '#ef4444', padding: '5px 12px', cursor: 'pointer', fontSize: 11 }}>🗑</button>
                    </div>
                  </div>
                  {v.notes && <p style={{ color: theme.textMuted, fontSize: 12, marginBottom: 12, fontStyle: 'italic' }}>"{v.notes}"</p>}
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {v.changes.map((c, j) => (
                      <li key={j} style={{ color: theme.textMuted, fontSize: 12, marginBottom: 4 }}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ ...card, alignSelf: 'flex-start', position: 'sticky' as const, top: 80 }}>
            <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.3em', margin: '0 0 16px' }}>━━ {editing ? 'EDITAR VERSIÓN' : 'NUEVA VERSIÓN'}</p>

            <label style={lbl}>APP</label>
            <select style={inp} value={form.app} onChange={e => setForm({ ...form, app: e.target.value })}>
              {APPS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            <label style={lbl}>VERSIÓN</label>
            <input style={inp} value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} placeholder="v1.2.0" />

            <label style={lbl}>TIPO</label>
            <select style={inp} value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Version['type'] })}>
              {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>

            <label style={lbl}>FECHA</label>
            <input style={inp} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />

            <label style={lbl}>NOTAS</label>
            <textarea style={{ ...inp, minHeight: 60, resize: 'vertical' as const }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Descripción general de esta versión…" />

            <label style={lbl}>CAMBIOS</label>
            {form.changes.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <input style={{ ...inp, marginBottom: 0, flex: 1 }} value={c} onChange={e => updateChange(i, e.target.value)} placeholder={`Cambio ${i + 1}…`} />
                {form.changes.length > 1 && (
                  <button onClick={() => removeChange(i)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, color: '#ef4444', padding: '0 10px', cursor: 'pointer', flexShrink: 0 }}>✕</button>
                )}
              </div>
            ))}
            <button onClick={addChange} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 7, color: theme.textMuted, padding: '6px 14px', cursor: 'pointer', fontSize: 11, width: '100%', marginBottom: 14 }}>+ Agregar cambio</button>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSave} style={{ background: '#3b82f620', border: '1px solid #3b82f640', borderRadius: 8, color: '#3b82f6', padding: '10px 0', cursor: 'pointer', fontWeight: 700, flex: 1 }}>✓ Guardar</button>
              <button onClick={() => { setShowForm(false); setEditing(null); }} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textMuted, padding: '10px 14px', cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
