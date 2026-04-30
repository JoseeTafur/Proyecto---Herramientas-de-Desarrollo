// pages/Cart.jsx
import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';

export default function Cart() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [msg, setMsg]         = useState({ text:'', type:'' });
  const { user }              = useContext(AuthContext);
  const navigate              = useNavigate();

  useEffect(() => {
    apiClient.get('/carrito')
      .then(r => { setItems(r.data); localStorage.setItem('cart', JSON.stringify(r.data)); window.dispatchEvent(new Event('cartUpdated')); })
      .catch(() => { const local = JSON.parse(localStorage.getItem('cart')) || []; setItems(local); })
      .finally(() => setLoading(false));
  }, []);

  const remove = async (id_producto) => {
    try {
      await apiClient.delete(`/carrito/${id_producto}`);
      const updated = items.filter(i => i.id_producto !== id_producto);
      setItems(updated);
      localStorage.setItem('cart', JSON.stringify(updated));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch {}
  };

  const updateQty = async (id_producto, nueva_cantidad) => {
    if (nueva_cantidad < 1) { remove(id_producto); return; }
    const updated = items.map(i => i.id_producto === id_producto ? { ...i, cantidad: nueva_cantidad } : i);
    setItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
    try { await apiClient.post('/carrito/sync', { items: updated }); } catch {}
  };

  const checkout = async () => {
    setChecking(true); setMsg({ text:'', type:'' });
    try {
      const res = await apiClient.post('/ventas/checkout', { items });
      localStorage.removeItem('cart');
      setItems([]);
      window.dispatchEvent(new Event('cartUpdated'));
      setMsg({ text: `✅ ¡Compra realizada! Pedido #${res.data.orderId}`, type:'ok' });
      setTimeout(() => navigate('/mis-pedidos'), 2500);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Error al procesar el pedido.', type:'err' });
    } finally { setChecking(false); }
  };

  const total = items.reduce((acc, i) => acc + parseFloat(i.precio) * i.cantidad, 0);

  if (loading) return <div className="loading-page"><div className="spinner"/><p>Cargando carrito...</p></div>;

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'60px 5%' }} className="fade-in">
      <h1 style={{ fontSize:'2rem', fontWeight:900, color:'#111', marginBottom:8 }}>Mi Carrito</h1>
      <p style={{ color:'#aaa', fontSize:'0.85rem', marginBottom:40 }}>{items.length} producto{items.length !== 1 ? 's' : ''}</p>

      {items.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 20px' }}>
          <p style={{ fontSize:'4rem' }}>🧺</p>
          <h2 style={{ color:'#111', marginTop:20 }}>Tu carrito está vacío</h2>
          <p style={{ color:'#aaa', marginTop:10 }}>Agrega productos desde el catálogo para comenzar.</p>
          <Link to="/catalogo" style={{ display:'inline-block', marginTop:28, background:'#111', color:'#B8860B', padding:'12px 28px', borderRadius:8, fontWeight:700, textDecoration:'none' }}>
            IR AL CATÁLOGO
          </Link>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:40 }}>

          {/* ITEMS */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {items.map(item => (
              <div key={item.id_producto} style={{ background:'#fff', borderRadius:12, padding:'20px', display:'flex', gap:20, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', alignItems:'center' }}>
                <div style={{ width:90, height:90, borderRadius:8, overflow:'hidden', background:'#f5f5f5', flexShrink:0 }}>
                  <img src={`http://localhost:5000${item.imagen_url}`} alt={item.nombre_producto}
                    style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    onError={e => { e.target.style.display='none'; }}/>
                </div>
                <div style={{ flex:1 }}>
                  <h3 style={{ fontSize:'0.95rem', fontWeight:700, color:'#111', marginBottom:4 }}>{item.nombre_producto}</h3>
                  <p  style={{ fontSize:'0.85rem', color:'#B8860B', fontWeight:700 }}>S/ {parseFloat(item.precio).toFixed(2)}</p>
                </div>
                {/* Cantidad */}
                <div style={{ display:'flex', alignItems:'center', border:'1.5px solid #eee', borderRadius:8, overflow:'hidden' }}>
                  <button onClick={() => updateQty(item.id_producto, item.cantidad - 1)}
                    style={{ padding:'6px 14px', background:'none', border:'none', cursor:'pointer', color:'#555', fontSize:'1rem' }}>−</button>
                  <span style={{ padding:'6px 14px', borderLeft:'1px solid #eee', borderRight:'1px solid #eee', fontWeight:700, fontSize:'0.9rem' }}>{item.cantidad}</span>
                  <button onClick={() => updateQty(item.id_producto, item.cantidad + 1)}
                    style={{ padding:'6px 14px', background:'none', border:'none', cursor:'pointer', color:'#555', fontSize:'1rem' }}>+</button>
                </div>
                {/* Subtotal */}
                <div style={{ textAlign:'right', minWidth:90 }}>
                  <p style={{ fontWeight:900, color:'#111', fontSize:'1rem' }}>S/ {(parseFloat(item.precio) * item.cantidad).toFixed(2)}</p>
                  <button onClick={() => remove(item.id_producto)}
                    style={{ background:'none', border:'none', color:'#e53e3e', cursor:'pointer', fontSize:'0.78rem', fontWeight:600, marginTop:6 }}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RESUMEN */}
          <div style={{ background:'#fff', borderRadius:14, padding:'28px', boxShadow:'0 4px 20px rgba(0,0,0,0.08)', height:'fit-content', position:'sticky', top:90 }}>
            <h2 style={{ fontSize:'1.1rem', fontWeight:900, color:'#111', marginBottom:24 }}>Resumen del Pedido</h2>

            {items.map(i => (
              <div key={i.id_producto} style={{ display:'flex', justifyContent:'space-between', marginBottom:10, fontSize:'0.84rem', color:'#666' }}>
                <span>{i.nombre_producto} × {i.cantidad}</span>
                <span>S/ {(parseFloat(i.precio) * i.cantidad).toFixed(2)}</span>
              </div>
            ))}

            <div style={{ borderTop:'1px solid #eee', paddingTop:16, marginTop:8, display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontWeight:900, fontSize:'1rem' }}>TOTAL</span>
              <span style={{ fontWeight:900, fontSize:'1.3rem', color:'#B8860B' }}>S/ {total.toFixed(2)}</span>
            </div>

            {msg.text && (
              <div style={{ background: msg.type==='ok' ? '#f0fdf4':'#fff5f5', border:`1px solid ${msg.type==='ok'?'#bbf7d0':'#fed7d7'}`, color: msg.type==='ok'?'#166534':'#c53030', padding:'12px', borderRadius:8, fontSize:'0.84rem', margin:'16px 0', textAlign:'center' }}>
                {msg.text}
              </div>
            )}

            <button onClick={checkout} disabled={checking || items.length === 0}
              style={{ width:'100%', marginTop:20, padding:'15px', background:'#111', color:'#B8860B', border:'none', borderRadius:10, fontWeight:900, fontSize:'0.9rem', cursor:'pointer', letterSpacing:'1px', opacity: checking ? 0.7 : 1 }}>
              {checking ? 'PROCESANDO...' : 'FINALIZAR COMPRA'}
            </button>

            <Link to="/catalogo" style={{ display:'block', textAlign:'center', marginTop:14, color:'#aaa', fontSize:'0.82rem', textDecoration:'none' }}>
              ← Seguir comprando
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
