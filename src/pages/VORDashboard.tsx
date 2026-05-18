import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const MODOS = [
  { id: 'family',   name: 'Familiar' },
  { id: 'kids',     name: 'Niños' },
  { id: 'soft',     name: 'Inocente' },
  { id: 'party',    name: 'Fiesta' },
  { id: 'school',   name: 'Escuela' },
  { id: 'deep',     name: 'Profundo' },
  { id: 'work',     name: 'Colegas' },
  { id: 'couples',  name: 'Pareja' },
  { id: 'fwb',      name: 'Amigos con Derechos' },
  { id: 'dirty',    name: 'Picante' },
  { id: 'extreme',  name: 'Extremo' },
  { id: 'casual',   name: 'Sexo Casual' },
  { id: 'drinking', name: 'Beberaje' },
];

const INTENSIDAD_LABELS: Record<number, string> = {
  1: 'Suave', 2: 'Medio', 3: 'Alto', 4: 'Progresivo', 5: 'Extremo',
};

const C = {
  pink: '#e91e8c', pinkDim: '#aa1565',
  bg: '#050508', surface: '#0c0c14', surface2: '#111120',
  border: '#1e1e30', borderLight: '#32325a',
  text: '#eeeeff', muted: '#9090b8', dimmed: '#5a5a80',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  background: C.surface2, border: `1px solid ${C.borderLight}`,
  borderRadius: 8, color: C.text, fontSize: 13,
  fontFamily: "'Inter', system-ui, sans-serif", outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  color: C.muted, fontSize: 10, letterSpacing: '0.2em',
  display: 'block', marginBottom: 6, textTransform: 'uppercase',
};

const PAGE_SIZE = 20;

interface Reto {
  id?: string;
  modo_id: string;
  tipo_id: 'verdad' | 'reto';
  texto: string;
  intensidad: number;
  timer: number;
  activo: boolean;
}

interface Castigo {
  id?: string;
  modo_id: string;
  intensidad: number;
  texto: string;
  activo: boolean;
}

const EMPTY_RETO: Reto = { modo_id: 'family', tipo_id: 'reto', texto: '', intensidad: 3, timer: 0, activo: true };
const EMPTY_CASTIGO: Castigo = { modo_id: 'family', intensidad: 3, texto: '', activo: true };

interface Props { onBack: () => void; }

