import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Menu,
  X,
  Home,
  ShoppingCart,
  Package,
  BarChart3,
  Users,
  Settings,
  ChevronDown,
  Truck,
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ isOpen, setIsOpen }) {
  const user = useSelector((state) => state?.auth?.user);
  const [expandedMenus, setExpandedMenus] = useState({});

  useEffect(() => {
    console.log('===== SIDEBAR RE-RENDER =====');
    console.log('Current user:', user);
    console.log('User role:', user?.role);
  }, [user]);

  const toggleSubmenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const allMenuItems = [
    {
      name: 'Dashboard',
      icon: Home,
      path: '/',
      roles: ['admin', 'cajero', 'reportes'],
    },
    {
      name: 'Ventas',
      icon: ShoppingCart,
      path: '/ventas',
      roles: ['admin', 'cajero'],
      submenu: [
        { name: 'Nueva Venta', path: '/ventas' },
        { name: 'Historial', path: '/ventas/historial' },
      ],
    },
    {
      name: 'Productos',
      icon: Package,
      path: '/productos',
      roles: ['admin', 'cajero'],
      submenu: [
        { name: 'Inventario', path: '/productos' },
        { name: 'Categorías', path: '/productos/categorias' },
      ],
    },
    {
      name: 'Proveedores',
      icon: Truck,
      path: '/proveedores',
      roles: ['admin'],
    },
    {
      name: 'Reportes',
      icon: BarChart3,
      path: '/reportes',
      roles: ['admin', 'reportes'],
      submenu: [
        { name: 'Ventas', path: '/reportes' },
        { name: 'Inventario', path: '/reportes/inventario' },
      ],
    },
    {
      name: 'Clientes',
      icon: Users,
      path: '/clientes',
      roles: ['admin', 'cajero'],
    },
    {
      name: 'Configuración',
      icon: Settings,
      path: '/configuracion',
      roles: ['admin'],
    },
  ];

  // Filtrar items por rol del usuario
  const menuItems = allMenuItems.filter((item) => {
    if (!item.roles) return true;
    const hasAccess = item.roles.includes(user?.role);
    return hasAccess;
  });

  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">📊 POS</h1>
          <button
            className="sidebar-close md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div key={item.name} className="sidebar-menu-item">
              {item.submenu ? (
                <>
                  <button
                    className="sidebar-link group"
                    onClick={() => toggleSubmenu(item.name)}
                  >
                    <item.icon size={20} />
                    <span className="flex-1 text-left">{item.name}</span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-300 ${
                        expandedMenus[item.name] ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedMenus[item.name] && (
                    <div className="sidebar-submenu">
                      {item.submenu.map((submenu) => (
                        <NavLink
                          key={submenu.path}
                          to={submenu.path}
                          className={({ isActive }) =>
                            `sidebar-sublink ${isActive ? 'active' : ''}`
                          }
                          onClick={() => setIsOpen(false)}
                        >
                          {submenu.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </NavLink>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
