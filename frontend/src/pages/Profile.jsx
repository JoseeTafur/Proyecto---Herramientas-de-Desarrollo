// pages/Profile.jsx
import { useState, useEffect, useContext } from 'react';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';

export default function Profile() {
  const [perfil,   setPerfil]   = useState(null);
  const [form,     setForm]     = useState({ nombre:'', apellido:'', correo:'' });
  const [foto,     setFoto]     = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState({ text:'', type:'' });
  const { user, login }         = useContext(AuthContext);

  useEffect(() => {
    apiClient.get('/auth/perfil')
      .then(r => {
        setPerfil(r.data);
        setForm({ nombre: r.data.nombre || '', apellido: r.data.apellido || '', correo: r.data.correo || '' });
        if (r.data.foto_url) setPreview(`http://localhost:5000${r.data.foto_url}`);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg({ text:'', type:'' });
    try {
      const data = new FormData();
      data.append('nombre',   form.nombre);
      data.append('apellido', form.apellido);
      data.append('correo',   form.correo);
      if (foto) data.append('foto', foto);

      await apiClient.put('/auth/perfil', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Actualizar contexto con nuevo nombre
      const saved = JSON.parse(localStorage.getItem('user')) || {};
      const updated = { ...saved, nombre: form.nombre };
      localStorage.setItem('user', JSON.stringify(updated));
      login(updated, localStorage.getItem('token'));

      setMsg({ text:'✅ Perfil actualizado correctamente', type:'ok' });
      setFoto(null);
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'Error al actualizar perfil.', type:'err' });
    } finally { setSaving(false); }
  };

  if (loading) return <div className="loading-page"><div className="spinner"/><p>Cargando perfil...</p></div>;

  return (
    <div style={{ maxWidth:680, margin:'0 auto', padding:'60px 5%' }} className="fade-in">
      <h1 style={{ fontSize:'2rem', fontWeight:900, color:'#111', marginBottom:8 }}>Mi Perfil</h1>
      <p  style={{ color:'#aaa', fontSize:'0.85rem', marginBottom:44 }}>Actualiza tu información personal</p>

      <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 4px 24px rgba(0,0,0,0.08)', padding:'40px' }}>

        {/* FOTO */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ width:100, height:100, borderRadius:'50%', overflow:'hidden', background:'#f0f0f0', margin:'0 auto 16px', border:'3px solid #B8860B' }}>
            {preview
              ? <img src={preview} alt="Foto" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5rem', fontWeight:900, color:'#B8860B', background:'#111' }}>
                  {form.nombre?.charAt(0).toUpperCase()}
                </div>
            }
          </div>
          <label style={{ cursor:'pointer', background:'#f5f5f5', border:'1px solid #e5e5e5', padding:'8px 20px', borderRadius:8, fontSize:'0.8rem', fontWeight:700, color:'#555', display:'inline-block' }}>
            CAMBIAR FOTO
            <input type="file" accept="image/*" onChange={handleFoto} style={{ display:'none' }}/>
          </label>
          {perfil?.fecha_registro && (
            <p style={{ color:'#ccc', fontSize:'0.75rem', marginTop:10 }}>
              Miembro desde {new Date(perfil.fecha_registro).toLocaleDateString('es-PE', { month:'long', year:'numeric' })}
            </p>
          )}
        </div>

        {/* BADGE ROL */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <span style={{ background: user?.rol === 1 ? '#111':'#f5f5f5', color: user?.rol === 1 ? '#B8860B':'#555', padding:'5px 18px', borderRadius:20, fontSize:'0.75rem', fontWeight:700, letterSpacing:'1px' }}>
            {user?.rol === 1 ? '⚙️ ADMINISTRADOR' : '👤 CLIENTE'}
          </span>
        </div>

        {msg.text && (
          <div style={{ background: msg.type==='ok'?'#f0fdf4':'#fff5f5', border:`1px solid ${msg.type==='ok'?'#bbf7d0':'#fed7d7'}`, color: msg.type==='ok'?'#166534':'#c53030', padding:'12px 16px', borderRadius:8, fontSize:'0.85rem', marginBottom:24, textAlign:'center' }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {[['nombre','NOMBRE'],['apellido','APELLIDO']].map(([k,l]) => (
              <div key={k}>
                <label style={fl}>{l}</label>
                <input value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} required style={fi}/>
              </div>
            ))}
          </div>
          <div>
            <label style={fl}>CORREO ELECTRÓNICO</label>
            <input type="email" value={form.correo} onChange={e => setForm({...form, correo:e.target.value})} required style={fi}/>
          </div>
          <button type="submit" disabled={saving}
            style={{ padding:'14px', background:'#111', color:'#B8860B', border:'none', borderRadius:10, fontWeight:900, fontSize:'0.88rem', letterSpacing:'1px', cursor:'pointer', marginTop:8, opacity: saving?0.7:1 }}>
            {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
          </button>
        </form>
      </div>
    </div>
  );
}

const fl = { display:'block', fontSize:'0.68rem', fontWeight:700, color:'#999', letterSpacing:'1px', marginBottom:7 };
const fi = { width:'100%', padding:'12px 14px', border:'1.5px solid #e5e5e5', borderRadius:8, fontSize:'0.9rem', outline:'none', boxSizing:'border-box', fontFamily:'inherit' };