export default function VORDashboard({ onBack }: Props) {
  const [tab, setTab] = useState<'retos' | 'castigos'>('retos');

  // ── Retos state
  const [retos, setRetos] = useState<Reto[]>([]);
  const [retosTotal, setRetosTotal] = useState(0);
  const [retosLoading, setRetosLoading] = useState(true);
  const [filterModo, setFilterModo] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterInt, setFilterInt] = useState(0);
  const [retosPage, setRetosPage] = useState(0);
  const [showRetoForm, setShowRetoForm] = useState(false);
  const [editReto, setEditReto] = useState<Reto>(EMPTY_RETO);

  // ── Castigos state
  const [castigos, setCastigos] = useState<Castigo[]>([]);
  const [castigosTotal, setCastigosTotal] = useState(0);
  const [castigosLoading, setCastigosLoading] = useState(true);
  const [filterCModo, setFilterCModo] = useState('');
  const [filterCInt, setFilterCInt] = useState(0);
  const [castigosPage, setCastigosPage] = useState(0);
  const [showCastigoForm, setShowCastigoForm] = useState(false);
  const [editCastigo, setEditCastigo] = useState<Castigo>(EMPTY_CASTIGO);

  // ── Shared
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState<'ok' | 'err'>('ok');

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(''), 3500);
  };

  // ── Fetch retos
  const fetchRetos = async () => {
    setRetosLoading(true);
    let q = supabase.from('retos').select('*', { count: 'exact' });
    if (filterModo) q = q.eq('modo_id', filterModo);
    if (filterTipo) q = q.eq('tipo_id', filterTipo);
    if (filterInt)  q = q.eq('intensidad', filterInt);
    q = q.order('created_at', { ascending: false })
         .range(retosPage * PAGE_SIZE, (retosPage + 1) * PAGE_SIZE - 1);
    const { data, count, error } = await q;
    if (error) showToast('Error: ' + error.message, 'err');
    setRetos((data as Reto[]) || []);
    setRetosTotal(count || 0);
    setRetosLoading(false);
  };

  // ── Fetch castigos
  const fetchCastigos = async () => {
    setCastigosLoading(true);
    let q = supabase.from('castigos').select('*', { count: 'exact' });
    if (filterCModo) q = q.eq('modo_id', filterCModo);
    if (filterCInt)  q = q.eq('intensidad', filterCInt);
    q = q.order('created_at', { ascending: false })
         .range(castigosPage * PAGE_SIZE, (castigosPage + 1) * PAGE_SIZE - 1);
    const { data, count, error } = await q;
    if (error) showToast('Error: ' + error.message, 'err');
    setCastigos((data as Castigo[]) || []);
    setCastigosTotal(count || 0);
    setCastigosLoading(false);
  };

  useEffect(() => { fetchRetos(); }, [filterModo, filterTipo, filterInt, retosPage]);
  useEffect(() => { fetchCastigos(); }, [filterCModo, filterCInt, castigosPage]);

  // ── Save reto
  const saveReto = async () => {
    if (!editReto.texto.trim()) { showToast('El texto no puede estar vacío', 'err'); return; }
    setSaving(true);
    const payload = {
      modo_id: editReto.modo_id,
      modo: MODOS.find(m => m.id === editReto.modo_id)?.name ?? editReto.modo_id,
      tipo_id: editReto.tipo_id,
      tipo: editReto.tipo_id === 'verdad' ? 'Verdad' : 'Reto',
      texto: editReto.texto.trim(),
      intensidad: editReto.intensidad,
      timer: editReto.timer,
      activo: editReto.activo,
    };
    if (editReto.id) {
      const { error } = await supabase.from('retos').update(payload).eq('id', editReto.id);
      if (error) { showToast('Error: ' + error.message, 'err'); setSaving(false); return; }
      showToast('Reto actualizado ✓');
    } else {
      const { error } = await supabase.from('retos').insert(payload);
      if (error) { showToast('Error: ' + error.message, 'err'); setSaving(false); return; }
      showToast('Reto agregado ✓');
    }
    setSaving(false); setShowRetoForm(false);
    setEditReto(EMPTY_RETO); setRetosPage(0); fetchRetos();
  };

  // ── Save castigo
  const saveCastigo = async () => {
    if (!editCastigo.texto.trim()) { showToast('El texto no puede estar vacío', 'err'); return; }
    setSaving(true);
    const payload = {
      modo_id: editCastigo.modo_id,
      intensidad: editCastigo.intensidad,
      texto: editCastigo.texto.trim(),
      activo: editCastigo.activo,
    };
    if (editCastigo.id) {
      const { error } = await supabase.from('castigos').update(payload).eq('id', editCastigo.id);
      if (error) { showToast('Error: ' + error.message, 'err'); setSaving(false); return; }
      showToast('Castigo actualizado ✓');
    } else {
      const { error } = await supabase.from('castigos').insert(payload);
      if (error) { showToast('Error: ' + error.message, 'err'); setSaving(false); return; }
      showToast('Castigo agregado ✓');
    }
    setSaving(false); setShowCastigoForm(false);
    setEditCastigo(EMPTY_CASTIGO); setCastigosPage(0); fetchCastigos();
  };

  const toggleReto = async (r: Reto) => {
    await supabase.from('retos').update({ activo: !r.activo }).eq('id', r.id);
    showToast(r.activo ? 'Desactivado' : 'Activado'); fetchRetos();
  };

  const deleteReto = async (id: string) => {
    if (!confirm('¿Eliminar este reto permanentemente?')) return;
    await supabase.from('retos').delete().eq('id', id);
    showToast('Eliminado'); fetchRetos();
  };

  const toggleCastigo = async (c: Castigo) => {
    await supabase.from('castigos').update({ activo: !c.activo }).eq('id', c.id);
    showToast(c.activo ? 'Desactivado' : 'Activado'); fetchCastigos();
  };

  const deleteCastigo = async (id: string) => {
    if (!confirm('¿Eliminar este castigo permanentemente?')) return;
    await supabase.from('castigos').delete().eq('id', id);
    showToast('Eliminado'); fetchCastigos();
  };

  const retosTotalPages = Math.ceil(retosTotal / PAGE_SIZE) || 1;
  const castigosTotalPages = Math.ceil(castigosTotal / PAGE_SIZE) || 1;

  const TabBtn = ({ id, label, count }: { id: 'retos' | 'castigos', label: string, count: number }) => (
    <button onClick={() => setTab(id)} style={{
      background: tab === id ? 'rgba(233,30,140,0.12)' : 'transparent',
      border: `1px solid ${tab === id ? 'rgba(233,30,140,0.5)' : C.borderLight}`,
      borderRadius: 10, padding: '10px 24px', cursor: 'pointer',
      color: tab === id ? '#e879b0' : C.dimmed,
      fontSize: 13, fontWeight: tab === id ? 700 : 400,
      fontFamily: "'Inter', system-ui, sans-serif",
      display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s',
    }}>
      {label}
      <span style={{
        background: tab === id ? 'rgba(233,30,140,0.2)' : C.surface2,
        border: `1px solid ${tab === id ? 'rgba(233,30,140,0.4)' : C.border}`,
        borderRadius: 6, padding: '1px 8px',
        color: tab === id ? '#e879b0' : C.dimmed, fontSize: 11,
      }}>{count.toLocaleString()}</span>
    </button>
  );

  const Badges = ({ row, isReto }: { row: any, isReto: boolean }) => (
    <div style={{ display: 'flex', gap: 6, marginBottom: 7, flexWrap: 'wrap', alignItems: 'center' }}>
      {isReto && (
        <span style={{
          background: row.tipo_id === 'verdad' ? '#1a1040' : '#1a0010',
          color: row.tipo_id === 'verdad' ? '#818cf8' : C.pink,
          fontSize: 10, padding: '3px 9px', borderRadius: 6, fontWeight: 700,
          border: `1px solid ${row.tipo_id === 'verdad' ? '#3730a3' : '#9d1570'}`,
        }}>{row.tipo_id === 'verdad' ? 'Verdad' : 'Reto'}</span>
      )}
      <span style={{ background: C.surface2, color: '#aaa', fontSize: 10, padding: '3px 9px', borderRadius: 6, border: `1px solid ${C.borderLight}` }}>
        {MODOS.find(m => m.id === row.modo_id)?.name ?? row.modo_id}
      </span>
      <span style={{ background: C.surface2, color: '#aaa', fontSize: 10, padding: '3px 9px', borderRadius: 6, border: `1px solid ${C.borderLight}` }}>
        Int. {row.intensidad} — {INTENSIDAD_LABELS[row.intensidad]}
      </span>
      {isReto && row.timer > 0 && (
        <span style={{ background: C.surface2, color: '#aaa', fontSize: 10, padding: '3px 9px', borderRadius: 6, border: `1px solid ${C.borderLight}` }}>
          ⏱ {row.timer}s
        </span>
      )}
      {!row.activo && (
        <span style={{ background: '#1a0808', color: '#ef4444', fontSize: 10, padding: '3px 9px', borderRadius: 6, border: '1px solid #3a1515', fontWeight: 700 }}>
          INACTIVO
        </span>
      )}
    </div>
  );

  const ActionBtns = ({ onEdit, onToggle, onDelete, activo }: any) => (
    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
      <button onClick={onEdit} style={{ background: C.surface2, border: `1px solid ${C.borderLight}`, borderRadius: 6, color: '#bbb', padding: '6px 11px', cursor: 'pointer', fontSize: 11 }} title="Editar">✏️</button>
      <button onClick={onToggle} style={{ background: C.surface2, border: `1px solid ${C.borderLight}`, borderRadius: 6, color: '#bbb', padding: '6px 11px', cursor: 'pointer', fontSize: 11 }} title={activo ? 'Desactivar' : 'Activar'}>{activo ? '⏸' : '▶️'}</button>
      <button onClick={onDelete} style={{ background: '#1a0808', border: '1px solid #3a1515', borderRadius: 6, color: '#ef4444', padding: '6px 11px', cursor: 'pointer', fontSize: 11 }} title="Eliminar">🗑️</button>
    </div>
  );

  const Pagination = ({ page, setPage, totalPages, total, loading }: any) => {
    const isFirst = page === 0;
    const isLast = (page + 1) * PAGE_SIZE >= total;
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 18px' }}>
        <span style={{ color: C.muted, fontSize: 12 }}>
          {total > 0 ? `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, total)} de ${total.toLocaleString()}` : '0 resultados'}
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setPage((p: number) => Math.max(0, p - 1))} disabled={isFirst || loading}
            style={{ background: isFirst ? C.surface2 : 'rgba(233,30,140,0.1)', border: `1px solid ${isFirst ? C.border : 'rgba(233,30,140,0.4)'}`, borderRadius: 8, color: isFirst ? C.dimmed : '#e879b0', padding: '8px 18px', cursor: isFirst ? 'not-allowed' : 'pointer', fontSize: 12, fontFamily: "'Inter', system-ui, sans-serif" }}>
            ← Anterior
          </button>
          <span style={{ color: C.text, fontSize: 12, background: C.surface2, border: `1px solid ${C.borderLight}`, padding: '8px 16px', borderRadius: 8, minWidth: 80, textAlign: 'center' }}>
            {page + 1} / {totalPages}
          </span>
          <button onClick={() => setPage((p: number) => p + 1)} disabled={isLast || loading}
            style={{ background: isLast ? C.surface2 : 'rgba(233,30,140,0.1)', border: `1px solid ${isLast ? C.border : 'rgba(233,30,140,0.4)'}`, borderRadius: 8, color: isLast ? C.dimmed : '#e879b0', padding: '8px 18px', cursor: isLast ? 'not-allowed' : 'pointer', fontSize: 12, fontFamily: "'Inter', system-ui, sans-serif" }}>
            Siguiente →
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: toastType === 'ok' ? '#0e1e0e' : '#1e0e0e', border: `1px solid ${toastType === 'ok' ? '#22c55e' : '#ef4444'}`, borderRadius: 10, padding: '12px 20px', color: toastType === 'ok' ? '#86efac' : '#fca5a5', fontSize: 13, maxWidth: 360, boxShadow: `0 4px 24px ${toastType === 'ok' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#ccccee', padding: '8px 16px', cursor: 'pointer', fontSize: 12 }}>← Volver</button>
          <div>
            <h1 style={{ color: C.text, fontSize: 18, fontWeight: 900, margin: 0 }}>🎮 VOR — Verdad o Reto</h1>
            <p style={{ color: C.dimmed, fontSize: 11, margin: '2px 0 0', letterSpacing: '0.15em' }}>
              {retosTotal.toLocaleString()} RETOS · {castigosTotal.toLocaleString()} CASTIGOS
            </p>
          </div>
        </div>
        <button
          onClick={() => { if (tab === 'retos') { setEditReto(EMPTY_RETO); setShowRetoForm(true); } else { setEditCastigo(EMPTY_CASTIGO); setShowCastigoForm(true); } }}
          style={{ background: C.pink, border: `1px solid ${C.pink}`, borderRadius: 8, color: '#fff', padding: '10px 22px', cursor: 'pointer', fontSize: 13, fontWeight: 900, fontFamily: "'Inter', system-ui, sans-serif", boxShadow: '0 0 16px rgba(233,30,140,0.3)' }}>
          + {tab === 'retos' ? 'Nuevo reto' : 'Nuevo castigo'}
        </button>
      </div>

      <div style={{ padding: '24px 28px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <TabBtn id="retos" label="Retos y Verdades" count={retosTotal} />
          <TabBtn id="castigos" label="Castigos" count={castigosTotal} />
        </div>

        {/* ══ TAB RETOS ══ */}
        {tab === 'retos' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Modo</label>
                <select value={filterModo} onChange={e => { setFilterModo(e.target.value); setRetosPage(0); }} style={inputStyle}>
                  <option value="">Todos los modos</option>
                  {MODOS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tipo</label>
                <select value={filterTipo} onChange={e => { setFilterTipo(e.target.value); setRetosPage(0); }} style={inputStyle}>
                  <option value="">Verdad y Reto</option>
                  <option value="verdad">Verdad</option>
                  <option value="reto">Reto</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Intensidad</label>
                <select value={filterInt} onChange={e => { setFilterInt(Number(e.target.value)); setRetosPage(0); }} style={inputStyle}>
                  <option value={0}>Todas</option>
                  {[1,2,3,4,5].map(i => <option key={i} value={i}>{i} — {INTENSIDAD_LABELS[i]}</option>)}
                </select>
              </div>
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
              {retosLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: C.dimmed }}>Cargando...</div>
              ) : retos.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: C.dimmed }}>No hay retos con esos filtros</div>
              ) : retos.map((r, i) => (
                <div key={r.id} style={{ padding: '14px 18px', borderBottom: i < retos.length - 1 ? `1px solid ${C.border}` : 'none', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Badges row={r} isReto={true} />
                    <p style={{ color: r.activo ? '#d0d0e8' : '#4a4a6a', fontSize: 13, margin: 0, lineHeight: 1.55, wordBreak: 'break-word' }}>{r.texto}</p>
                  </div>
                  <ActionBtns
                    onEdit={() => { setEditReto(r); setShowRetoForm(true); }}
                    onToggle={() => toggleReto(r)}
                    onDelete={() => deleteReto(r.id!)}
                    activo={r.activo}
                  />
                </div>
              ))}
            </div>
            <Pagination page={retosPage} setPage={setRetosPage} totalPages={retosTotalPages} total={retosTotal} loading={retosLoading} />
          </>
        )}

        {/* ══ TAB CASTIGOS ══ */}
        {tab === 'castigos' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Modo</label>
                <select value={filterCModo} onChange={e => { setFilterCModo(e.target.value); setCastigosPage(0); }} style={inputStyle}>
                  <option value="">Todos los modos</option>
                  {MODOS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Intensidad</label>
                <select value={filterCInt} onChange={e => { setFilterCInt(Number(e.target.value)); setCastigosPage(0); }} style={inputStyle}>
                  <option value={0}>Todas</option>
                  {[1,2,3,4,5].map(i => <option key={i} value={i}>{i} — {INTENSIDAD_LABELS[i]}</option>)}
                </select>
              </div>
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
              {castigosLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: C.dimmed }}>Cargando...</div>
              ) : castigos.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: C.dimmed }}>No hay castigos con esos filtros</div>
              ) : castigos.map((c, i) => (
                <div key={c.id} style={{ padding: '14px 18px', borderBottom: i < castigos.length - 1 ? `1px solid ${C.border}` : 'none', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Badges row={c} isReto={false} />
                    <p style={{ color: c.activo ? '#d0d0e8' : '#4a4a6a', fontSize: 13, margin: 0, lineHeight: 1.55, wordBreak: 'break-word' }}>{c.texto}</p>
                  </div>
                  <ActionBtns
                    onEdit={() => { setEditCastigo(c); setShowCastigoForm(true); }}
                    onToggle={() => toggleCastigo(c)}
                    onDelete={() => deleteCastigo(c.id!)}
                    activo={c.activo}
                  />
                </div>
              ))}
            </div>
            <Pagination page={castigosPage} setPage={setCastigosPage} totalPages={castigosTotalPages} total={castigosTotal} loading={castigosLoading} />
          </>
        )}
      </div>

      {/* ══ MODAL RETO ══ */}
      {showRetoForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: C.surface, border: `1px solid ${C.borderLight}`, borderRadius: 18, padding: '2rem', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: C.text, fontSize: 16, fontWeight: 900, margin: 0 }}>{editReto.id ? '✏️ Editar reto' : '+ Nuevo reto'}</h2>
              <button onClick={() => setShowRetoForm(false)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 22 }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Modo</label>
                <select value={editReto.modo_id} onChange={e => setEditReto({ ...editReto, modo_id: e.target.value })} style={inputStyle}>
                  {MODOS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tipo</label>
                <select value={editReto.tipo_id} onChange={e => setEditReto({ ...editReto, tipo_id: e.target.value as 'verdad' | 'reto' })} style={inputStyle}>
                  <option value="verdad">Verdad</option>
                  <option value="reto">Reto</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Intensidad</label>
                <select value={editReto.intensidad} onChange={e => setEditReto({ ...editReto, intensidad: Number(e.target.value) })} style={inputStyle}>
                  {[1,2,3,4,5].map(i => <option key={i} value={i}>{i} — {INTENSIDAD_LABELS[i]}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Timer (seg, 0 = sin timer)</label>
                <input type="number" min={0} max={300} value={editReto.timer} onChange={e => setEditReto({ ...editReto, timer: Number(e.target.value) })} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Texto</label>
              <textarea value={editReto.texto} onChange={e => setEditReto({ ...editReto, texto: e.target.value })} rows={4} placeholder="Escribe el reto o la verdad..." style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
              <p style={{ color: C.dimmed, fontSize: 11, marginTop: 4 }}>Usa {'{player}'} para el jugador y {'{target}'} para otro jugador aleatorio</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <input type="checkbox" id="reto-activo" checked={editReto.activo} onChange={e => setEditReto({ ...editReto, activo: e.target.checked })} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: C.pink }} />
              <label htmlFor="reto-activo" style={{ color: C.muted, fontSize: 12, cursor: 'pointer', letterSpacing: '0.1em' }}>ACTIVO</label>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowRetoForm(false)} style={{ background: 'none', border: `1px solid ${C.borderLight}`, borderRadius: 8, color: '#aaa', padding: '10px 22px', cursor: 'pointer', fontSize: 13, fontFamily: "'Inter', system-ui, sans-serif" }}>Cancelar</button>
              <button onClick={saveReto} disabled={saving} style={{ background: saving ? C.pinkDim : C.pink, border: 'none', borderRadius: 8, color: '#fff', padding: '10px 26px', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 900, fontFamily: "'Inter', system-ui, sans-serif" }}>
                {saving ? 'Guardando...' : editReto.id ? 'Actualizar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL CASTIGO ══ */}
      {showCastigoForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: C.surface, border: `1px solid ${C.borderLight}`, borderRadius: 18, padding: '2rem', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: C.text, fontSize: 16, fontWeight: 900, margin: 0 }}>{editCastigo.id ? '✏️ Editar castigo' : '+ Nuevo castigo'}</h2>
              <button onClick={() => setShowCastigoForm(false)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 22 }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Modo</label>
                <select value={editCastigo.modo_id} onChange={e => setEditCastigo({ ...editCastigo, modo_id: e.target.value })} style={inputStyle}>
                  {MODOS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Intensidad</label>
                <select value={editCastigo.intensidad} onChange={e => setEditCastigo({ ...editCastigo, intensidad: Number(e.target.value) })} style={inputStyle}>
                  {[1,2,3,4,5].map(i => <option key={i} value={i}>{i} — {INTENSIDAD_LABELS[i]}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Texto del castigo</label>
              <textarea value={editCastigo.texto} onChange={e => setEditCastigo({ ...editCastigo, texto: e.target.value })} rows={3} placeholder="Escribe el castigo..." style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <input type="checkbox" id="castigo-activo" checked={editCastigo.activo} onChange={e => setEditCastigo({ ...editCastigo, activo: e.target.checked })} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: C.pink }} />
              <label htmlFor="castigo-activo" style={{ color: C.muted, fontSize: 12, cursor: 'pointer', letterSpacing: '0.1em' }}>ACTIVO</label>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCastigoForm(false)} style={{ background: 'none', border: `1px solid ${C.borderLight}`, borderRadius: 8, color: '#aaa', padding: '10px 22px', cursor: 'pointer', fontSize: 13, fontFamily: "'Inter', system-ui, sans-serif" }}>Cancelar</button>
              <button onClick={saveCastigo} disabled={saving} style={{ background: saving ? C.pinkDim : C.pink, border: 'none', borderRadius: 8, color: '#fff', padding: '10px 26px', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 900, fontFamily: "'Inter', system-ui, sans-serif" }}>
                {saving ? 'Guardando...' : editCastigo.id ? 'Actualizar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}