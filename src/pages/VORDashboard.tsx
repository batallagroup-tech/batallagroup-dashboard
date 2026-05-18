import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

// ── Tipos ────────────────────────────────────────────────────────────────────
interface Reto {
  id?: string;
  modo: string;
  tipo: 'verdad' | 'reto';
  texto: string;
  intensidad: number;
  timer: number;
  activo: boolean;
}

interface Castigo {
  id?: string;
  modo: string;
  intensidad: number;
  texto: string;
  activo: boolean;
}

// ── Constantes ───────────────────────────────────────────────────────────────
const MODOS = [
  'Beberaje','Pareja','Casual','Extremo','Familiar',
  'Niños','Inocente','Fiesta','Escuela','Profundo','Colegas','Picante','Sexo Casual'
];
const MODOS_CASTIGO = [
  'beberaje','parejas','casual','extremo','familiar',
  'ninos','inocente','fiesta','escuela','profundo','colegas','picante'
];
const INTENSIDADES = [1,2,3,4,5];
const INTENSIDAD_LABELS: Record<number,string> = {1:'Suave',2:'Medio',3:'Alto',4:'Intenso',5:'Extremo'};
const PAGE_SIZE = 25;

const EMPTY_RETO: Reto = { modo:'Familiar', tipo:'reto', texto:'', intensidad:3, timer:0, activo:true };
const EMPTY_CASTIGO: Castigo = { modo:'familiar', intensidad:3, texto:'', activo:true };

// ── Estilos base ─────────────────────────────────────────────────────────────
const C = {
  pink: '#e91e8c', bg: '#080808', surface: '#111', surface2: '#1a1a1a',
  border: '#2a2a2a', borderLight: '#333', text: '#fff', muted: '#888', dimmed: '#555',
};
const inputSt: React.CSSProperties = {
  width:'100%', padding:'10px 12px', background:C.surface2,
  border:`1px solid ${C.border}`, borderRadius:8, color:C.text,
  fontSize:13, fontFamily:"'Courier New',monospace",
};
const labelSt: React.CSSProperties = {
  color:C.muted, fontSize:10, letterSpacing:'0.2em',
  display:'block', marginBottom:6, textTransform:'uppercase',
};
const btnPrimary = (disabled=false): React.CSSProperties => ({
  background: disabled ? '#aa1570' : C.pink, border:'none', borderRadius:8,
  color:'#fff', padding:'10px 24px', cursor: disabled ? 'not-allowed':'pointer',
  fontSize:13, fontWeight:900, fontFamily:"'Courier New',monospace",
});
const btnSecondary: React.CSSProperties = {
  background:'none', border:`1px solid ${C.borderLight}`, borderRadius:8,
  color:'#aaa', padding:'10px 20px', cursor:'pointer', fontSize:13,
  fontFamily:"'Courier New',monospace",
};

// ── Componente principal ─────────────────────────────────────────────────────
interface Props { onBack: () => void; }

type Tab = 'verdades' | 'retos' | 'castigos';

