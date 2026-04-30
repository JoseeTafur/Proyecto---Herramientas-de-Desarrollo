// pages/Login.jsx
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/apiClient';

export default function Login() {
  const [form, setForm]     = useState({ correo: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login }           = useContext(AuthContext);
  const navigate            = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await apiClient.post('/auth/login', form);
      login(res.data.user, res.data.token);
      // Recuperar carrito de la DB
      try {
        const cart = await apiClient.get('/carrito');
        if (cart.data.length) {
          localStorage.setItem('cart', JSON.stringify(cart.data));
          window.dispatchEvent(new Event('cartUpdated'));
        }
      } catch {}
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Correo o contraseña incorrectos.');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.bg}>
      <div style={s.card} className="fade-in">
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:30 }}>
          <div style={{ color:'#B8860B', fontWeight:900, fontSize:'1.3rem', letterSpacing:'3px' }}>CULINARIA</div>
          <div style={{ color:'#aaa', fontSize:'0.62rem', letterSpacing:'6px' }}>STORE</div>
        </div>

        <h2 style={s.title}>Bienvenido de vuelta</h2>
        <p  style={s.sub}>Ingresa a tu cuenta para continuar</p>

        {error && <div style={s.err}>{error}</div>}

        <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:18 }}>
          <div>
            <label style={s.label}>CORREO ELECTRÓNICO</label>
            <input type="email" required placeholder="tu@correo.com"
              value={form.correo} onChange={e => setForm({...form, correo: e.target.value})}
              style={s.input}/>
          </div>
          <div>
            <label style={s.label}>CONTRASEÑA</label>
            <input type="password" required placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              style={s.input}/>
          </div>
          <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'VERIFICANDO...' : 'INICIAR SESIÓN'}
          </button>
        </form>

        <p style={s.switchTxt}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={{ color:'#B8860B', fontWeight:700 }}>Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  bg:    { minHeight:'100vh', background:'#111', display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
  card:  { background:'#fff', width:'100%', maxWidth:400, borderRadius:16, padding:'44px 40px', boxShadow:'0 25px 70px rgba(0,0,0,0.45)' },
  title: { fontSize:'1.5rem', fontWeight:900, color:'#111', textAlign:'center', marginBottom:6 },
  sub:   { color:'#999', fontSize:'0.85rem', textAlign:'center', marginBottom:28 },
  label: { display:'block', fontSize:'0.68rem', fontWeight:700, color:'#999', letterSpacing:'1px', marginBottom:7 },
  input: { width:'100%', padding:'12px 14px', border:'1.5px solid #e5e5e5', borderRadius:8, fontSize:'0.9rem', outline:'none', boxSizing:'border-box', fontFamily:'inherit', transition:'border-color 0.2s' },
  btn:   { padding:'14px', background:'#111', color:'#B8860B', border:'none', borderRadius:8, fontWeight:900, fontSize:'0.88rem', letterSpacing:'1px', cursor:'pointer', transition:'background 0.2s' },
  err:   { background:'#fff5f5', border:'1px solid #fed7d7', color:'#c53030', padding:'12px 16px', borderRadius:8, fontSize:'0.84rem', marginBottom:10, textAlign:'center' },
  switchTxt: { textAlign:'center', color:'#999', fontSize:'0.84rem', marginTop:24 },
};
