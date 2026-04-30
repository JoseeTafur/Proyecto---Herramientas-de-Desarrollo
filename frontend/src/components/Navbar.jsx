// =============================================
// components/Navbar.jsx
// =============================================
import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/apiClient';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const updateBadge = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartCount(cart.reduce((acc, i) => acc + (i.cantidad || 0), 0));
  };

  useEffect(() => {
    updateBadge();
    window.addEventListener('cartUpdated', updateBadge);
    return () => window.removeEventListener('cartUpdated', updateBadge);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length > 0 && user) {
      try { await apiClient.post('/carrito/sync', { items: cart }); } catch {}
    }
    logout();
    window.dispatchEvent(new Event('cartUpdated'));
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={s.header}>
      <div style={s.inner}>

        {/* NAV IZQUIERDA */}
        <nav style={s.leftNav}>
          <Link to="/catalogo" style={{ ...s.link, color: isActive('/catalogo') ? '#B8860B' : '#ccc' }}>
            CATÁLOGO
          </Link>
        </nav>

        {/* LOGO */}
        <Link to="/" style={s.logo}>
          <span style={s.logoAccent}>CULINARIA</span>
          <span style={s.logoSub}>STORE</span>
        </Link>

        {/* ACCIONES DERECHA */}
        <div style={s.right}>

          {user ? (
            <div ref={dropRef} style={{ position: 'relative' }}>
              <button style={s.userBtn} onClick={() => setMenuOpen(!menuOpen)}>
                <div style={s.avatar}>{user.nombre?.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={s.userName}>{user.nombre?.toUpperCase()}</div>
                  <div style={s.userRole}>{user.rol === 1 ? 'ADMIN' : 'CLIENTE'}</div>
                </div>
                <span style={{ color: '#B8860B', fontSize: '0.7rem' }}>▾</span>
              </button>

              {menuOpen && (
                <div style={s.dropdown}>
                  <div style={s.dropHead}>
                    <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{user.nombre}</strong>
                    <p style={{ color: '#666', fontSize: '0.75rem', margin: '2px 0 0' }}>
                      {user.rol === 1 ? 'Administrador' : 'Cliente'}
                    </p>
                  </div>
                  <div style={s.divider} />
                  <Link to="/perfil"      style={s.dropItem} onClick={() => setMenuOpen(false)}>👤 Mi Perfil</Link>
                  <Link to="/mis-pedidos" style={s.dropItem} onClick={() => setMenuOpen(false)}>📦 Mis Pedidos</Link>
                  {user.rol === 1 && (
                    <Link to="/admin" style={{ ...s.dropItem, color: '#B8860B', fontWeight: '700' }} onClick={() => setMenuOpen(false)}>
                      ⚙️ Panel Admin
                    </Link>
                  )}
                  <div style={s.divider} />
                  <button onClick={handleLogout} style={s.logoutBtn}>CERRAR SESIÓN</button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/login"    style={s.btnOutline}>INGRESAR</Link>
              <Link to="/register" style={s.btnSolid}>REGISTRARSE</Link>
            </div>
          )}

          {/* CARRITO */}
          <Link to="/carrito" style={s.cartBtn}>
            <span style={{ fontSize: '1.3rem' }}>🧺</span>
            {cartCount > 0 && <span style={s.badge}>{cartCount}</span>}
          </Link>

        </div>
      </div>
    </header>
  );
};

const s = {
  header: { background: '#111', borderBottom: '2px solid #B8860B', position: 'sticky', top: 0, zIndex: 100 },
  inner:  { maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' },
  leftNav: { display: 'flex', gap: '24px' },
  link:    { fontSize: '0.8rem', letterSpacing: '1.5px', fontWeight: '700', transition: 'color 0.2s' },
  logo:    { display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, textDecoration: 'none' },
  logoAccent: { color: '#B8860B', fontWeight: '900', fontSize: '1.1rem', letterSpacing: '3px' },
  logoSub:    { color: '#fff',    fontWeight: '300', fontSize: '0.6rem', letterSpacing: '6px', marginTop: '2px' },
  right:   { display: 'flex', alignItems: 'center', gap: '16px' },
  userBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', padding: '4px 0' },
  avatar:  { width: '32px', height: '32px', borderRadius: '50%', background: '#B8860B', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.85rem' },
  userName: { color: '#fff', fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.5px', lineHeight: 1.2 },
  userRole: { color: '#B8860B', fontSize: '0.62rem', letterSpacing: '1px', lineHeight: 1.2 },
  dropdown: { position: 'absolute', right: 0, top: '50px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', minWidth: '220px', boxShadow: '0 15px 40px rgba(0,0,0,0.5)', overflow: 'hidden', zIndex: 200 },
  dropHead: { padding: '16px 18px', background: '#222' },
  divider:  { height: '1px', background: '#2a2a2a' },
  dropItem: { display: 'block', padding: '12px 18px', color: '#bbb', fontSize: '0.85rem', transition: 'background 0.15s', textDecoration: 'none' },
  logoutBtn: { width: '100%', padding: '12px 18px', background: 'none', border: 'none', color: '#e53e3e', textAlign: 'left', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem', letterSpacing: '0.5px' },
  btnOutline: { color: '#bbb', border: '1px solid #333', padding: '7px 14px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.5px', textDecoration: 'none' },
  btnSolid:   { color: '#111', background: '#B8860B', padding: '7px 14px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.5px', textDecoration: 'none' },
  cartBtn:  { position: 'relative', color: '#fff', textDecoration: 'none', padding: '6px 10px', border: '1px solid #2a2a2a', borderRadius: '8px' },
  badge:    { position: 'absolute', top: '-7px', right: '-7px', background: '#B8860B', color: '#111', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};

export default Navbar;
