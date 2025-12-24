import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logOut, selectCurrentUser } from '@/features/auth/authSlice';
import { Home, ShoppingCart, Package, LogOut as LogOutIcon, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar/Sidebar';
import './AdminLayout.css';

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirigir a login si no hay usuario
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  // Mostrar pantalla de carga mientras se verifica
  if (!user) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Cargando...</div>;
  }

  const handleLogout = () => {
    dispatch(logOut());
    navigate('/login', { replace: true });
  };

  return (
    <div className="admin-layout min-h-screen bg-neutral-50">
      {/* Navbar */}
      <nav className="navbar bg-white shadow-md border-b border-neutral-200">
        <div className="navbar-brand flex-1">
          <h2 className="text-2xl font-bold text-primary-600">📊 POS System</h2>
        </div>
        
        {/* Desktop Navigation */}
        <div className="navbar-links hidden md:flex gap-2">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              isActive 
                ? 'nav-link active bg-primary-100 text-primary-600 px-4 py-2 rounded-lg font-semibold flex items-center gap-2' 
                : 'nav-link text-neutral-600 hover:bg-neutral-100 px-4 py-2 rounded-lg font-medium flex items-center gap-2'
            }
          >
            <Home size={18} />
            <span>Inicio</span>
          </NavLink>
          <NavLink 
            to="ventas" 
            className={({ isActive }) => 
              isActive 
                ? 'nav-link active bg-primary-100 text-primary-600 px-4 py-2 rounded-lg font-semibold flex items-center gap-2' 
                : 'nav-link text-neutral-600 hover:bg-neutral-100 px-4 py-2 rounded-lg font-medium flex items-center gap-2'
            }
          >
            <ShoppingCart size={18} />
            <span>Ventas</span>
          </NavLink>
          <NavLink 
            to="productos" 
            className={({ isActive }) => 
              isActive 
                ? 'nav-link active bg-primary-100 text-primary-600 px-4 py-2 rounded-lg font-semibold flex items-center gap-2' 
                : 'nav-link text-neutral-600 hover:bg-neutral-100 px-4 py-2 rounded-lg font-medium flex items-center gap-2'
            }
          >
            <Package size={18} />
            <span>Productos</span>
          </NavLink>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-neutral-100 rounded-lg"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* User Section */}
        <div className="navbar-user hidden md:flex gap-4 items-center ml-4 pl-4 border-l border-neutral-200">
          <span className="user-name text-neutral-700 font-medium text-sm">{user?.nombre || 'Usuario'}</span>
          <button 
            onClick={handleLogout} 
            className="logout-btn btn btn-danger btn-sm flex items-center gap-2"
          >
            <LogOutIcon size={16} />
            <span>Cerrar</span>
          </button>
        </div>
      </nav>

      {/* Sidebar */}
      <Sidebar isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />
      
      {/* Sidebar Overlay para móviles */}
      {mobileMenuOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Content */}
      <div className="content md:ml-0">
        <Outlet />
      </div>
    </div>
  );
}
