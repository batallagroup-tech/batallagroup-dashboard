import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface Reto {
  id?: string;
  modo: string;
  tipo: 'Verdad' | 'Reto';
  texto: string;
  intensidad: number;
  timer: number;
  activo: boolean;
}

const MODOS = ['Extremo Beberaje', 'Beberaje', 'Familiar', 'Picante', 'Pareja', 'Niños', 'Inocente', 'Fiesta', 'Escuela', 'Profundo', 'Colegas', 'Extremo', 'Casual'];
const TIPOS = ['Verdad', 'Reto'];
const INTENSIDADES = [1, 2, 3, 4, 5];
const INTENSIDAD_LABELS: Record<number, string> = { 1: 'Suave', 2: 'Medio', 3: 'Alto', 4: 'Intenso', 5: 'Extremo' };

const EMPTY_RETO: Reto = { modo: 'Familiar', tipo: 'Reto', texto: '', intensidad: 3, timer: 0, activo: true };

interface Props { onBack: () => void; }

export default function VORDashboard({ onBack }: Props) {
  const [retos, setRetos] = useState<Reto[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filterModo, setFilterModo] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterIntensidad, setFilterIntensidad] = useState(0);
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editReto, setEditReto] = useState<Reto>(EMPTY_RETO);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const PAGE_SIZE = 20;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchRetos = async () => {
    setLoading(true);
    let query = supabase.from('retos').select('*', { count: 'exact' });
    if (filterModo) query = query.eq('modo', filterModo);
    if (filterTipo) query = query.eq('tipo', filterTipo);
    if (filterIntensidad) query = query.eq('intensidad', filterIntensidad);
    query = query.order('created_at', { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    const { data, count } = await query;
    setRetos(data || []);
    setTotal(count || 0);
    setLoading(false);
  };

  useEffect(() => { fetchRetos(); }, [filterModo, filterTipo, filterIntensidad, page]);

  const save = async () => {
    if (!editReto.texto.trim()) { showToast('❌ El texto no puede estar vacío'); return; }
    setSaving(true);
    if (editReto.id) {
      await supabase.from('retos').update({ modo: editReto.modo, tipo: editReto.tipo, texto: editReto.texto, intensidad: editReto.intensidad, timer: editReto.timer, activo: editReto.activo }).eq('id', editReto.id);
      showToast('✅ Reto actualizado');
    } else {
      await supabase.from('retos').insert({ modo: editReto.modo, tipo: editReto.tipo, texto: editReto.texto, intensidad: editReto.intensidad, timer: editReto.timer, activo: editReto.activo });
      showToast('✅ Reto agregado');
    }
    setSaving(false);
    setShowForm(false);
    setEditReto(EMPTY_RETO);
    fetchRetos();
  };

  const toggleActivo = async (reto: Reto) => {
    await supabase.from('retos').update({ activo: !reto.activo }).eq('id', reto.id);
    showToast(reto.activo ? '⏸ Reto desactivado' : '▶️ Reto activado');
    fetchRetos();
  };

  const deleteReto = async (id: string) => {
    if (!confirm('¿Eliminar este reto permanentemente?')) return;
    await supabase.from('retos').delete().eq('id', id);
    showToast('🗑️ Reto eliminado');
    fetchRetos();
  };

  const s = { fontFamily: "'Courier New', monospace" };
  const inputStyle = { width: '100%', padding: '10px 12px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, fontFamily: "'Courier New', monospace" };
  const labelStyle = { color: '#666', fontSize: 10, letterSpacing: '0.2em', display: 'block', marginBottom: 6 };
  const btnPrimary = { background: '#e91e8c', border: 'none', borderRadius: 8, color: '#fff', padding: '10px 20px', cursor: 'pointer', fontSize: 12, fontWeight: 900, ...s };
  const btnSecondary = { background: 'none', border: '1px solid #333', borderRadius: 8, color: '#666', padding: '10px 20px', cursor: 'pointer', fontSize: 12, ...s };

  return (
    <div style={{ minHeight: '100vh', background: '#080808', ...s, padding: '2rem 1rem' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#111', border: '1px solid #333', borderRadius: 10, padding: '12px 20px', color: '#fff', fontSize: 13, zIndex: 9999 }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={onBack} style={{ ...btnSecondary, padding: '8px 14px' }}>← Volver</button>
            <div>
              <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 900, margin: 0 }}>🎮 VOR — Verdad o Reto</h1>
              <p style={{ color: '#444', fontSize: 11, margin: '2px 0 0', letterSpacing: '0.15em' }}>{total.toLocaleString()} RETOS EN BASE DE DATOS</p>
            </div>
          </div>
          <button onClick={() => { setEditReto(EMPTY_RETO); setShowForm(true); }} style={btnPrimary}>
            + Nuevo reto
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>MODO</label>
            <select value={filterModo} onChange={e => { setFilterModo(e.target.value); setPage(0); }} style={{ ...inputStyle }}>
              <option value="">Todos los modos</option>
              {MODOS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>TIPO</label>
            <select value={filterTipo} onChange={e => { setFilterTipo(e.target.value); setPage(0); }} style={{ ...inputStyle }}>
              <option value="">Verdad y Reto</option>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>INTENSIDAD</label>
            <select value={filterIntensidad} onChange={e => { setFilterIntensidad(Number(e.target.value)); setPage(0); }} style={{ ...inputStyle }}>
              <option value={0}>Todas</option>
              {INTENSIDADES.map(i => <option key={i} value={i}>{i} — {INTENSIDAD_LABELS[i]}</option>)}
            </select>
          </div>
        </div>

        {/* Lista de retos */}
        <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 14, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#444' }}>Cargando retos...</div>
          ) : retos.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#444' }}>No hay retos con esos filtros</div>
          ) : (
            retos.map((reto, i) => (
              <div key={reto.id} style={{ padding: '14px 16px', borderBottom: i < retos.length - 1 ? '1px solid #1a1a1a' : 'none', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ background: reto.tipo === 'Verdad' ? '#1a1040' : '#1a0010', color: reto.tipo === 'Verdad' ? '#818cf8' : '#e91e8c', fontSize: 10, padding: '3px 8px', borderRadius: 6, fontWeight: 700, letterSpacing: '0.1em' }}>
                      {reto.tipo.toUpperCase()}
                    </span>
                    <span style={{ background: '#1a1a1a', color: '#888', fontSize: 10, padding: '3px 8px', borderRadius: 6 }}>{reto.modo}</span>
                    <span style={{ background: '#1a1a1a', color: '#888', fontSize: 10, padding: '3px 8px', borderRadius: 6 }}>Intensidad {reto.intensidad}</span>
                    {reto.timer > 0 && <span style={{ background: '#1a1a1a', color: '#888', fontSize: 10, padding: '3px 8px', borderRadius: 6 }}>⏱ {reto.timer}s</span>}
                    {!reto.activo && <span style={{ background: '#1a0a0a', color: '#ef4444', fontSize: 10, padding: '3px 8px', borderRadius: 6 }}>INACTIVO</span>}
                  </div>
                  <p style={{ color: reto.activo ? '#ccc' : '#555', fontSize: 13, margin: 0, lineHeight: 1.5 }}>{reto.texto}</p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => { setEditReto(reto); setShowForm(true); }} style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: 6, color: '#666', padding: '6px 10px', cursor: 'pointer', fontSize: 11, ...s }}>✏️</button>
                  <button onClick={() => toggleActivo(reto)} style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: 6, color: '#666', padding: '6px 10px', cursor: 'pointer', fontSize: 11, ...s }}>{reto.activo ? '⏸' : '▶️'}</button>
                  <button onClick={() => deleteReto(reto.id!)} style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: 6, color: '#666', padding: '6px 10px', cursor: 'pointer', fontSize: 11, ...s }}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Paginación */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <span style={{ color: '#444', fontSize: 12 }}>
            Mostrando {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} de {total.toLocaleString()}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ ...btnSecondary, opacity: page === 0 ? 0.3 : 1 }}>← Anterior</button>
            <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PAGE_SIZE >= total} style={{ ...btnSecondary, opacity: (page + 1) * PAGE_SIZE >= total ? 0.3 : 1 }}>Siguiente →</button>
          </div>
        </div>
      </div>

      {/* Modal formulario */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000 }}>
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 900, margin: 0 }}>
                {editReto.id ? '✏️ Editar reto' : '+ Nuevo reto'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>MODO</label>
                <select value={editReto.modo} onChange={e => setEditReto({ ...editReto, modo: e.target.value })} style={inputStyle}>
                  {MODOS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>TIPO</label>
                <select value={editReto.tipo} onChange={e => setEditReto({ ...editReto, tipo: e.target.value as 'Verdad' | 'Reto' })} style={inputStyle}>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>INTENSIDAD</label>
                <select value={editReto.intensidad} onChange={e => setEditReto({ ...editReto, intensidad: Number(e.target.value) })} style={inputStyle}>
                  {INTENSIDADES.map(i => <option key={i} value={i}>{i} — {INTENSIDAD_LABELS[i]}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>TIMER (segundos, 0 = sin timer)</label>
                <input type="number" min={0} max={300} value={editReto.timer} onChange={e => setEditReto({ ...editReto, timer: Number(e.target.value) })} style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>TEXTO DEL RETO / VERDAD</label>
              <textarea
                value={editReto.texto}
                onChange={e => setEditReto({ ...editReto, texto: e.target.value })}
                rows={4}
                placeholder="Escribe aquí el reto o la verdad..."
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              />
              <p style={{ color: '#333', fontSize: 11, margin: '4px 0 0' }}>Usa {'{player}'} para el jugador actual y {'{target}'} para otro jugador aleatorio</p>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={btnSecondary}>Cancelar</button>
              <button onClick={save} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Guardando...' : editReto.id ? 'Actualizar' : 'Agregar reto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
