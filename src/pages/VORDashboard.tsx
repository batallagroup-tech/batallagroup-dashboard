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

// Modos exactos como están en la base de datos
const MODOS = [
  'Extremo Beberaje',
  'Beberaje',
  'Familiar',
  'Picante',
  'Pareja',
  'Niños',
  'Inocente',
  'Fiesta',
  'Escuela',
  'Profundo',
  'Colegas',
  'Extremo',
  'Sexo Casual',
];
const TIPOS = ['Verdad', 'Reto'];
const INTENSIDADES = [1, 2, 3, 4, 5];
const INTENSIDAD_LABELS: Record<number, string> = { 1: 'Suave', 2: 'Medio', 3: 'Alto', 4: 'Intenso', 5: 'Extremo' };
const EMPTY_RETO: Reto = { modo: 'Familiar', tipo: 'Reto', texto: '', intensidad: 3, timer: 0, activo: true };
const PAGE_SIZE = 20;

const C = {
  pink: '#e91e8c',
  pinkDim: '#aa1565',
  bg: '#050508',
  surface: '#0c0c14',
  surface2: '#111120',
  border: '#1e1e30',
  borderLight: '#32325a',
  text: '#eeeeff',
  muted: '#9090b8',
  dimmed: '#5a5a80',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  background: C.surface2,
  border: `1px solid ${C.borderLight}`,
  borderRadius: 8,
  color: C.text,
  fontSize: 13,
  fontFamily: "'Inter', system-ui, sans-serif",
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  color: C.muted,
  fontSize: 10,
  letterSpacing: '0.2em',
  display: 'block',
  marginBottom: 6,
  textTransform: 'uppercase',
};

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
  const [toastType, setToastType] = useState<'ok' | 'err'>('ok');

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 3500);
  };

  const fetchRetos = async () => {
    setLoading(true);
    let query = supabase.from('retos').select('*', { count: 'exact' });
    if (filterModo) query = query.eq('modo', filterModo);
    if (filterTipo) query = query.eq('tipo', filterTipo);
    if (filterIntensidad) query = query.eq('intensidad', filterIntensidad);
    query = query.order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    const { data, count, error } = await query;
    if (error) showToast('Error cargando retos: ' + error.message, 'err');
    setRetos((data as Reto[]) || []);
    setTotal(count || 0);
    setLoading(false);
  };

  useEffect(() => { fetchRetos(); }, [filterModo, filterTipo, filterIntensidad, page]);

  const save = async () => {
    if (!editReto.texto.trim()) { showToast('El texto no puede estar vacío', 'err'); return; }
    setSaving(true);
    const payload = {
      modo: editReto.modo,
      tipo: editReto.tipo,
      texto: editReto.texto.trim(),
      intensidad: editReto.intensidad,
      timer: editReto.timer,
      activo: editReto.activo,
    };
    if (editReto.id) {
      const { error } = await supabase.from('retos').update(payload).eq('id', editReto.id);
      if (error) { showToast('Error al actualizar: ' + error.message, 'err'); setSaving(false); return; }
      showToast('Reto actualizado ✓');
    } else {
      const { error } = await supabase.from('retos').insert(payload);
      if (error) { showToast('Error al agregar: ' + error.message, 'err'); setSaving(false); return; }
      showToast('Reto agregado ✓');
    }
    setSaving(false);
    setShowForm(false);
    setEditReto(EMPTY_RETO);
    setPage(0);
    fetchRetos();
  };

  const toggleActivo = async (reto: Reto) => {
    const { error } = await supabase.from('retos').update({ activo: !reto.activo }).eq('id', reto.id);
    if (error) { showToast('Error al cambiar estado: ' + error.message, 'err'); return; }
    showToast(reto.activo ? 'Desactivado' : 'Activado');
    fetchRetos();
  };

  const deleteReto = async (id: string) => {
    if (!confirm('¿Eliminar este reto permanentemente?')) return;
    const { error } = await supabase.from('retos').delete().eq('id', id);
    if (error) { showToast('Error al eliminar: ' + error.message, 'err'); return; }
    showToast('Eliminado');
    fetchRetos();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  const isFirst = page === 0;
  const isLast = (page + 1) * PAGE_SIZE >= total;

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: C.bg,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toastType === 'ok' ? '#0e1e0e' : '#1e0e0e',
          border: `1px solid ${toastType === 'ok' ? '#22c55e' : '#ef4444'}`,
          borderRadius: 10, padding: '12px 20px',
          color: toastType === 'ok' ? '#86efac' : '#fca5a5',
          fontSize: 13, maxWidth: 360,
          boxShadow: `0 4px 24px ${toastType === 'ok' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        padding: '16px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8, color: '#ccccee',
              padding: '8px 16px', cursor: 'pointer',
              fontSize: 12,
            }}
          >
            ← Volver
          </button>
          <div>
            <h1 style={{ color: C.text, fontSize: 18, fontWeight: 900, margin: 0 }}>
              🎮 VOR — Verdad o Reto
            </h1>
            <p style={{ color: C.dimmed, fontSize: 11, margin: '2px 0 0', letterSpacing: '0.15em' }}>
              {total.toLocaleString()} RETOS EN BASE DE DATOS
            </p>
          </div>
        </div>
        <button
          onClick={() => { setEditReto(EMPTY_RETO); setShowForm(true); }}
          style={{
            background: C.pink,
            border: `1px solid ${C.pink}`,
            borderRadius: 8, color: '#fff',
            padding: '10px 22px', cursor: 'pointer',
            fontSize: 13, fontWeight: 900,
            fontFamily: "'Inter', system-ui, sans-serif",
            boxShadow: `0 0 16px rgba(233,30,140,0.3)`,
          }}
        >
          + Nuevo reto
        </button>
      </div>

      <div style={{ padding: '24px 28px' }}>
        {/* Filtros */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12, marginBottom: 20,
        }}>
          <div>
            <label style={labelStyle}>Modo</label>
            <select
              value={filterModo}
              onChange={e => { setFilterModo(e.target.value); setPage(0); }}
              style={inputStyle}
            >
              <option value="">Todos los modos</option>
              {MODOS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tipo</label>
            <select
              value={filterTipo}
              onChange={e => { setFilterTipo(e.target.value); setPage(0); }}
              style={inputStyle}
            >
              <option value="">Verdad y Reto</option>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Intensidad</label>
            <select
              value={filterIntensidad}
              onChange={e => { setFilterIntensidad(Number(e.target.value)); setPage(0); }}
              style={inputStyle}
            >
              <option value={0}>Todas</option>
              {INTENSIDADES.map(i => <option key={i} value={i}>{i} — {INTENSIDAD_LABELS[i]}</option>)}
            </select>
          </div>
        </div>

        {/* Lista */}
        <div style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 14, overflow: 'hidden', marginBottom: 16,
        }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: C.dimmed }}>
              Cargando retos...
            </div>
          ) : retos.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: C.dimmed }}>
              No hay retos con esos filtros
            </div>
          ) : (
            retos.map((reto, i) => (
              <div
                key={reto.id}
                style={{
                  padding: '14px 18px',
                  borderBottom: i < retos.length - 1 ? `1px solid ${C.border}` : 'none',
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 7, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{
                      background: reto.tipo === 'Verdad' ? '#1a1040' : '#1a0010',
                      color: reto.tipo === 'Verdad' ? '#818cf8' : C.pink,
                      fontSize: 10, padding: '3px 9px', borderRadius: 6, fontWeight: 700,
                      border: `1px solid ${reto.tipo === 'Verdad' ? '#3730a3' : '#9d1570'}`,
                    }}>
                      {reto.tipo}
                    </span>
                    <span style={{
                      background: C.surface2, color: '#aaa',
                      fontSize: 10, padding: '3px 9px', borderRadius: 6,
                      border: `1px solid ${C.borderLight}`,
                    }}>
                      {reto.modo}
                    </span>
                    <span style={{
                      background: C.surface2, color: '#aaa',
                      fontSize: 10, padding: '3px 9px', borderRadius: 6,
                      border: `1px solid ${C.borderLight}`,
                    }}>
                      Int. {reto.intensidad}
                    </span>
                    {reto.timer > 0 && (
                      <span style={{
                        background: C.surface2, color: '#aaa',
                        fontSize: 10, padding: '3px 9px', borderRadius: 6,
                        border: `1px solid ${C.borderLight}`,
                      }}>
                        ⏱ {reto.timer}s
                      </span>
                    )}
                    {!reto.activo && (
                      <span style={{
                        background: '#1a0808', color: '#ef4444',
                        fontSize: 10, padding: '3px 9px', borderRadius: 6,
                        border: '1px solid #3a1515', fontWeight: 700,
                      }}>
                        INACTIVO
                      </span>
                    )}
                  </div>
                  <p style={{
                    color: reto.activo ? '#d0d0e8' : '#4a4a6a',
                    fontSize: 13, margin: 0, lineHeight: 1.55, wordBreak: 'break-word',
                  }}>
                    {reto.texto}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => { setEditReto(reto); setShowForm(true); }}
                    style={{
                      background: C.surface2,
                      border: `1px solid ${C.borderLight}`,
                      borderRadius: 6, color: '#bbb',
                      padding: '6px 11px', cursor: 'pointer', fontSize: 11,
                    }}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => toggleActivo(reto)}
                    style={{
                      background: C.surface2,
                      border: `1px solid ${C.borderLight}`,
                      borderRadius: 6, color: '#bbb',
                      padding: '6px 11px', cursor: 'pointer', fontSize: 11,
                    }}
                    title={reto.activo ? 'Desactivar' : 'Activar'}
                  >
                    {reto.activo ? '⏸' : '▶️'}
                  </button>
                  <button
                    onClick={() => deleteReto(reto.id!)}
                    style={{
                      background: '#1a0808',
                      border: '1px solid #3a1515',
                      borderRadius: 6, color: '#ef4444',
                      padding: '6px 11px', cursor: 'pointer', fontSize: 11,
                    }}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Paginación */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: '12px 18px',
        }}>
          <span style={{ color: C.muted, fontSize: 12 }}>
            {total > 0
              ? `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, total)} de ${total.toLocaleString()}`
              : '0 resultados'}
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={isFirst}
              style={{
                background: isFirst ? C.surface2 : 'rgba(233,30,140,0.1)',
                border: `1px solid ${isFirst ? C.border : 'rgba(233,30,140,0.4)'}`,
                borderRadius: 8,
                color: isFirst ? C.dimmed : '#e879b0',
                padding: '8px 18px', cursor: isFirst ? 'not-allowed' : 'pointer',
                fontSize: 12, fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              ← Anterior
            </button>
            <span style={{
              color: C.text, fontSize: 12,
              background: C.surface2, border: `1px solid ${C.borderLight}`,
              padding: '8px 16px', borderRadius: 8, minWidth: 80, textAlign: 'center',
            }}>
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={isLast}
              style={{
                background: isLast ? C.surface2 : 'rgba(233,30,140,0.1)',
                border: `1px solid ${isLast ? C.border : 'rgba(233,30,140,0.4)'}`,
                borderRadius: 8,
                color: isLast ? C.dimmed : '#e879b0',
                padding: '8px 18px', cursor: isLast ? 'not-allowed' : 'pointer',
                fontSize: 12, fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.92)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem', zIndex: 1000,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: C.surface,
            border: `1px solid ${C.borderLight}`,
            borderRadius: 18, padding: '2rem',
            width: '100%', maxWidth: 560,
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '1.5rem',
            }}>
              <h2 style={{ color: C.text, fontSize: 16, fontWeight: 900, margin: 0 }}>
                {editReto.id ? '✏️ Editar reto' : '+ Nuevo reto'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: 'none', border: 'none',
                  color: C.muted, cursor: 'pointer', fontSize: 22,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Modo</label>
                <select
                  value={editReto.modo}
                  onChange={e => setEditReto({ ...editReto, modo: e.target.value })}
                  style={inputStyle}
                >
                  {MODOS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tipo</label>
                <select
                  value={editReto.tipo}
                  onChange={e => setEditReto({ ...editReto, tipo: e.target.value as 'Verdad' | 'Reto' })}
                  style={inputStyle}
                >
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Intensidad</label>
                <select
                  value={editReto.intensidad}
                  onChange={e => setEditReto({ ...editReto, intensidad: Number(e.target.value) })}
                  style={inputStyle}
                >
                  {INTENSIDADES.map(i => <option key={i} value={i}>{i} — {INTENSIDAD_LABELS[i]}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Timer (seg, 0 = sin timer)</label>
                <input
                  type="number" min={0} max={300}
                  value={editReto.timer}
                  onChange={e => setEditReto({ ...editReto, timer: Number(e.target.value) })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Texto del reto / verdad</label>
              <textarea
                value={editReto.texto}
                onChange={e => setEditReto({ ...editReto, texto: e.target.value })}
                rows={4}
                placeholder="Escribe aquí el reto o la verdad..."
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              />
              <p style={{ color: C.dimmed, fontSize: 11, marginTop: 4 }}>
                Usa {'{player}'} para el jugador actual y {'{target}'} para otro jugador aleatorio
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <input
                type="checkbox"
                id="activo-check"
                checked={editReto.activo}
                onChange={e => setEditReto({ ...editReto, activo: e.target.checked })}
                style={{ width: 16, height: 16, cursor: 'pointer', accentColor: C.pink }}
              />
              <label
                htmlFor="activo-check"
                style={{ color: C.muted, fontSize: 12, cursor: 'pointer', letterSpacing: '0.1em' }}
              >
                ACTIVO
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: 'none',
                  border: `1px solid ${C.borderLight}`,
                  borderRadius: 8, color: '#aaa',
                  padding: '10px 22px', cursor: 'pointer',
                  fontSize: 13, fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={saving}
                style={{
                  background: saving ? C.pinkDim : C.pink,
                  border: `1px solid ${saving ? C.pinkDim : C.pink}`,
                  borderRadius: 8, color: '#fff',
                  padding: '10px 26px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: 13, fontWeight: 900,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  boxShadow: saving ? 'none' : '0 0 16px rgba(233,30,140,0.3)',
                }}
              >
                {saving ? 'Guardando...' : editReto.id ? 'Actualizar' : 'Agregar reto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}