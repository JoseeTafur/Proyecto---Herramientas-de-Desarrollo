// pages/ProductDetail.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';

export default function ProductDetail() {
  const { id }              = useParams();
  const [prod, setProd]     = useState(null);
  const [qty, setQty]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]   = useState('');
  const { user }            = useContext(AuthContext);
  const navigate            = useNavigate();

  useEffect(() => {
    apiClient.get(`/productos/${id}`)
      .then(r => setProd(r.data))
      .catch(() => navigate('/catalogo'))
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = async () => {
    if (!user) { navigate('/login'); return; }
    if (!prod || prod.stock <= 0) return;
    try {
      await apiClient.post('/carrito/add', { id_producto: prod.id_producto, cantidad: qty });
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const idx  = cart.findIndex(i => i.id_producto === prod.id_producto);
      idx > -1 ? cart[idx].cantidad += qty : cart.push({ ...prod, cantidad: qty });
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      setToast(`${qty} unidad${qty > 1 ? 'es' : ''} añadida${qty > 1 ? 's' : ''} al carrito`);
      setTimeout(() => setToast(''), 3000);
    } catch { setToast('Error al agregar al carrito'); setTimeout(() => setToast(''), 3000); }
  };

  if (loading) return <div className="loading-page"><div className="spinner"/><p>Cargando producto...</p></div>;
  if (!prod)   return null;

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'60px 5%' }} className="fade-in">

      {/* Breadcrumb */}
      <p style={{ color:'#aaa', fontSize:'0.82rem', marginBottom:36 }}>
        <Link to="/" style={{ color:'#aaa' }}>Inicio</Link>
        {' / '}
        <Link to="/catalogo" style={{ color:'#aaa' }}>Catálogo</Link>
        {' / '}
        <span style={{ color:'#111' }}>{prod.nombre_producto}</span>
      </p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:60 }}>

        {/* IMAGEN */}
        <div style={{ borderRadius:16, overflow:'hidden', background:'#f5f5f5', aspectRatio:'1/1' }}>
          <img src={`http://localhost:5000${prod.imagen_url}`} alt={prod.nombre_producto}
            style={{ width:'100%', height:'100%', objectFit:'cover' }}
            onError={e => { e.target.style.display='none'; }}/>
        </div>

        {/* INFO */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {prod.nombre_categoria && (
            <span style={{ color:'#B8860B', fontSize:'0.75rem', fontWeight:700, letterSpacing:'2px' }}>
              {prod.nombre_categoria.toUpperCase()}
            </span>
          )}

          <h1 style={{ fontSize:'2rem', fontWeight:900, color:'#111', lineHeight:1.2 }}>{prod.nombre_producto}</h1>

          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            <span style={{ fontSize:'2.2rem', fontWeight:900, color:'#B8860B' }}>
              S/ {parseFloat(prod.precio).toFixed(2)}
            </span>
            <span style={{ background: prod.stock > 0 ? '#f0fdf4' : '#fff5f5', color: prod.stock > 0 ? '#166534' : '#991b1b', padding:'4px 12px', borderRadius:20, fontSize:'0.78rem', fontWeight:700 }}>
              {prod.stock > 0 ? `${prod.stock} en stock` : 'Agotado'}
            </span>
          </div>

          {prod.descripcion && (
            <p style={{ color:'#666', lineHeight:1.75, fontSize:'0.95rem', borderTop:'1px solid #eee', paddingTop:20 }}>
              {prod.descripcion}
            </p>
          )}

          {/* CANTIDAD */}
          {prod.stock > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:14, marginTop:8 }}>
              <span style={{ fontSize:'0.78rem', fontWeight:700, color:'#999', letterSpacing:'1px' }}>CANTIDAD</span>
              <div style={{ display:'flex', alignItems:'center', border:'1.5px solid #e5e5e5', borderRadius:8, overflow:'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q-1))}
                  style={{ padding:'8px 16px', background:'none', border:'none', cursor:'pointer', fontSize:'1.1rem', color:'#555' }}>−</button>
                <span style={{ padding:'8px 20px', fontWeight:700, fontSize:'1rem', borderLeft:'1px solid #eee', borderRight:'1px solid #eee' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(prod.stock, q+1))}
                  style={{ padding:'8px 16px', background:'none', border:'none', cursor:'pointer', fontSize:'1.1rem', color:'#555' }}>+</button>
              </div>
            </div>
          )}

          {/* ACCIONES */}
          <div style={{ display:'flex', gap:14, marginTop:8 }}>
            <button onClick={addToCart} disabled={prod.stock <= 0}
              style={{ flex:1, padding:'15px', background: prod.stock > 0 ? '#111':'#e5e5e5', color: prod.stock > 0 ? '#B8860B':'#aaa', border:'none', borderRadius:10, fontWeight:900, fontSize:'0.9rem', cursor: prod.stock > 0 ? 'pointer':'not-allowed', letterSpacing:'1px' }}>
              {prod.stock > 0 ? 'AÑADIR AL CARRITO' : 'PRODUCTO AGOTADO'}
            </button>
          </div>

          {!user && (
            <p style={{ color:'#aaa', fontSize:'0.82rem', textAlign:'center' }}>
              <Link to="/login" style={{ color:'#B8860B', fontWeight:700 }}>Inicia sesión</Link> para agregar al carrito
            </p>
          )}
        </div>
      </div>

      {toast && (
        <div style={{ position:'fixed', bottom:30, left:'50%', transform:'translateX(-50%)', background:'#1a1a1a', border:'1px solid #B8860B', color:'#fff', padding:'13px 26px', borderRadius:10, zIndex:999, fontSize:'0.88rem' }}>
          ✅ {toast}
        </div>
      )}
    </div>
  );
}