export default function VORDashboard({ onBack }: Props) {
  const [tab, setTab] = useState<Tab>('retos');
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterModo, setFilterModo] = useState('');
  const [filterIntensidad, setFilterIntensidad] = useState(0);
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const tableName = tab === 'castigos' ? 'castigos' : 'retos';
  const tipoFilter = tab === 'verdades' ? 'verdad' : tab === 'retos' ? 'reto' : null;

  const fetch = async () => {
    setLoading(true);
    let q = supabase.from(tableName).select('*', { count:'exact' });
    if (tipoFilter) q = q.eq('tipo', tipoFilter);
    if (filterModo) q = q.eq('modo', filterModo);
    if (filterIntensidad) q = q.eq('intensidad', filterIntensidad);
    if (search) q = q.ilike('texto', `%${search}%`);
    q = q.order('modo').order('intensidad').range(page * PAGE_SIZE, (page+1)*PAGE_SIZE-1);
    const { data, count, error } = await q;
    if (error) showToast('❌ Error: ' + error.message);
    setItems(data || []);
    setTotal(count || 0);
    setLoading(false);
  };

  useEffect(() => { setPage(0); }, [tab, filterModo, filterIntensidad, search]);
  useEffect(() => { fetch(); }, [tab, filterModo, filterIntensidad, page, search]);

  const openNew = () => {
    setEditItem(tab === 'castigos' ? { ...EMPTY_CASTIGO } : { ...EMPTY_RETO, tipo: tipoFilter as 'verdad'|'reto' });
    setShowForm(true);
  };

  const save = async () => {
    if (!editItem?.texto?.trim()) { showToast('❌ El texto no puede estar vacío'); return; }
    setSaving(true);
    const { id, ...payload } = editItem;
    if (id) {
      const { error } = await supabase.from(tableName).update(payload).eq('id', id);
      if (error) { showToast('❌ ' + error.message); setSaving(false); return; }
      showToast('✅ Actualizado correctamente');
    } else {
      const { error } = await supabase.from(tableName).insert(payload);
      if (error) { showToast('❌ ' + error.message); setSaving(false); return; }
      showToast('✅ Agregado correctamente');
    }
    setSaving(false); setShowForm(false); setEditItem(null); fetch();
  };

  const toggleActivo = async (item: any) => {
    await supabase.from(tableName).update({ activo: !item.activo }).eq('id', item.id);
    showToast(item.activo ? '⏸ Desactivado' : '▶️ Activado');
    fetch();
  };

  const del = async (id: string) => {
    if (!confirm('¿Eliminar permanentemente?')) return;
    await supabase.from(tableName).delete().eq('id', id);
    showToast('🗑️ Eliminado');
    fetch();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const modosList = tab === 'castigos' ? MODOS_CASTIGO : MODOS;

  const tabColor: Record<Tab,string> = { verdades:'#818cf8', retos: C.pink, castigos:'#f59e0b' };
  const tabCount: Record<Tab,string> = { verdades:'~1,100', retos:'~1,100', castigos:'60' };

  return (
    <div style={{ minHeight:'100vh', width:'100%', background:C.bg, fontFamily:"'Courier New',monospace" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:20, right:20, background:C.surface, border:`1px solid ${C.borderLight}`, borderRadius:10, padding:'12px 20px', color:C.text, fontSize:13, zIndex:9999, boxShadow:'0 4px 20px rgba(0,0,0,0.5)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:'16px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <button onClick={onBack} style={{ background:'none', border:`1px solid ${C.borderLight}`, borderRadius:8, color:'#aaa', padding:'8px 14px', cursor:'pointer', fontSize:12, fontFamily:"'Courier New',monospace" }}>← Volver</button>
          <div>
            <h1 style={{ color:C.text, fontSize:18, fontWeight:900, margin:0 }}>🎮 VOR — Verdad o Reto</h1>
            <p style={{ color:C.dimmed, fontSize:11, margin:'2px 0 0', letterSpacing:'0.15em' }}>{total.toLocaleString()} REGISTROS VISIBLES</p>
          </div>
        </div>
        <button onClick={openNew} style={btnPrimary()}>+ Agregar</button>
      </div>

      {/* Tabs */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:'0 24px', display:'flex', gap:0 }}>
        {(['verdades','retos','castigos'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setFilterModo(''); setFilterIntensidad(0); setSearch(''); }}
            style={{
              background:'none', border:'none', borderBottom: tab===t ? `2px solid ${tabColor[t]}` : '2px solid transparent',
              color: tab===t ? tabColor[t] : C.dimmed, padding:'14px 20px', cursor:'pointer',
              fontSize:13, fontWeight: tab===t ? 900 : 400, fontFamily:"'Courier New',monospace",
              textTransform:'capitalize', transition:'color 0.2s',
            }}
          >
            {t} <span style={{ fontSize:10, color: tab===t ? tabColor[t] : '#333', marginLeft:6 }}>({tabCount[t]})</span>
          </button>
        ))}
      </div>

      <div style={{ padding:'20px 24px' }}>
        {/* Filtros + Búsqueda */}
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:12, marginBottom:16 }}>
          <div>
            <label style={labelSt}>Buscar texto</label>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar en el texto..."
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Modo</label>
            <select value={filterModo} onChange={e => setFilterModo(e.target.value)} style={inputSt}>
              <option value="">Todos</option>
              {modosList.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={labelSt}>Intensidad</label>
            <select value={filterIntensidad} onChange={e => setFilterIntensidad(Number(e.target.value))} style={inputSt}>
              <option value={0}>Todas</option>
              {INTENSIDADES.map(i => <option key={i} value={i}>{i} — {INTENSIDAD_LABELS[i]}</option>)}
            </select>
          </div>
        </div>

        {/* Lista */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden', marginBottom:16 }}>
          {loading ? (
            <div style={{ padding:'3rem', textAlign:'center', color:C.dimmed }}>Cargando...</div>
          ) : items.length === 0 ? (
            <div style={{ padding:'3rem', textAlign:'center', color:C.dimmed }}>Sin resultados</div>
          ) : items.map((item, i) => (
            <div key={item.id} style={{ padding:'12px 16px', borderBottom: i<items.length-1?`1px solid ${C.border}`:'none', display:'flex', alignItems:'flex-start', gap:12 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', gap:6, marginBottom:5, flexWrap:'wrap' }}>
                  <span style={{ background: item.tipo==='verdad'?'#1a1040': item.tipo==='reto'?'#1a0010':'#1a1000', color: item.tipo==='verdad'?'#818cf8': item.tipo==='reto'?C.pink:'#f59e0b', fontSize:10, padding:'3px 8px', borderRadius:6, fontWeight:700, textTransform:'uppercase' }}>
                    {item.tipo ?? 'castigo'}
                  </span>
                  <span style={{ background:C.surface2, color:C.muted, fontSize:10, padding:'3px 8px', borderRadius:6 }}>{item.modo}</span>
                  <span style={{ background:C.surface2, color:C.muted, fontSize:10, padding:'3px 8px', borderRadius:6 }}>Intensidad {item.intensidad} — {INTENSIDAD_LABELS[item.intensidad]}</span>
                  {item.timer>0 && <span style={{ background:C.surface2, color:C.muted, fontSize:10, padding:'3px 8px', borderRadius:6 }}>⏱ {item.timer}s</span>}
                  {!item.activo && <span style={{ background:'#1a0a0a', color:'#ef4444', fontSize:10, padding:'3px 8px', borderRadius:6 }}>INACTIVO</span>}
                </div>
                <p style={{ color: item.activo?'#ccc':'#444', fontSize:13, margin:0, lineHeight:1.6, wordBreak:'break-word' }}>{item.texto}</p>
              </div>
              <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                <button onClick={() => { setEditItem({...item}); setShowForm(true); }} style={{ background:C.surface2, border:`1px solid ${C.borderLight}`, borderRadius:6, color:'#ccc', padding:'6px 10px', cursor:'pointer', fontSize:11 }}>✏️</button>
                <button onClick={() => toggleActivo(item)} style={{ background:C.surface2, border:`1px solid ${C.borderLight}`, borderRadius:6, color:'#ccc', padding:'6px 10px', cursor:'pointer', fontSize:11 }}>{item.activo?'⏸':'▶️'}</button>
                <button onClick={() => del(item.id)} style={{ background:'#1a0a0a', border:'1px solid #3a1515', borderRadius:6, color:'#ef4444', padding:'6px 10px', cursor:'pointer', fontSize:11 }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>

        {/* Paginación */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ color:C.muted, fontSize:12 }}>
            {total>0 ? `${page*PAGE_SIZE+1}–${Math.min((page+1)*PAGE_SIZE,total)} de ${total.toLocaleString()}` : '0 resultados'}
          </span>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <button onClick={() => setPage(p=>Math.max(0,p-1))} disabled={page===0}
              style={{ background:C.surface, border:`1px solid ${C.borderLight}`, borderRadius:8, color:page===0?C.dimmed:'#ccc', padding:'8px 16px', cursor:page===0?'not-allowed':'pointer', fontSize:12, fontFamily:"'Courier New',monospace", opacity:page===0?0.5:1 }}>
              ← Anterior
            </button>
            <span style={{ color:C.muted, fontSize:12 }}>{page+1} / {totalPages||1}</span>
            <button onClick={() => setPage(p=>p+1)} disabled={(page+1)*PAGE_SIZE>=total}
              style={{ background:C.surface, border:`1px solid ${C.borderLight}`, borderRadius:8, color:(page+1)*PAGE_SIZE>=total?C.dimmed:'#ccc', padding:'8px 16px', cursor:(page+1)*PAGE_SIZE>=total?'not-allowed':'pointer', fontSize:12, fontFamily:"'Courier New',monospace", opacity:(page+1)*PAGE_SIZE>=total?0.5:1 }}>
              Siguiente →
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showForm && editItem && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.9)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', zIndex:1000 }}>
          <div style={{ background:C.surface, border:`1px solid ${C.borderLight}`, borderRadius:16, padding:'2rem', width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h2 style={{ color:C.text, fontSize:16, fontWeight:900, margin:0 }}>
                {editItem.id ? '✏️ Editar' : '+ Nuevo'} {tab === 'castigos' ? 'castigo' : tab === 'verdades' ? 'verdad' : 'reto'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:22 }}>×</button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <div>
                <label style={labelSt}>Modo</label>
                <select value={editItem.modo} onChange={e => setEditItem({...editItem, modo:e.target.value})} style={inputSt}>
                  {modosList.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={labelSt}>Intensidad</label>
                <select value={editItem.intensidad} onChange={e => setEditItem({...editItem, intensidad:Number(e.target.value)})} style={inputSt}>
                  {INTENSIDADES.map(i => <option key={i} value={i}>{i} — {INTENSIDAD_LABELS[i]}</option>)}
                </select>
              </div>
            </div>

            {tab !== 'castigos' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                <div>
                  <label style={labelSt}>Tipo</label>
                  <select value={editItem.tipo} onChange={e => setEditItem({...editItem, tipo:e.target.value})} style={inputSt}>
                    <option value="verdad">Verdad</option>
                    <option value="reto">Reto</option>
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Timer (segundos)</label>
                  <input type="number" min={0} max={300} value={editItem.timer} onChange={e => setEditItem({...editItem, timer:Number(e.target.value)})} style={inputSt} />
                </div>
              </div>
            )}

            <div style={{ marginBottom:16 }}>
              <label style={labelSt}>Texto</label>
              <textarea
                value={editItem.texto}
                onChange={e => setEditItem({...editItem, texto:e.target.value})}
                rows={4}
                placeholder={tab==='castigos' ? 'Escribe el castigo...' : tab==='verdades' ? 'Escribe la pregunta de verdad...' : 'Escribe el reto...'}
                style={{ ...inputSt, resize:'vertical', lineHeight:1.6 }}
              />
              {tab !== 'castigos' && (
                <p style={{ color:C.dimmed, fontSize:11, marginTop:4 }}>
                  Usa {'{player}'} para el jugador actual, {'{target}'} para otro jugador aleatorio
                </p>
              )}
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
              <input type="checkbox" checked={editItem.activo} onChange={e => setEditItem({...editItem, activo:e.target.checked})} style={{ width:16, height:16, cursor:'pointer', accentColor:C.pink }} />
              <label style={{ ...labelSt, margin:0, cursor:'pointer' }}>Activo (visible en la app)</label>
            </div>

            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={btnSecondary}>Cancelar</button>
              <button onClick={save} disabled={saving} style={btnPrimary(saving)}>
                {saving ? 'Guardando...' : editItem.id ? 'Actualizar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
