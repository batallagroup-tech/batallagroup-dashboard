/**
 * YaVoyAdmin.tsx — Panel de administración de Ya Voy!
 * 3 sub-módulos: Restaurantes, Menús, Repartidores
 * Datos en localStorage — sin Supabase por ahora
 */

import { useState, useEffect } from 'react';
import type { Theme } from '../App';

interface Props { onBack: () => void; theme: Theme; }

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Restaurant {
  id: string;
  name: string;
  category: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive' | 'pending';
  rating: number;
  orders: number;
  image: string;
}

interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: 'moto' | 'bici' | 'auto';
  status: 'active' | 'inactive' | 'delivering';
  orders: number;
  rating: number;
  zone: string;
}

// ─── Mock data inicial ────────────────────────────────────────────────────────

const INIT_RESTAURANTS: Restaurant[] = [
  { id: '1', name: 'Tacos El Güero', category: 'Tacos', phone: '797 123 4567', address: 'Centro, Zacatlán', status: 'active', rating: 4.8, orders: 234, image: '🌮' },
  { id: '2', name: 'Pizza Roma', category: 'Pizza', phone: '797 234 5678', address: 'Col. Roma, Zacatlán', status: 'active', rating: 4.5, orders: 189, image: '🍕' },
  { id: '3', name: 'Burger Bros', category: 'Hamburguesas', phone: '797 345 6789', address: 'Av. Hidalgo, Zacatlán', status: 'pending', rating: 0, orders: 0, image: '🍔' },
];

const INIT_MENU: MenuItem[] = [
  { id: '1', restaurantId: '1', name: 'Taco de Bistec', description: 'Con cebolla y cilantro', price: 25, category: 'Tacos', available: true },
  { id: '2', restaurantId: '1', name: 'Taco de Pollo', description: 'Pollo asado con guacamole', price: 22, category: 'Tacos', available: true },
  { id: '3', restaurantId: '1', name: 'Orden de 5 tacos', description: 'A elegir', price: 100, category: 'Combos', available: true },
  { id: '4', restaurantId: '2', name: 'Pizza Margarita', description: '8 rebanadas, queso y jitomate', price: 120, category: 'Pizzas', available: true },
  { id: '5', restaurantId: '2', name: 'Pizza Pepperoni', description: '8 rebanadas con pepperoni importado', price: 145, category: 'Pizzas', available: false },
];

const INIT_DRIVERS: Driver[] = [
  { id: '1', name: 'Carlos Méndez', phone: '797 111 2233', vehicle: 'moto', status: 'active', orders: 312, rating: 4.9, zone: 'Centro' },
  { id: '2', name: 'Luis Hernández', phone: '797 444 5566', vehicle: 'bici', status: 'delivering', orders: 89, rating: 4.6, zone: 'Col. Roma' },
  { id: '3', name: 'María Flores', phone: '797 777 8899', vehicle: 'moto', status: 'inactive', orders: 201, rating: 4.7, zone: 'Hidalgo' },
];

const CATEGORIES = ['Tacos', 'Pizza', 'Hamburguesas', 'Sushi', 'Pollo', 'Mariscos', 'Postres', 'Bebidas', 'Combos', 'Otro'];
const STATUS_COLORS: Record<string, string> = { active: '#22c55e', inactive: '#64748b', pending: '#f59e0b', delivering: '#3b82f6' };
const STATUS_LABELS: Record<string, string> = { active: 'Activo', inactive: 'Inactivo', pending: 'Pendiente', delivering: 'En entrega' };
const VEHICLE_ICONS: Record<string, string> = { moto: '🏍', bici: '🚲', auto: '🚗' };

