// pages/AdminDashboard.jsx
import { useState, useEffect, useContext } from 'react';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';
import { 
  validateProduct, 
  validateImage, 
  validateUserId, 
  canDeleteUser 
} from '../utils/validators';

const TABS = ['Productos', 'Usuarios', 'Ventas'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('Productos');
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Form nuevo/editar producto
  const emptyProd = { nombre_producto: '', precio: '', stock: '', id_categoria: '', imagen: null };
  const [prodForm, setProdForm] = useState(emptyProd);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const { user } = useContext(AuthContext);

  useEffect(() => {
    loadTab();
  }, [tab]);

  const loadTab = async () => {
    setLoading(true);
    try {
      if (tab === 'Productos') {
        const r = await apiClient.get('/productos');
        setProductos(r.data);
      }
      if (tab === 'Usuarios') {
        const r = await apiClient.get('/auth/users');
        setUsuarios(r.data);
      }
      if (tab === 'Ventas') {
        const r = await apiClient.get('/ventas/todas');
        setVentas(r.data);
      }
    } catch (err) {
      toast('Error al cargar datos');
    }
    setLoading(false);
  };

  const toast = (txt, isError = false) => {
    setMsg(txt);
    setTimeout(() => setMsg(''), 3000);
  };

  // ——— PRODUCTOS ———
  const validateProductForm = () => {
    // Validar campos del producto
    const productValidation = validateProduct(prodForm);
    
    // Validar imagen si es nuevo producto
    let imageValidation = { isValid: true };
    if (!editId && !prodForm.imagen) {
      imageValidation = { isValid: false, error: 'La imagen es requerida para productos nuevos' };
    } else if (prodForm.imagen) {
      imageValidation = validateImage(prodForm.imagen, false);
    }
    
    setFormErrors({
      ...productValidation.errors,
      imagen: imageValidation.isValid ? '' : imageValidation.error
    });
    
    return productValidation.isValid && imageValidation.isValid;
  };

  const saveProd = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    if (!validateProductForm()) {
      toast('❌ Por favor, corrige los errores del formulario', true);
      return;
    }
    
    const data = new FormData();
    ['nombre_producto', 'precio', 'stock', 'id_categoria'].forEach(k => {
      if (prodForm[k]) data.append(k, prodForm[k]);
    });
    if (prodForm.imagen) data.append('imagen', prodForm.imagen);
    
    try {
      if (editId) {
        await apiClient.put(`/productos/${editId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast('✅ Producto actualizado');
      } else {
        await apiClient.post('/productos', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast('✅ Producto creado');
      }
      setProdForm(emptyProd);
      setEditId(null);
      setShowForm(false);
      setFormErrors({});
      loadTab();
    } catch (err) {
      toast(err.response?.data?.message || '❌ Error al guardar producto', true);
    }
  };

  const deleteProd = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await apiClient.delete(`/productos/${id}`);
      toast('✅ Producto eliminado');
      loadTab();
    } catch (err) {
      toast(err.response?.data?.error || '❌ No se pudo eliminar el producto', true);
    }
  };

  const startEdit = (p) => {
    setProdForm({
      nombre_producto: p.nombre_producto,
      precio: p.precio,
      stock: p.stock,
      id_categoria: p.id_categoria || '',
      imagen: null
    });
    setEditId(p.id_producto);
    setShowForm(true);
    setFormErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelForm = () => {
    setProdForm(emptyProd);
    setEditId(null);
    setShowForm(false);
    setFormErrors({});
  };

  // ——— USUARIOS ———
  const deleteUser = async (id) => {
    // Validar ID
    const idValidation = validateUserId(id);
    if (!idValidation.isValid) {
      toast(idValidation.error, true);
      return;
    }
    
    // Validar que no sea el propio usuario
    const selfDeleteValidation = canDeleteUser(id, user?.id_usuario);
    if (!selfDeleteValidation.isValid) {
      toast(selfDeleteValidation.error, true);
      return;
    }
    
    if (!window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await apiClient.delete(`/auth/users/${id}`);
      toast('✅ Usuario eliminado');
      loadTab();
    } catch (err) {
      toast(err.response?.data?.message || '❌ No se pudo eliminar el usuario', true);
    }
  };

  const toggleAdmin = async (u) => {
    const newRol = u.id_rol === 1 ? 2 : 1;
    const action = newRol === 1 ? 'dar permisos de administrador' : 'quitar permisos de administrador';
    
    if (!window.confirm(`¿Estás seguro de ${action} a ${u.nombre} ${u.apellido}?`)) {
      return;
    }
    
    try {
      await apiClient.put(`/auth/users/${u.id_usuario}`, {
        ...u,
        id_rol: newRol
      });
      toast(`✅ Rol actualizado: ${newRol === 1 ? 'Administrador' : 'Cliente'}`);
      loadTab();
    } catch (err) {
      toast('❌ Error al cambiar rol', true);
    }
  };

  // Renderizar campo de formulario con error
  const renderFormField = (key, label, type = 'text') => {
    const hasError = formErrors[key];
    
    return (
      <div key={key}>
        <label style={fl}>{label.toUpperCase()}</label>
        <input
          required={key !== 'id_categoria'}
          value={prodForm[key] || ''}
          onChange={e => {
            setProdForm({ ...prodForm, [key]: e.target.value });
            if (formErrors[key]) {
              setFormErrors({ ...formErrors, [key]: '' });
            }
          }}
          type={type}
          style={{
            ...fi,
            ...(hasError ? { borderColor: '#c53030', backgroundColor: '#fff5f5' } : {})
          }}
          placeholder={label}
        />
        {hasError && (
          <span style={{ display: 'block', color: '#c53030', fontSize: '0.7rem', marginTop: 4 }}>
            {formErrors[key]}
          </span>
        )}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '50px 4%' }} className="fade-in">

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ color: '#B8860B', fontSize: '0.72rem', letterSpacing: '3px', fontWeight: 700, marginBottom: 6 }}>
            PANEL DE CONTROL
          </p>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#111' }}>Administración</h1>
        </div>
        {tab === 'Productos' && (
          <button
            onClick={() => {
              if (showForm) cancelForm();
              else setShowForm(true);
            }}
            style={{
              background: '#111',
              color: '#B8860B',
              border: 'none',
              borderRadius: 8,
              padding: '11px 24px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              letterSpacing: '0.5px'
            }}
          >
            {showForm ? 'CANCELAR' : '+ NUEVO PRODUCTO'}
          </button>
        )}
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 30, background: '#f5f5f5', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '9px 24px',
              borderRadius: 8,
              border: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              letterSpacing: '0.5px',
              background: tab === t ? '#111' : 'transparent',
              color: tab === t ? '#B8860B' : '#777',
              transition: 'all 0.2s'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* FORM PRODUCTO */}
      {tab === 'Productos' && showForm && (
        <form onSubmit={saveProd} style={{ background: '#fff', borderRadius: 14, padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: 28 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 900, color: '#111', marginBottom: 22 }}>
            {editId ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 16 }}>
            {renderFormField('nombre_producto', 'Nombre del Producto')}
            {renderFormField('precio', 'Precio (S/)', 'number')}
            {renderFormField('stock', 'Stock', 'number')}
            {renderFormField('id_categoria', 'ID Categoría', 'number')}
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={fl}>IMAGEN</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                setProdForm({ ...prodForm, imagen: e.target.files[0] });
                if (formErrors.imagen) {
                  setFormErrors({ ...formErrors, imagen: '' });
                }
              }}
              style={{
                ...fi,
                padding: '10px',
                cursor: 'pointer',
                ...(formErrors.imagen ? { borderColor: '#c53030', backgroundColor: '#fff5f5' } : {})
              }}
            />
            {formErrors.imagen && (
              <span style={{ display: 'block', color: '#c53030', fontSize: '0.7rem', marginTop: 4 }}>
                {formErrors.imagen}
              </span>
            )}
            {prodForm.imagen && !formErrors.imagen && (
              <span style={{ display: 'block', color: '#38a169', fontSize: '0.7rem', marginTop: 4 }}>
                ✓ Archivo seleccionado: {prodForm.imagen.name}
              </span>
            )}
          </div>
          <button
            type="submit"
            style={{
              marginTop: 20,
              padding: '12px 28px',
              background: '#B8860B',
              color: '#111',
              border: 'none',
              borderRadius: 8,
              fontWeight: 900,
              cursor: 'pointer',
              fontSize: '0.88rem'
            }}
          >
            {editId ? 'ACTUALIZAR' : 'CREAR PRODUCTO'}
          </button>
        </form>
      )}

      {/* TOAST */}
      {msg && (
        <div style={{
          position: 'fixed',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          background: msg.includes('✅') ? '#1a1a1a' : '#c53030',
          border: `1px solid ${msg.includes('✅') ? '#B8860B' : '#fed7d7'}`,
          color: msg.includes('✅') ? '#fff' : '#fff',
          padding: '13px 26px',
          borderRadius: 10,
          zIndex: 999,
          fontSize: '0.88rem'
        }}>
          {msg}
        </div>
      )}

      {loading ? <div className="loading-page"><div className="spinner"/></div> : (

        <>
          {/* ——— TABLA PRODUCTOS ——— */}
          {tab === 'Productos' && (
            <div style={tableWrap}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9f9f9' }}>
                    {['ID', 'Imagen', 'Nombre', 'Precio', 'Stock', 'Categoría', 'Acciones'].map(h => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productos.map(p => (
                    <tr key={p.id_producto} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={td}><span style={{ fontWeight: 700, color: '#aaa' }}>#{p.id_producto}</span></td>
                      <td style={td}>
                        <div style={{ width: 44, height: 44, borderRadius: 6, overflow: 'hidden', background: '#f0f0f0' }}>
                          <img
                            src={`http://localhost:5000${p.imagen_url}`}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      </td>
                      <td style={td}><span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.nombre_producto}</span></td>
                      <td style={td}><span style={{ color: '#B8860B', fontWeight: 700 }}>S/ {parseFloat(p.precio).toFixed(2)}</span></td>
                      <td style={td}>
                        <span style={{
                          background: p.stock > 0 ? '#f0fdf4' : '#fff5f5',
                          color: p.stock > 0 ? '#166534' : '#c53030',
                          padding: '3px 10px',
                          borderRadius: 12,
                          fontSize: '0.78rem',
                          fontWeight: 700
                        }}>
                          {p.stock}
                        </span>
                      </td>
                      <td style={td}><span style={{ color: '#888', fontSize: '0.82rem' }}>{p.id_categoria || '—'}</span></td>
                      <td style={td}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => startEdit(p)} style={btnEdit}>Editar</button>
                          <button onClick={() => deleteProd(p.id_producto)} style={btnDel}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ——— TABLA USUARIOS ——— */}
          {tab === 'Usuarios' && (
            <div style={tableWrap}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9f9f9' }}>
                    {['ID', 'Nombre', 'Apellido', 'Correo', 'Rol', 'Acciones'].map(h => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id_usuario} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={td}><span style={{ fontWeight: 700, color: '#aaa' }}>#{u.id_usuario}</span></td>
                      <td style={td}>{u.nombre}</td>
                      <td style={td}>{u.apellido}</td>
                      <td style={td}><span style={{ color: '#555', fontSize: '0.88rem' }}>{u.correo}</span></td>
                      <td style={td}>
                        <span style={{
                          background: u.id_rol === 1 ? '#111' : '#f5f5f5',
                          color: u.id_rol === 1 ? '#B8860B' : '#555',
                          padding: '4px 12px',
                          borderRadius: 20,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          letterSpacing: '0.5px'
                        }}>
                          {u.id_rol === 1 ? 'ADMIN' : 'CLIENTE'}
                        </span>
                      </td>
                      <td style={td}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => toggleAdmin(u)} style={btnEdit}>
                            {u.id_rol === 1 ? 'Quitar admin' : 'Hacer admin'}
                          </button>
                          <button 
                            onClick={() => deleteUser(u.id_usuario)} 
                            style={btnDel}
                            disabled={user?.id_usuario === u.id_usuario}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ——— TABLA VENTAS ——— */}
          {tab === 'Ventas' && (
            <div style={tableWrap}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9f9f9' }}>
                    {['Pedido', 'Cliente', 'Total', 'Fecha'].map(h => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ventas.map(v => (
                    <tr key={v.id_pedido} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={td}><span style={{ fontWeight: 700 }}>#{v.id_pedido}</span></td>
                      <td style={td}>{v.nombre} {v.apellido}</td>
                      <td style={td}><span style={{ color: '#B8860B', fontWeight: 700 }}>S/ {parseFloat(v.total).toFixed(2)}</span></td>
                      <td style={td}>
                        <span style={{ color: '#888', fontSize: '0.85rem' }}>
                          {new Date(v.fecha_pedido).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const tableWrap = { background: '#fff', borderRadius: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.07)', overflow: 'auto' };
const th = { padding: '14px 18px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#888', letterSpacing: '1px', whiteSpace: 'nowrap' };
const td = { padding: '14px 18px', fontSize: '0.88rem', color: '#333', verticalAlign: 'middle' };
const btnEdit = { padding: '6px 14px', background: '#f5f5f5', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.76rem', color: '#555' };
const btnDel = { padding: '6px 14px', background: '#fff5f5', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.76rem', color: '#c53030' };
const fl = { display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#999', letterSpacing: '1px', marginBottom: 7 };
const fi = { width: '100%', padding: '11px 13px', border: '1.5px solid #e5e5e5', borderRadius: 8, fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };