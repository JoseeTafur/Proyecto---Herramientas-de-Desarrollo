// pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { validateRegisterForm, validateName, validateEmail, validatePassword } from '../utils/validators';

export default function Register() {
  const [form, setForm] = useState({ nombre: '', apellido: '', correo: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validar un campo específico
  const validateField = (name, value) => {
    switch (name) {
      case 'nombre':
        return validateName(value, 'Nombre');
      case 'apellido':
        return validateName(value, 'Apellido');
      case 'correo':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      default:
        return { isValid: true, error: '' };
    }
  };

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Validar en tiempo real si el campo ya fue tocado
    if (touched[name]) {
      const validation = validateField(name, value);
      setErrors({ ...errors, [name]: validation.isValid ? '' : validation.error });
    }
  };

  // Manejar blur (cuando el campo pierde foco)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    
    const validation = validateField(name, value);
    setErrors({ ...errors, [name]: validation.isValid ? '' : validation.error });
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados
    const allTouched = { nombre: true, apellido: true, correo: true, password: true };
    setTouched(allTouched);
    
    // Validar todo el formulario
    const validation = validateRegisterForm(form);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    // Si todas las validaciones pasan, enviar al backend
    setLoading(true);
    setServerError('');
    
    try {
      await apiClient.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Error al registrarse. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función para renderizar campo con validación
  const renderField = (name, label, placeholder, type = 'text') => {
    const hasError = errors[name] && touched[name];
    
    return (
      <div key={name} style={s.fieldGroup}>
        <label style={s.label}>{label}</label>
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={form[name]}
          onChange={handleChange}
          onBlur={handleBlur}
          style={{
            ...s.input,
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

  return (
    <div style={s.bg}>
      <div style={s.card} className="fade-in">
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ color: '#B8860B', fontWeight: 900, fontSize: '1.3rem', letterSpacing: '3px' }}>
            CULINARIA
          </div>
          <div style={{ color: '#aaa', fontSize: '0.62rem', letterSpacing: '6px' }}>
            STORE
          </div>
        </div>

        <h2 style={s.title}>Crear Cuenta</h2>
        <p style={s.sub}>Únete a nuestra comunidad culinaria</p>

        {serverError && <div style={s.err}>{serverError}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {renderField('nombre', 'NOMBRE', 'Juan')}
            {renderField('apellido', 'APELLIDO', 'García')}
          </div>
          {renderField('correo', 'CORREO ELECTRÓNICO', 'tu@correo.com', 'email')}
          {renderField('password', 'CONTRASEÑA', '••••••••', 'password')}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...s.btn,
              marginTop: 4,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
          </button>
        </form>

        <p style={s.switchTxt}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#B8860B', fontWeight: 700 }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  bg: { minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { background: '#fff', width: '100%', maxWidth: 440, borderRadius: 16, padding: '44px 40px', boxShadow: '0 25px 70px rgba(0,0,0,0.45)' },
  title: { fontSize: '1.5rem', fontWeight: 900, color: '#111', textAlign: 'center', marginBottom: 6 },
  sub: { color: '#999', fontSize: '0.85rem', textAlign: 'center', marginBottom: 28 },
  label: { display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#999', letterSpacing: '1px', marginBottom: 7 },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #e5e5e5',
    borderRadius: 8,
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s'
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
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  btn: {
    padding: '14px',
    background: '#B8860B',
    color: '#111',
    border: 'none',
    borderRadius: 8,
    fontWeight: 900,
    fontSize: '0.88rem',
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'opacity 0.2s'
  },
  err: {
    background: '#fff5f5',
    border: '1px solid #fed7d7',
    color: '#c53030',
    padding: '12px 16px',
    borderRadius: 8,
    fontSize: '0.84rem',
    marginBottom: 10,
    textAlign: 'center'
  },
  switchTxt: { textAlign: 'center', color: '#999', fontSize: '0.84rem', marginTop: 24 }
};