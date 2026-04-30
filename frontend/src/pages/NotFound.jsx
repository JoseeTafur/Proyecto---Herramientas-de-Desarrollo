// pages/NotFound.jsx
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ minHeight:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'40px 20px' }}>
      <h1 style={{ fontSize:'7rem', fontWeight:900, color:'#B8860B', lineHeight:1 }}>404</h1>
      <h2 style={{ fontSize:'1.6rem', fontWeight:900, color:'#111', margin:'16px 0 10px' }}>Página no encontrada</h2>
      <p  style={{ color:'#aaa', fontSize:'0.95rem', maxWidth:380 }}>
        Lo sentimos, el utensilio que buscas no está en nuestra cocina.
      </p>
      <Link to="/" style={{ display:'inline-block', marginTop:32, background:'#111', color:'#B8860B', padding:'13px 32px', borderRadius:8, fontWeight:700, textDecoration:'none', fontSize:'0.88rem', letterSpacing:'1px' }}>
        VOLVER AL INICIO
      </Link>
    </div>
  );
}
