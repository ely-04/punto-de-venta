import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetProductsQuery } from '@/features/products/services/productsApi';
import { useGetSalesQuery } from '@/features/sales/services/salesApi';
import { Package, AlertCircle, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const user = useSelector((state) => state?.auth?.user || null);
  const { data: products = [], isLoading: loadingProducts } = useGetProductsQuery();
  const { data: sales = [], isLoading: loadingSales, error: salesError } = useGetSalesQuery();

  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalSalesToday: 0,
    revenueToday: 0,
  });

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const salesToday = sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= today && sale.estadoVenta === 'completada';
    });

    const lowStock = products.filter((p) => p.stock <= (p.stockMinimo || 5));

    const revenue = salesToday.reduce((sum, sale) => sum + (sale.totales?.total || 0), 0);

    const newStats = {
      totalProducts: products.length,
      lowStockProducts: lowStock.length,
      totalSalesToday: salesToday.length,
      revenueToday: revenue,
    };

    setStats(newStats);
  }, [products, sales]);

  return (
    <div className="home-container p-6">
      {/* Welcome Section */}
      <div className="welcome-section mb-8 bg-gradient-to-r from-secondary-400 via-secondary-600 to-purple-700 text-white rounded-xl shadow-lg p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-gradient-to-t from-black to-transparent rounded-xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2 animate-fade-in">Bienvenido, {user?.nombre || 'Usuario'}</h1>
          <p className="text-white text-lg">Rol: <span className="font-semibold">{user?.rol || 'N/A'}</span></p>
          <p className="text-white text-sm mt-2 opacity-90">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Productos */}
        <div className="stat-card bg-white rounded-xl shadow-md p-6 border-l-4 border-success-500 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer hover:-translate-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm font-medium">Productos en Inventario</p>
              <p className="text-4xl font-bold text-neutral-900 mt-2">{stats.totalProducts}</p>
            </div>
            <div className="bg-success-100 p-4 rounded-lg">
              <Package className="text-success-600 animate-bounce-slow" size={32} />
            </div>
          </div>
        </div>

        {/* Stock Bajo */}
        <div className="stat-card bg-white rounded-xl shadow-md p-6 border-l-4 border-warning-500 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer hover:-translate-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm font-medium">Stock Bajo</p>
              <p className="text-4xl font-bold text-neutral-900 mt-2">{stats.lowStockProducts}</p>
            </div>
            <div className="bg-warning-100 p-4 rounded-lg">
              <AlertCircle className="text-warning-600 animate-pulse" size={32} />
            </div>
          </div>
        </div>

        {/* Ventas Hoy */}
        <div className="stat-card bg-white rounded-xl shadow-md p-6 border-l-4 border-secondary-500 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer hover:-translate-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm font-medium">Ventas Hoy</p>
              <p className="text-4xl font-bold text-neutral-900 mt-2">{stats.totalSalesToday}</p>
            </div>
            <div className="bg-secondary-100 p-4 rounded-lg">
              <ShoppingCart className="text-secondary-600 animate-bounce-slow" size={32} />
            </div>
          </div>
        </div>

        {/* Ingresos */}
        <div className="stat-card bg-white rounded-xl shadow-md p-6 border-l-4 border-primary-500 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer hover:-translate-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm font-medium">Ingresos Hoy</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">${stats.revenueToday.toFixed(2)}</p>
            </div>
            <div className="bg-primary-100 p-4 rounded-lg">
              <DollarSign className="text-primary-600 animate-bounce-slow" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
          <TrendingUp className="text-primary-600 animate-bounce-slow" size={28} />
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            to="/ventas" 
            className="action-btn bg-gradient-to-br from-accent-400 to-accent-600 text-white rounded-xl p-6 hover:shadow-2xl hover:scale-110 transition-all duration-300 hover:-translate-y-2 flex flex-col items-center justify-center gap-3 text-center group"
          >
            <ShoppingCart size={32} className="group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-semibold">Nueva Venta</span>
          </Link>
          <Link 
            to="/productos" 
            className="action-btn bg-gradient-to-br from-success-400 to-success-600 text-white rounded-xl p-6 hover:shadow-2xl hover:scale-110 transition-all duration-300 hover:-translate-y-2 flex flex-col items-center justify-center gap-3 text-center group"
          >
            <Package size={32} className="group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-semibold">Ver Productos</span>
          </Link>
          <Link 
            to="/reportes" 
            className="action-btn bg-gradient-to-br from-secondary-400 to-secondary-600 text-white rounded-xl p-6 hover:shadow-2xl hover:scale-110 transition-all duration-300 hover:-translate-y-2 flex flex-col items-center justify-center gap-3 text-center group"
          >
            <TrendingUp size={32} className="group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-semibold">Reportes</span>
          </Link>
          <Link 
            to="/corte-caja" 
            className="action-btn bg-gradient-to-br from-neutral-500 to-neutral-700 text-white rounded-xl p-6 hover:shadow-2xl hover:scale-110 transition-all duration-300 hover:-translate-y-2 flex flex-col items-center justify-center gap-3 text-center group"
          >
            <DollarSign size={32} className="group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-semibold">Corte de Caja</span>
          </Link>
        </div>
      </div>

      {/* Alert Stock Bajo */}
      {stats.lowStockProducts > 0 && (
        <div className="alert alert-warning flex items-start gap-3 bg-warning-50 border-l-4 border-warning-500 border border-warning-200 rounded-lg p-4 animate-slide-in">
          <AlertCircle className="text-warning-600 flex-shrink-0 mt-0.5 animate-bounce-slow" size={20} />
          <div className="flex-1">
            <h3 className="font-semibold text-warning-900 mb-1">⚠️ Productos con Stock Bajo</h3>
            <p className="text-warning-800 text-sm mb-2">Hay {stats.lowStockProducts} productos con stock bajo o agotado. Se recomienda realizar pedidos.</p>
            <Link to="/productos" className="text-warning-700 font-semibold hover:text-warning-900 text-sm underline hover:no-underline transition-all">
              Ver productos →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
