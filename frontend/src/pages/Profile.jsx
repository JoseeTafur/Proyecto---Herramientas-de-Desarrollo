// pages/Profile.jsx
import { useState, useEffect, useContext } from 'react';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';
import { validateName, validateEmail } from '../utils/validators';

export default function Profile() {
  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState({ nombre: '', apellido: '', correo: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const { user, login } = useContext(AuthContext);

  useEffect(() => {
    apiClient.get('/auth/perfil')
      .then(r => {
        setPerfil(r.data);
        setForm({ 
          nombre: r.data.nombre || '', 
          apellido: r.data.apellido || '', 
          correo: r.data.correo || '' 
        });
        if (r.data.foto_url) setPreview(`http://localhost:5000${r.data.foto_url}`);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Validar un campo específico
  const validateField = (name, value) => {
    switch (name) {
      case 'nombre':
        return validateName(value, 'Nombre');
      case 'apellido':
        return validateName(value, 'Apellido');
      case 'correo':
        return validateEmail(value);
      default:
        return { isValid: true, error: '' };
    }
  };

  // Validar archivo de foto
  const validatePhoto = (file) => {
    if (!file) return { isValid: true, error: '' };
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      return { isValid: false, error: 'Formato no válido. Usa JPG, PNG o WEBP.' };
    }
    
    if (file.size > maxSize) {
      return { isValid: false, error: 'La imagen no debe superar los 5MB.' };
    }
    
    return { isValid: true, error: '' };
  };

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (touched[name]) {
      const validation = validateField(name, value);
      setErrors({ ...errors, [name]: validation.isValid ? '' : validation.error });
    }
  };

  // Manejar blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    
    const validation = validateField(name, value);
    setErrors({ ...errors, [name]: validation.isValid ? '' : validation.error });
  };

  // Manejar cambio de foto
  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validation = validatePhoto(file);
    if (!validation.isValid) {
      setMsg({ text: validation.error, type: 'err' });
      return;
    }
    
    setFoto(file);
    setPreview(URL.createObjectURL(file));
    setMsg({ text: '', type: '' });
  };

  // Validar todo el formulario
  const validateForm = () => {
    const newErrors = {};
    const nombreValidation = validateName(form.nombre, 'Nombre');
    const apellidoValidation = validateName(form.apellido, 'Apellido');
    const emailValidation = validateEmail(form.correo);
    
    if (!nombreValidation.isValid) newErrors.nombre = nombreValidation.error;
    if (!apellidoValidation.isValid) newErrors.apellido = apellidoValidation.error;
    if (!emailValidation.isValid) newErrors.correo = emailValidation.error;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados
    setTouched({ nombre: true, apellido: true, correo: true });
    
    // Validar formulario
    if (!validateForm()) {
      setMsg({ text: 'Por favor, corrige los errores del formulario.', type: 'err' });
      return;
    }
    
    setSaving(true);
    setMsg({ text: '', type: '' });
    
    try {
      const data = new FormData();
      data.append('nombre', form.nombre.trim());
      data.append('apellido', form.apellido.trim());
      data.append('correo', form.correo.trim());
      if (foto) data.append('foto', foto);

      await apiClient.put('/auth/perfil', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Actualizar contexto con nuevo nombre
      const saved = JSON.parse(localStorage.getItem('user')) || {};
      const updated = { ...saved, nombre: form.nombre.trim(), apellido: form.apellido.trim(), correo: form.correo.trim() };
      localStorage.setItem('user', JSON.stringify(updated));
      login(updated, localStorage.getItem('token'));

      setMsg({ text: '✅ Perfil actualizado correctamente', type: 'ok' });
      setFoto(null);
      
      // Limpiar errores después de guardar exitosamente
      setErrors({});
      setTouched({});
      
    } catch (err) {
      // Manejar error específico de correo duplicado
      if (err.response?.data?.error?.includes('correo')) {
        setMsg({ text: 'Este correo electrónico ya está registrado por otro usuario.', type: 'err' });
        setErrors({ ...errors, correo: 'Correo electrónico ya registrado' });
        setTouched({ ...touched, correo: true });
      } else {
        setMsg({ text: err.response?.data?.error || 'Error al actualizar perfil.', type: 'err' });
      }
    } finally {
      setSaving(false);
    }
  };

  // Renderizar campo con validación
  const renderField = (name, label, placeholder, type = 'text') => {
    const hasError = errors[name] && touched[name];
    
    return (
      <div key={name} style={s.fieldGroup}>
        <label style={fl}>{label}</label>
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={form[name]}
          onChange={handleChange}
          onBlur={handleBlur}
          style={{
            ...fi,
            ...(hasError ? s.inputError : {}),
            ...(touched[name] && !errors[name] && form[name] ? s.inputSuccess : {})
          }}
        />
        {hasError && (
          <span style={s.errorText}>{errors[name]}</span>
        )}
        {touched[name] && !errors[name] && form[name] && (
          <span style={s.successText}>✓ Correcto</span>
        )}
      </div>
    );
  };

  if (loading) return <div className="loading-page"><div className="spinner"/><p>Cargando perfil...</p></div>;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 5%' }} className="fade-in">
      <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#111', marginBottom: 8 }}>Mi Perfil</h1>
      <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: 44 }}>Actualiza tu información personal</p>

      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '40px' }}>

        {/* FOTO */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ 
            width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', 
            background: '#f0f0f0', margin: '0 auto 16px', border: '3px solid #B8860B' 
          }}>
            {preview
              ? <img src={preview} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              : <div style={{ 
                  width: '100%', height: '100%', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', fontSize: '2.5rem', fontWeight: 900, 
                  color: '#B8860B', background: '#111' 
                }}>
                  {form.nombre?.charAt(0).toUpperCase()}
                </div>
            }
          </div>
          <label style={{ 
            cursor: 'pointer', background: '#f5f5f5', border: '1px solid #e5e5e5', 
            padding: '8px 20px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, 
            color: '#555', display: 'inline-block', transition: 'all 0.2s',
            ':hover': { background: '#e5e5e5' }
          }}>
            CAMBIAR FOTO
            <input type="file" accept="image/*" onChange={handleFoto} style={{ display: 'none' }}/>
          </label>
          <p style={{ color: '#aaa', fontSize: '0.7rem', marginTop: 8 }}>
            Formatos: JPG, PNG, WEBP (Max 5MB)
          </p>
          {perfil?.fecha_registro && (
            <p style={{ color: '#ccc', fontSize: '0.75rem', marginTop: 10 }}>
              Miembro desde {new Date(perfil.fecha_registro).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>

        {/* BADGE ROL */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ 
            background: user?.rol === 1 ? '#111' : '#f5f5f5', 
            color: user?.rol === 1 ? '#B8860B' : '#555', 
            padding: '5px 18px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, 
            letterSpacing: '1px', display: 'inline-block' 
          }}>
            {user?.rol === 1 ? '⚙️ ADMINISTRADOR' : '👤 CLIENTE'}
          </span>
        </div>

        {msg.text && (
          <div style={{ 
            background: msg.type === 'ok' ? '#f0fdf4' : '#fff5f5', 
            border: `1px solid ${msg.type === 'ok' ? '#bbf7d0' : '#fed7d7'}`, 
            color: msg.type === 'ok' ? '#166534' : '#c53030', 
            padding: '12px 16px', borderRadius: 8, fontSize: '0.85rem', 
            marginBottom: 24, textAlign: 'center' 
          }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {renderField('nombre', 'NOMBRE', 'Juan')}
            {renderField('apellido', 'APELLIDO', 'García')}
          </div>
          {renderField('correo', 'CORREO ELECTRÓNICO', 'tu@correo.com', 'email')}
          
          <button 
            type="submit" 
            disabled={saving}
            style={{ 
              padding: '14px', background: '#111', color: '#B8860B', border: 'none', 
              borderRadius: 10, fontWeight: 900, fontSize: '0.88rem', letterSpacing: '1px', 
              cursor: saving ? 'not-allowed' : 'pointer', marginTop: 8, opacity: saving ? 0.7 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
          </button>
        </form>
      </div>
    </div>
  );
}

const fl = { display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#999', letterSpacing: '1px', marginBottom: 7 };
const fi = { 
  width: '100%', padding: '12px 14px', border: '1.5px solid #e5e5e5', 
  borderRadius: 8, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', 
  fontFamily: 'inherit', transition: 'border-color 0.2s' 
};

const s = {
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  inputError: {
    borderColor: '#c53030',
    backgroundColor: '#fff5f5'
  },
  inputSuccess: {
    borderColor: '#38a169',
    backgroundColor: '#f0fff4'
  },
  errorText: {
    display: 'block',
    color: '#c53030',
    fontSize: '0.7rem',
    marginTop: 4,
    fontWeight: 500
  },
  successText: {
    display: 'block',
    color: '#38a169',
    fontSize: '0.7rem',
    marginTop: 4,
    fontWeight: 500
  }
};