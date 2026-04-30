// pages/MyOrders.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

export default function MyOrders() {
  const [pedidos,  setPedidos]  = useState([]);
  const [selected, setSelected] = useState(null);
  const [detalle,  setDetalle]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    apiClient.get('/ventas/mis-pedidos')
      .then(r => setPedidos(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const verDetalle = async (id_pedido) => {
    if (selected === id_pedido) { setSelected(null); setDetalle([]); return; }
    try {
      const r = await apiClient.get(`/ventas/detalle/${id_pedido}`);
      setDetalle(r.data);
      setSelected(id_pedido);
    } catch {}
  };

  const badge = (estado) => {
    const map = { PENDIENTE:['#fffbeb','#92400e','#fbbf24'], ENVIADO:['#eff6ff','#1e40af','#93c5fd'], ENTREGADO:['#f0fdf4','#166534','#86efac'] };
    const [bg, text, border] = map[estado] || ['#f5f5f5','#555','#ddd'];
    return <span style={{ background:bg, color:text, border:`1px solid ${border}`, padding:'4px 12px', borderRadius:20, fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.5px' }}>{estado}</span>;
  };

  if (loading) return <div className="loading-page"><div className="spinner"/><p>Cargando pedidos...</p></div>;

  return (
    <div style={{ maxWidth:900, margin:'0 auto', padding:'60px 5%' }} className="fade-in">
      <h1 style={{ fontSize:'2rem', fontWeight:900, color:'#111', marginBottom:8 }}>Mis Pedidos</h1>
      <p  style={{ color:'#aaa', fontSize:'0.85rem', marginBottom:40 }}>Historial de tus compras</p>

      {pedidos.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 20px' }}>
          <p style={{ fontSize:'4rem' }}>📦</p>
          <h2 style={{ color:'#111', marginTop:20 }}>Aún no tienes pedidos</h2>
          <p  style={{ color:'#aaa', marginTop:10 }}>Cuando realices una compra aparecerá aquí.</p>
          <Link to="/catalogo" style={{ display:'inline-block', marginTop:28, background:'#111', color:'#B8860B', padding:'12px 28px', borderRadius:8, fontWeight:700, textDecoration:'none' }}>
            EXPLORAR CATÁLOGO
          </Link>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {pedidos.map(p => (
            <div key={p.id_pedido} style={{ background:'#fff', borderRadius:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', overflow:'hidden' }}>
              <div style={{ padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                <div>
                  <span style={{ fontSize:'0.72rem', color:'#aaa', letterSpacing:'1px' }}>PEDIDO</span>
                  <h3 style={{ fontWeight:900, color:'#111', fontSize:'1.05rem' }}>#{p.id_pedido}</h3>
                </div>
                <div style={{ textAlign:'center' }}>
                  <span style={{ fontSize:'0.72rem', color:'#aaa', display:'block', letterSpacing:'1px' }}>FECHA</span>
                  <span style={{ fontSize:'0.88rem', fontWeight:600, color:'#555' }}>
                    {new Date(p.fecha_pedido).toLocaleDateString('es-PE', { day:'2-digit', month:'short', year:'numeric' })}
                  </span>
                </div>
                <div style={{ textAlign:'center' }}>
                  <span style={{ fontSize:'0.72rem', color:'#aaa', display:'block', letterSpacing:'1px' }}>ESTADO</span>
                  {badge(p.estado || 'PENDIENTE')}
                </div>
                <div style={{ textAlign:'right' }}>
                  <span style={{ fontSize:'0.72rem', color:'#aaa', display:'block', letterSpacing:'1px' }}>TOTAL</span>
                  <span style={{ fontWeight:900, color:'#B8860B', fontSize:'1.2rem' }}>S/ {parseFloat(p.total).toFixed(2)}</span>
                </div>
                <button onClick={() => verDetalle(p.id_pedido)}
                  style={{ background: selected===p.id_pedido ? '#111':'#f5f5f5', color: selected===p.id_pedido ? '#B8860B':'#555', border:'none', borderRadius:8, padding:'9px 20px', cursor:'pointer', fontWeight:700, fontSize:'0.8rem', letterSpacing:'0.5px' }}>
                  {selected === p.id_pedido ? 'OCULTAR' : 'VER DETALLE'}
                </button>
              </div>

              {/* DETALLE */}
              {selected === p.id_pedido && (
                <div style={{ borderTop:'1px solid #f0f0f0', padding:'20px 24px', background:'#fafafa' }}>
                  {detalle.map(d => (
                    <div key={d.id_detalle} style={{ display:'flex', alignItems:'center', gap:16, padding:'10px 0', borderBottom:'1px solid #eee' }}>
                      <div style={{ width:50, height:50, borderRadius:8, overflow:'hidden', background:'#eee', flexShrink:0 }}>
                        <img src={`http://localhost:5000${d.imagen_url}`} alt={d.nombre_producto}
                          style={{ width:'100%', height:'100%', objectFit:'cover' }}
                          onError={e => { e.target.style.display='none'; }}/>
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontWeight:700, fontSize:'0.9rem', color:'#111' }}>{d.nombre_producto}</p>
                        <p style={{ fontSize:'0.8rem', color:'#aaa' }}>× {d.cantidad} unidades</p>
                      </div>
                      <span style={{ fontWeight:700, color:'#B8860B' }}>
                        S/ {(parseFloat(d.precio_unitario) * d.cantidad).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
