// pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

export default function Register() {
  const [form, setForm]       = useState({ nombre:'', apellido:'', correo:'', password:'' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await apiClient.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse. Intenta de nuevo.');
    } finally { setLoading(false); }
  };

  const f = (key, label, placeholder, type='text') => (
    <div key={key}>
      <label style={s.label}>{label}</label>
      <input type={type} required placeholder={placeholder}
        value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})}
        style={s.input}/>
    </div>
  );

  return (
    <div style={s.bg}>
      <div style={s.card} className="fade-in">
        <div style={{ textAlign:'center', marginBottom:30 }}>
          <div style={{ color:'#B8860B', fontWeight:900, fontSize:'1.3rem', letterSpacing:'3px' }}>CULINARIA</div>
          <div style={{ color:'#aaa', fontSize:'0.62rem', letterSpacing:'6px' }}>STORE</div>
        </div>

        <h2 style={s.title}>Crear Cuenta</h2>
        <p  style={s.sub}>Únete a nuestra comunidad culinaria</p>

        {error && <div style={s.err}>{error}</div>}

        <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {f('nombre',   'NOMBRE',   'Juan')}
            {f('apellido', 'APELLIDO', 'García')}
          </div>
          {f('correo',   'CORREO ELECTRÓNICO', 'tu@correo.com', 'email')}
          {f('password', 'CONTRASEÑA',         '••••••••',      'password')}

          <button type="submit" disabled={loading}
            style={{ ...s.btn, marginTop:4, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
          </button>
        </form>

        <p style={s.switchTxt}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color:'#B8860B', fontWeight:700 }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  bg:    { minHeight:'100vh', background:'#111', display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
  card:  { background:'#fff', width:'100%', maxWidth:440, borderRadius:16, padding:'44px 40px', boxShadow:'0 25px 70px rgba(0,0,0,0.45)' },
  title: { fontSize:'1.5rem', fontWeight:900, color:'#111', textAlign:'center', marginBottom:6 },
  sub:   { color:'#999', fontSize:'0.85rem', textAlign:'center', marginBottom:28 },
  label: { display:'block', fontSize:'0.68rem', fontWeight:700, color:'#999', letterSpacing:'1px', marginBottom:7 },
  input: { width:'100%', padding:'12px 14px', border:'1.5px solid #e5e5e5', borderRadius:8, fontSize:'0.9rem', outline:'none', boxSizing:'border-box', fontFamily:'inherit' },
  btn:   { padding:'14px', background:'#B8860B', color:'#111', border:'none', borderRadius:8, fontWeight:900, fontSize:'0.88rem', letterSpacing:'1px', cursor:'pointer' },
  err:   { background:'#fff5f5', border:'1px solid #fed7d7', color:'#c53030', padding:'12px 16px', borderRadius:8, fontSize:'0.84rem', marginBottom:10, textAlign:'center' },
  switchTxt: { textAlign:'center', color:'#999', fontSize:'0.84rem', marginTop:24 },
};
