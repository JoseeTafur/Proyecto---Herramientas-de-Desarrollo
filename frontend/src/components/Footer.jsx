// components/Footer.jsx
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={s.footer}>
    <div style={s.inner}>
      <div style={s.brand}>
        <span style={s.logoAccent}>CULINARIA</span>
        <span style={s.logoSub}>STORE</span>
        <p style={s.tagline}>Equipamiento de alta cocina para chefs y amantes de la gastronomía.</p>
      </div>
      <div style={s.links}>
        <strong style={s.colTitle}>TIENDA</strong>
        <Link to="/catalogo" style={s.link}>Catálogo</Link>
        <Link to="/carrito"  style={s.link}>Mi Carrito</Link>
        <Link to="/mis-pedidos" style={s.link}>Mis Pedidos</Link>
      </div>
      <div style={s.links}>
        <strong style={s.colTitle}>CUENTA</strong>
        <Link to="/login"    style={s.link}>Iniciar Sesión</Link>
        <Link to="/register" style={s.link}>Registrarse</Link>
        <Link to="/perfil"   style={s.link}>Mi Perfil</Link>
      </div>
    </div>
    <div style={s.bottom}>
      <span>© {new Date().getFullYear()} Culinaria Store — Todos los derechos reservados.</span>
    </div>
  </footer>
);

const s = {
  footer:     { background: '#111', borderTop: '2px solid #B8860B', marginTop: 'auto' },
  inner:      { maxWidth: '1200px', margin: '0 auto', padding: '50px 2rem 30px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '40px' },
  brand:      { display: 'flex', flexDirection: 'column', gap: '6px' },
  logoAccent: { color: '#B8860B', fontWeight: '900', fontSize: '1.1rem', letterSpacing: '3px' },
  logoSub:    { color: '#fff', fontSize: '0.6rem', letterSpacing: '6px' },
  tagline:    { color: '#555', fontSize: '0.85rem', marginTop: '10px', lineHeight: 1.6, maxWidth: '260px' },
  links:      { display: 'flex', flexDirection: 'column', gap: '10px' },
  colTitle:   { color: '#B8860B', fontSize: '0.75rem', letterSpacing: '2px', marginBottom: '4px' },
  link:       { color: '#666', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' },
  bottom:     { borderTop: '1px solid #1f1f1f', textAlign: 'center', padding: '20px', color: '#444', fontSize: '0.78rem' },
};

export default Footer;
