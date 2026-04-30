// pages/Catalogo.jsx
import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';

export default function Catalogo() {
  const [productos, setProductos]   = useState([]);
  const [filtered,  setFiltered]    = useState([]);
  const [search,    setSearch]      = useState('');
  const [loading,   setLoading]     = useState(true);
  const [toast,     setToast]       = useState('');
  const { user }                    = useContext(AuthContext);
  const navigate                    = useNavigate();

  useEffect(() => {
    apiClient.get('/productos')
      .then(r => { setProductos(r.data); setFiltered(r.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = search.toLowerCase().trim();
    setFiltered(t ? productos.filter(p => p.nombre_producto?.toLowerCase().includes(t)) : productos);
  }, [search, productos]);

  const addToCart = async (p, e) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    if (p.stock <= 0) return;
    try {
      await apiClient.post('/carrito/add', { id_producto: p.id_producto, cantidad: 1 });
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const idx  = cart.findIndex(i => i.id_producto === p.id_producto);
      idx > -1 ? cart[idx].cantidad++ : cart.push({ ...p, cantidad: 1 });
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      setToast(`✅ "${p.nombre_producto}" añadido`);
      setTimeout(() => setToast(''), 2800);
    } catch {}
  };

  return (
    <div style={{ background:'#f8f8f8', minHeight:'80vh' }}>

      {/* CABECERA */}
      <div style={{ background:'#111', padding:'56px 20px 44px', textAlign:'center' }}>
        <p style={{ color:'#B8860B', fontSize:'0.72rem', letterSpacing:'3px', fontWeight:700, marginBottom:10 }}>TIENDA OFICIAL</p>
        <h1 style={{ color:'#fff', fontSize:'2.4rem', fontWeight:900, marginBottom:10 }}>Catálogo Completo</h1>
        <p  style={{ color:'#555', fontSize:'0.9rem' }}>Equipamiento profesional de alta gastronomía</p>
      </div>

      {/* BÚSQUEDA */}
      <div style={{ maxWidth:520, margin:'40px auto 0', padding:'0 20px', position:'relative' }}>
        <span style={{ position:'absolute', left:34, top:'50%', transform:'translateY(-50%)', color:'#bbb', fontSize:'1rem' }}>🔍</span>
        <input
          type="text" placeholder="Buscar producto..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width:'100%', padding:'13px 44px 13px 42px', border:'2px solid #e5e5e5', borderRadius:10, fontSize:'0.9rem', outline:'none', boxSizing:'border-box', fontFamily:'inherit', background:'#fff' }}
        />
        {search && (
          <button onClick={() => setSearch('')}
            style={{ position:'absolute', right:34, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#aaa', cursor:'pointer', fontSize:'1rem' }}>
            ✕
          </button>
        )}
      </div>

      {/* CONTADOR */}
      <p style={{ textAlign:'center', color:'#aaa', fontSize:'0.82rem', margin:'16px 0 32px' }}>
        {filtered.length} producto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* GRID */}
      {loading
        ? <div className="loading-page"><div className="spinner"/><p>Cargando catálogo...</p></div>
        : filtered.length === 0
          ? (
            <div style={{ textAlign:'center', padding:'80px 20px', color:'#aaa' }}>
              <p style={{ fontSize:'3rem' }}>🔍</p>
              <p style={{ fontSize:'1.1rem', marginTop:16 }}>No encontramos <strong style={{ color:'#111' }}>"{search}"</strong></p>
              <button onClick={() => setSearch('')}
                style={{ marginTop:24, padding:'10px 24px', background:'#111', color:'#B8860B', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700 }}>
                Ver todos
              </button>
            </div>
          ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:24, padding:'0 5% 80px', maxWidth:1300, margin:'0 auto' }}>
            {filtered.map(p => (
              <article key={p.id_producto}
                onClick={() => navigate(`/producto/${p.id_producto}`)}
                style={{ background:'#fff', borderRadius:12, overflow:'hidden', boxShadow:'0 4px 16px rgba(0,0,0,0.07)', cursor:'pointer', transition:'transform 0.22s, box-shadow 0.22s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.07)'; }}
              >
                <div style={{ height:218, overflow:'hidden', position:'relative', background:'#f0f0f0' }}>
                  <img src={`http://localhost:5000${p.imagen_url}`} alt={p.nombre_producto}
                    style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    onError={e => { e.target.style.display='none'; }}/>
                  {p.stock <= 0 && <span style={{ position:'absolute', top:10, right:10, background:'#222', color:'#fff', fontSize:'0.62rem', fontWeight:700, padding:'4px 10px', borderRadius:4 }}>AGOTADO</span>}
                </div>
                <div style={{ padding:'16px 18px' }}>
                  <h3 style={{ fontSize:'0.92rem', fontWeight:700, color:'#111', marginBottom:4, lineHeight:1.35 }}>{p.nombre_producto}</h3>
                  {p.nombre_categoria && <span style={{ fontSize:'0.72rem', color:'#B8860B', letterSpacing:'0.5px' }}>{p.nombre_categoria}</span>}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:14 }}>
                    <span style={{ color:'#B8860B', fontWeight:900, fontSize:'1.15rem' }}>S/ {parseFloat(p.precio).toFixed(2)}</span>
                    <button
                      onClick={e => addToCart(p, e)} disabled={p.stock <= 0}
                      style={{ background: p.stock > 0 ? '#111' : '#e5e5e5', color: p.stock > 0 ? '#B8860B' : '#aaa', border:'none', borderRadius:6, padding:'8px 16px', fontSize:'0.8rem', fontWeight:700, cursor: p.stock > 0 ? 'pointer':'not-allowed', letterSpacing:'0.5px' }}>
                      {p.stock > 0 ? '+ AÑADIR' : 'AGOTADO'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )
      }

      {toast && (
        <div style={{ position:'fixed', bottom:30, left:'50%', transform:'translateX(-50%)', background:'#1a1a1a', border:'1px solid #B8860B', color:'#fff', padding:'13px 26px', borderRadius:10, zIndex:999, fontSize:'0.88rem', whiteSpace:'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