export default function YaVoyAdmin({ onBack, theme }: Props) {
  const [tab, setTab] = useState<'restaurants' | 'menu' | 'drivers'>('restaurants');

  // State
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    try { return JSON.parse(localStorage.getItem('yv_restaurants') ?? '[]') || INIT_RESTAURANTS; } catch { return INIT_RESTAURANTS; }
  });
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('yv_menu') ?? '[]') || INIT_MENU; } catch { return INIT_MENU; }
  });
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    try { return JSON.parse(localStorage.getItem('yv_drivers') ?? '[]') || INIT_DRIVERS; } catch { return INIT_DRIVERS; }
  });

  useEffect(() => { localStorage.setItem('yv_restaurants', JSON.stringify(restaurants)); }, [restaurants]);
  useEffect(() => { localStorage.setItem('yv_menu', JSON.stringify(menuItems)); }, [menuItems]);
  useEffect(() => { localStorage.setItem('yv_drivers', JSON.stringify(drivers)); }, [drivers]);

  const [showForm, setShowForm] = useState(false);
  const [editingR, setEditingR] = useState<Restaurant | null>(null);
  const [editingD, setEditingD] = useState<Driver | null>(null);
  const [editingM, setEditingM] = useState<MenuItem | null>(null);
  const [selectedRest, setSelectedRest] = useState<string>(restaurants[0]?.id ?? '');

  const emptyR: Restaurant = { id: '', name: '', category: 'Tacos', phone: '', address: '', status: 'pending', rating: 0, orders: 0, image: '🍽' };
  const emptyD: Driver = { id: '', name: '', phone: '', vehicle: 'moto', status: 'active', orders: 0, rating: 5, zone: '' };
  const emptyM: MenuItem = { id: '', restaurantId: selectedRest, name: '', description: '', price: 0, category: 'Tacos', available: true };

  const [formR, setFormR] = useState<Restaurant>({ ...emptyR });
  const [formD, setFormD] = useState<Driver>({ ...emptyD });
  const [formM, setFormM] = useState<MenuItem>({ ...emptyM });

  const card = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: '18px 20px' };
  const inp = { background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, padding: '9px 13px', width: '100%', fontSize: 13, fontFamily: "'Inter', system-ui, sans-serif", outline: 'none', boxSizing: 'border-box' as const, marginBottom: 10 };
  const lbl = { color: theme.textDim, fontSize: 11, letterSpacing: '0.2em', display: 'block', marginBottom: 5, marginTop: 4 } as React.CSSProperties;
  const tag = (color: string) => ({ background: `${color}20`, border: `1px solid ${color}40`, borderRadius: 6, color, padding: '2px 8px', fontSize: 10, fontWeight: 700 as const, display: 'inline-block' });
  const row = { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 10, marginBottom: 8, flexWrap: 'wrap' as const };

  // KPIs
  const kpis = [
    { label: 'Restaurantes', value: restaurants.filter(r => r.status === 'active').length + ' activos', color: '#f97316', icon: '🏪' },
    { label: 'Repartidores', value: drivers.filter(d => d.status !== 'inactive').length + ' disponibles', color: '#3b82f6', icon: '🏍' },
    { label: 'Platillos', value: menuItems.filter(m => m.available).length + ' disponibles', color: '#22c55e', icon: '🍽' },
    { label: 'En entrega', value: drivers.filter(d => d.status === 'delivering').length + ' activos', color: '#e91e8c', icon: '📦' },
  ];

  // ── Restaurants ──────────────────────────────────────────────────────────────

  const saveR = () => {
    if (!formR.name) return;
    if (editingR) setRestaurants(p => p.map(r => r.id === editingR.id ? { ...formR, id: editingR.id } : r));
    else setRestaurants(p => [{ ...formR, id: Date.now().toString() }, ...p]);
    setShowForm(false); setEditingR(null); setFormR({ ...emptyR });
  };

  // ── Menu ─────────────────────────────────────────────────────────────────────

  const saveM = () => {
    if (!formM.name) return;
    if (editingM) setMenuItems(p => p.map(m => m.id === editingM.id ? { ...formM, id: editingM.id } : m));
    else setMenuItems(p => [{ ...formM, id: Date.now().toString(), restaurantId: selectedRest }, ...p]);
    setShowForm(false); setEditingM(null); setFormM({ ...emptyM });
  };

  // ── Drivers ──────────────────────────────────────────────────────────────────

  const saveD = () => {
    if (!formD.name) return;
    if (editingD) setDrivers(p => p.map(d => d.id === editingD.id ? { ...formD, id: editingD.id } : d));
    else setDrivers(p => [{ ...formD, id: Date.now().toString() }, ...p]);
    setShowForm(false); setEditingD(null); setFormD({ ...emptyD });
  };

  const TABS = [
    { id: 'restaurants' as const, label: '🏪 Restaurantes', count: restaurants.length },
    { id: 'menu' as const, label: '🍽 Menús', count: menuItems.length },
    { id: 'drivers' as const, label: '🏍 Repartidores', count: drivers.length },
  ];

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: "'Inter', system-ui, sans-serif", color: theme.text }}>
      {/* Header */}
      <div style={{ background: theme.bg2, borderBottom: `1px solid ${theme.border}`, padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky' as const, top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={onBack} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textMuted, padding: '6px 14px', cursor: 'pointer', fontSize: 12 }}>← Volver</button>
          <div>
            <h1 style={{ color: theme.text, fontSize: 17, fontWeight: 900, margin: 0 }}>🛵 Ya Voy! — Admin</h1>
            <p style={{ color: theme.textDim, fontSize: 10, margin: '2px 0 0', letterSpacing: '0.2em' }}>GESTIÓN DE PLATAFORMA · LOCAL STORAGE</p>
          </div>
        </div>
        <span style={{ background: '#f59e0b20', border: '1px solid #f59e0b40', borderRadius: 8, padding: '4px 12px', color: '#f59e0b', fontSize: 10, fontWeight: 700 }}>DEV — Sin Supabase</span>
      </div>

      <div style={{ padding: '20px 28px', maxWidth: 1300, margin: '0 auto' }}>
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
          {kpis.map(k => (
            <div key={k.label} style={{ ...card, borderLeft: `3px solid ${k.color}` }}>
              <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.2em', margin: '0 0 6px' }}>{k.icon} {k.label.toUpperCase()}</p>
              <p style={{ color: theme.text, fontSize: 22, fontWeight: 900, margin: 0 }}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setShowForm(false); }}
              style={{ background: tab === t.id ? '#f9731620' : theme.surface, border: `1px solid ${tab === t.id ? '#f9731640' : theme.border}`, borderRadius: 8, color: tab === t.id ? '#f97316' : theme.textMuted, padding: '8px 18px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
              {t.label} <span style={{ opacity: 0.6, fontSize: 10 }}>({t.count})</span>
            </button>
          ))}
          <button onClick={() => {
            setShowForm(true);
            if (tab === 'restaurants') { setEditingR(null); setFormR({ ...emptyR }); }
            if (tab === 'drivers') { setEditingD(null); setFormD({ ...emptyD }); }
            if (tab === 'menu') { setEditingM(null); setFormM({ ...emptyM, restaurantId: selectedRest }); }
          }} style={{ marginLeft: 'auto', background: '#22c55e20', border: '1px solid #22c55e40', borderRadius: 8, color: '#22c55e', padding: '8px 18px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            + Agregar
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: showForm ? '1fr 360px' : '1fr', gap: 16 }}>
          {/* ── RESTAURANTS ── */}
          {tab === 'restaurants' && (
            <div>
              {restaurants.map(r => (
                <div key={r.id} style={row}>
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{r.image}</span>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' as const }}>
                      <span style={{ color: theme.text, fontSize: 14, fontWeight: 700 }}>{r.name}</span>
                      <span style={tag(STATUS_COLORS[r.status])}>{STATUS_LABELS[r.status]}</span>
                      <span style={tag('#f97316')}>{r.category}</span>
                    </div>
                    <p style={{ color: theme.textMuted, fontSize: 11, margin: '0 0 2px' }}>📞 {r.phone} · 📍 {r.address}</p>
                    <p style={{ color: theme.textDim, fontSize: 11, margin: 0 }}>⭐ {r.rating || '—'} · 📦 {r.orders} pedidos</p>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => setRestaurants(p => p.map(x => x.id === r.id ? { ...x, status: x.status === 'active' ? 'inactive' : 'active' } : x))}
                      style={{ background: r.status === 'active' ? '#64748b20' : '#22c55e20', border: `1px solid ${r.status === 'active' ? '#64748b40' : '#22c55e40'}`, borderRadius: 7, color: r.status === 'active' ? '#64748b' : '#22c55e', padding: '5px 10px', cursor: 'pointer', fontSize: 11 }}>
                      {r.status === 'active' ? 'Desactivar' : 'Activar'}
                    </button>
                    <button onClick={() => { setEditingR(r); setFormR({ ...r }); setShowForm(true); }} style={{ background: '#3b82f615', border: '1px solid #3b82f630', borderRadius: 7, color: '#3b82f6', padding: '5px 10px', cursor: 'pointer', fontSize: 11 }}>✏</button>
                    <button onClick={() => { if (confirm('¿Eliminar?')) setRestaurants(p => p.filter(x => x.id !== r.id)); }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, color: '#ef4444', padding: '5px 10px', cursor: 'pointer', fontSize: 11 }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── MENU ── */}
          {tab === 'menu' && (
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' as const }}>
                {restaurants.map(r => (
                  <button key={r.id} onClick={() => setSelectedRest(r.id)}
                    style={{ background: selectedRest === r.id ? '#f9731620' : theme.surface, border: `1px solid ${selectedRest === r.id ? '#f9731640' : theme.border}`, borderRadius: 8, color: selectedRest === r.id ? '#f97316' : theme.textMuted, padding: '6px 14px', cursor: 'pointer', fontSize: 12 }}>
                    {r.image} {r.name}
                  </button>
                ))}
              </div>
              {menuItems.filter(m => m.restaurantId === selectedRest).map(m => (
                <div key={m.id} style={{ ...row, borderLeft: `3px solid ${m.available ? '#22c55e' : '#64748b'}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' as const }}>
                      <span style={{ color: theme.text, fontSize: 13, fontWeight: 700 }}>{m.name}</span>
                      <span style={tag(m.available ? '#22c55e' : '#64748b')}>{m.available ? 'Disponible' : 'No disponible'}</span>
                      <span style={tag('#8b5cf6')}>{m.category}</span>
                    </div>
                    <p style={{ color: theme.textMuted, fontSize: 11, margin: '0 0 2px' }}>{m.description}</p>
                    <p style={{ color: '#22c55e', fontSize: 14, fontWeight: 900, margin: 0 }}>${m.price}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => setMenuItems(p => p.map(x => x.id === m.id ? { ...x, available: !x.available } : x))}
                      style={{ background: m.available ? '#64748b20' : '#22c55e20', border: `1px solid ${m.available ? '#64748b40' : '#22c55e40'}`, borderRadius: 7, color: m.available ? '#64748b' : '#22c55e', padding: '5px 10px', cursor: 'pointer', fontSize: 11 }}>
                      {m.available ? 'Ocultar' : 'Mostrar'}
                    </button>
                    <button onClick={() => { setEditingM(m); setFormM({ ...m }); setShowForm(true); }} style={{ background: '#3b82f615', border: '1px solid #3b82f630', borderRadius: 7, color: '#3b82f6', padding: '5px 10px', cursor: 'pointer', fontSize: 11 }}>✏</button>
                    <button onClick={() => { if (confirm('¿Eliminar platillo?')) setMenuItems(p => p.filter(x => x.id !== m.id)); }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, color: '#ef4444', padding: '5px 10px', cursor: 'pointer', fontSize: 11 }}>🗑</button>
                  </div>
                </div>
              ))}
              {menuItems.filter(m => m.restaurantId === selectedRest).length === 0 && (
                <p style={{ color: theme.textDim, textAlign: 'center', padding: '40px 0' }}>Sin platillos para este restaurante</p>
              )}
            </div>
          )}

          {/* ── DRIVERS ── */}
          {tab === 'drivers' && (
            <div>
              {drivers.map(d => (
                <div key={d.id} style={row}>
                  <span style={{ fontSize: 26, flexShrink: 0 }}>{VEHICLE_ICONS[d.vehicle]}</span>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' as const }}>
                      <span style={{ color: theme.text, fontSize: 14, fontWeight: 700 }}>{d.name}</span>
                      <span style={tag(STATUS_COLORS[d.status])}>{STATUS_LABELS[d.status]}</span>
                      <span style={tag('#8b5cf6')}>{d.zone}</span>
                    </div>
                    <p style={{ color: theme.textMuted, fontSize: 11, margin: '0 0 2px' }}>📞 {d.phone}</p>
                    <p style={{ color: theme.textDim, fontSize: 11, margin: 0 }}>⭐ {d.rating} · 📦 {d.orders} entregas</p>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => setDrivers(p => p.map(x => x.id === d.id ? { ...x, status: x.status === 'active' ? 'inactive' : 'active' } : x))}
                      style={{ background: d.status === 'active' ? '#64748b20' : '#22c55e20', border: `1px solid ${d.status === 'active' ? '#64748b40' : '#22c55e40'}`, borderRadius: 7, color: d.status === 'active' ? '#64748b' : '#22c55e', padding: '5px 10px', cursor: 'pointer', fontSize: 11 }}>
                      {d.status !== 'inactive' ? 'Desactivar' : 'Activar'}
                    </button>
                    <button onClick={() => { setEditingD(d); setFormD({ ...d }); setShowForm(true); }} style={{ background: '#3b82f615', border: '1px solid #3b82f630', borderRadius: 7, color: '#3b82f6', padding: '5px 10px', cursor: 'pointer', fontSize: 11 }}>✏</button>
                    <button onClick={() => { if (confirm('¿Eliminar repartidor?')) setDrivers(p => p.filter(x => x.id !== d.id)); }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, color: '#ef4444', padding: '5px 10px', cursor: 'pointer', fontSize: 11 }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── FORM PANEL ── */}
          {showForm && (
            <div style={{ ...card, alignSelf: 'flex-start', position: 'sticky' as const, top: 80 }}>
              {tab === 'restaurants' && (
                <>
                  <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.3em', margin: '0 0 14px' }}>━━ {editingR ? 'EDITAR' : 'NUEVO'} RESTAURANTE</p>
                  <label style={lbl}>NOMBRE</label><input style={inp} value={formR.name} onChange={e => setFormR({ ...formR, name: e.target.value })} placeholder="Nombre del restaurante" />
                  <label style={lbl}>EMOJI / IMAGEN</label><input style={inp} value={formR.image} onChange={e => setFormR({ ...formR, image: e.target.value })} placeholder="🍔" />
                  <label style={lbl}>CATEGORÍA</label>
                  <select style={inp} value={formR.category} onChange={e => setFormR({ ...formR, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <label style={lbl}>TELÉFONO</label><input style={inp} value={formR.phone} onChange={e => setFormR({ ...formR, phone: e.target.value })} placeholder="797 123 4567" />
                  <label style={lbl}>DIRECCIÓN</label><input style={inp} value={formR.address} onChange={e => setFormR({ ...formR, address: e.target.value })} placeholder="Calle, Colonia, Ciudad" />
                  <label style={lbl}>ESTADO</label>
                  <select style={inp} value={formR.status} onChange={e => setFormR({ ...formR, status: e.target.value as Restaurant['status'] })}>
                    <option value="pending">Pendiente</option>
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={saveR} style={{ background: '#f9731620', border: '1px solid #f9731640', borderRadius: 8, color: '#f97316', padding: '10px 0', cursor: 'pointer', fontWeight: 700, flex: 1 }}>✓ Guardar</button>
                    <button onClick={() => { setShowForm(false); setEditingR(null); }} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textMuted, padding: '10px 14px', cursor: 'pointer' }}>✕</button>
                  </div>
                </>
              )}

              {tab === 'menu' && (
                <>
                  <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.3em', margin: '0 0 14px' }}>━━ {editingM ? 'EDITAR' : 'NUEVO'} PLATILLO</p>
                  <label style={lbl}>RESTAURANTE</label>
                  <select style={inp} value={formM.restaurantId} onChange={e => setFormM({ ...formM, restaurantId: e.target.value })}>
                    {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                  <label style={lbl}>NOMBRE</label><input style={inp} value={formM.name} onChange={e => setFormM({ ...formM, name: e.target.value })} placeholder="Nombre del platillo" />
                  <label style={lbl}>DESCRIPCIÓN</label><textarea style={{ ...inp, minHeight: 60, resize: 'vertical' as const }} value={formM.description} onChange={e => setFormM({ ...formM, description: e.target.value })} placeholder="Descripción breve…" />
                  <label style={lbl}>PRECIO ($)</label><input style={inp} type="number" value={formM.price} onChange={e => setFormM({ ...formM, price: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                  <label style={lbl}>CATEGORÍA</label>
                  <select style={inp} value={formM.category} onChange={e => setFormM({ ...formM, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: theme.textMuted, fontSize: 12, marginBottom: 14 }}>
                    <input type="checkbox" checked={formM.available} onChange={e => setFormM({ ...formM, available: e.target.checked })} />
                    Disponible para pedidos
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={saveM} style={{ background: '#22c55e20', border: '1px solid #22c55e40', borderRadius: 8, color: '#22c55e', padding: '10px 0', cursor: 'pointer', fontWeight: 700, flex: 1 }}>✓ Guardar</button>
                    <button onClick={() => { setShowForm(false); setEditingM(null); }} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textMuted, padding: '10px 14px', cursor: 'pointer' }}>✕</button>
                  </div>
                </>
              )}

              {tab === 'drivers' && (
                <>
                  <p style={{ color: theme.textDim, fontSize: 10, letterSpacing: '0.3em', margin: '0 0 14px' }}>━━ {editingD ? 'EDITAR' : 'NUEVO'} REPARTIDOR</p>
                  <label style={lbl}>NOMBRE</label><input style={inp} value={formD.name} onChange={e => setFormD({ ...formD, name: e.target.value })} placeholder="Nombre completo" />
                  <label style={lbl}>TELÉFONO</label><input style={inp} value={formD.phone} onChange={e => setFormD({ ...formD, phone: e.target.value })} placeholder="797 123 4567" />
                  <label style={lbl}>VEHÍCULO</label>
                  <select style={inp} value={formD.vehicle} onChange={e => setFormD({ ...formD, vehicle: e.target.value as Driver['vehicle'] })}>
                    <option value="moto">🏍 Motocicleta</option>
                    <option value="bici">🚲 Bicicleta</option>
                    <option value="auto">🚗 Automóvil</option>
                  </select>
                  <label style={lbl}>ZONA</label><input style={inp} value={formD.zone} onChange={e => setFormD({ ...formD, zone: e.target.value })} placeholder="Zona de cobertura" />
                  <label style={lbl}>ESTADO</label>
                  <select style={inp} value={formD.status} onChange={e => setFormD({ ...formD, status: e.target.value as Driver['status'] })}>
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={saveD} style={{ background: '#3b82f620', border: '1px solid #3b82f640', borderRadius: 8, color: '#3b82f6', padding: '10px 0', cursor: 'pointer', fontWeight: 700, flex: 1 }}>✓ Guardar</button>
                    <button onClick={() => { setShowForm(false); setEditingD(null); }} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textMuted, padding: '10px 14px', cursor: 'pointer' }}>✕</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
