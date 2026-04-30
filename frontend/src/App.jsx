// =============================================
// App.jsx — Culinaria Store
// Rutas conectadas al backend real
// =============================================
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Páginas
import Home        from './pages/Home';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Catalogo    from './pages/Catalogo';
import ProductDetail from './pages/ProductDetail';
import Cart        from './pages/Cart';
import MyOrders    from './pages/MyOrders';
import Profile     from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import NotFound    from './pages/NotFound';

// ——— Rutas protegidas ———
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="loading-page"><div className="spinner"/></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="loading-page"><div className="spinner"/></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.rol !== 1) return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <main className="page-wrapper">
        <Routes>
          {/* Públicas */}
          <Route path="/"              element={<Home />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/register"      element={<Register />} />
          <Route path="/catalogo"      element={<Catalogo />} />
          <Route path="/producto/:id"  element={<ProductDetail />} />

          {/* Cliente autenticado */}
          <Route path="/carrito"       element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/mis-pedidos"   element={<PrivateRoute><MyOrders /></PrivateRoute>} />
          <Route path="/perfil"        element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* Solo Admin */}
          <Route path="/admin"         element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* 404 */}
          <Route path="*"              element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
