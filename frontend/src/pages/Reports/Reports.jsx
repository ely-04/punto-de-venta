import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useGetSalesQuery } from '@/features/sales/services/salesApi';
import { useGetCashCutsQuery } from '@/features/cashcuts/services/cashCutsApi';
import './Reports.css';

export default function Reports() {
  const user = useSelector((state) => state?.auth?.user);
  const { data: sales = [], isLoading: loadingSales } = useGetSalesQuery();
  const { data: cashcuts = [], isLoading: loadingCashCuts, error: cashCutsError } = useGetCashCutsQuery();
  const [selectedPeriod, setSelectedPeriod] = useState('hoy');
  const [searchTerm, setSearchTerm] = useState('');

  // Debug logging
  console.log('Reports Debug:', {
    sales: sales.length,
    cashcuts: cashcuts.length,
    loadingCashCuts,
    cashCutsError,
    rawCashcuts: cashcuts
  });

  // Filtrar datos según el período seleccionado
  const filteredData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    const month = new Date(now.getFullYear(), now.getMonth(), 1);

    const filterByPeriod = (data, dateField) => {
      return data.filter(item => {
        const itemDate = new Date(item[dateField]);
        switch (selectedPeriod) {
          case 'hoy':
            return itemDate >= today;
          case 'semana':
            return itemDate >= week;
          case 'mes':
            return itemDate >= month;
          default:
            return true;
        }
      });
    };

    return {
      sales: filterByPeriod(sales, 'createdAt'),
      cashcuts: filterByPeriod(cashcuts, 'fechaApertura')
    };
  }, [sales, cashcuts, selectedPeriod]);

  // Filtrar ventas por término de búsqueda
  const filteredSales = useMemo(() => {
    if (!searchTerm) return filteredData.sales;
    
    return filteredData.sales.filter(sale => 
      sale._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.productos?.some(p => 
        p.producto?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [filteredData.sales, searchTerm]);

  // Cálculos y estadísticas
  const stats = useMemo(() => {
    const salesData = filteredData.sales;
    const completedSales = salesData.filter(sale => sale.estadoVenta === 'completada');
    
    // Ventas totales
    const totalVentas = completedSales.length;
    const ingresosTotales = completedSales.reduce((sum, sale) => sum + (sale.totales?.total || 0), 0);
    
    // Por método de pago
    const efectivo = completedSales.filter(s => s.metodoPago === 'efectivo').reduce((sum, sale) => sum + (sale.totales?.total || 0), 0);
    const tarjeta = completedSales.filter(s => s.metodoPago === 'tarjeta').reduce((sum, sale) => sum + (sale.totales?.total || 0), 0);
    const transferencia = completedSales.filter(s => s.metodoPago === 'transferencia').reduce((sum, sale) => sum + (sale.totales?.total || 0), 0);
    
    // Productos más vendidos
    const productCounts = {};
    completedSales.forEach(sale => {
      sale.productos?.forEach(item => {
        const productName = item.producto?.nombre || 'Producto desconocido';
        productCounts[productName] = (productCounts[productName] || 0) + item.cantidad;
      });
    });
    
    const topProducts = Object.entries(productCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));

    // Promedio por venta
    const promedioVenta = totalVentas > 0 ? ingresosTotales / totalVentas : 0;

    // Cortes de caja
    const cortesTotales = filteredData.cashcuts.length;
    const cortesAbiertos = filteredData.cashcuts.filter(c => !c.fechaCierre).length;
    
    return {
      totalVentas,
      ingresosTotales,
      efectivo,
      tarjeta, 
      transferencia,
      topProducts,
      promedioVenta,
      cortesTotales,
      cortesAbiertos
    };
  }, [filteredData]);

  const periodLabels = {
    hoy: 'Hoy',
    semana: 'Esta semana',
    mes: 'Este mes'
  };

  if (loadingSales || loadingCashCuts) {
    return (
      <div className="reports-container">
        <div className="loading-state">
          <h2>📊 Cargando reportes...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>📊 Reportes Financieros</h1>
        <div className="user-info">
          <span>👤 {user?.nombre}</span>
          <span className="role-badge">{user?.rol}</span>
        </div>
      </div>

      {/* Selector de período */}
      <div className="period-selector">
        <h3>📅 Período de análisis:</h3>
        <div className="period-buttons">
          {Object.entries(periodLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedPeriod(key)}
              className={`period-btn ${selectedPeriod === key ? 'active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="stats-grid">
        <div className="stat-card sales">
          <div className="stat-header">
            <h3>🛒 Ventas</h3>
            <span className="period">{periodLabels[selectedPeriod]}</span>
          </div>
          <div className="stat-number">{stats.totalVentas}</div>
          <div className="stat-detail">Promedio: ${stats.promedioVenta.toFixed(2)}</div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-header">
            <h3>💰 Ingresos</h3>
            <span className="period">{periodLabels[selectedPeriod]}</span>
          </div>
          <div className="stat-number">${stats.ingresosTotales.toFixed(2)}</div>
          <div className="stat-detail">Total facturado</div>
        </div>

        <div className="stat-card cash">
          <div className="stat-header">
            <h3>💵 Efectivo</h3>
            <span className="period">{periodLabels[selectedPeriod]}</span>
          </div>
          <div className="stat-number">${stats.efectivo.toFixed(2)}</div>
          <div className="stat-detail">En caja</div>
        </div>

        <div className="stat-card cashcuts">
          <div className="stat-header">
            <h3>📋 Cortes</h3>
            <span className="period">{periodLabels[selectedPeriod]}</span>
          </div>
          <div className="stat-number">{stats.cortesTotales}</div>
          <div className="stat-detail">{stats.cortesAbiertos} abierto(s)</div>
        </div>
      </div>

      {/* Métodos de pago */}
      <div className="payment-methods-section">
        <h3>💳 Distribución por método de pago</h3>
        <div className="payment-grid">
          <div className="payment-card">
            <div className="payment-icon">💵</div>
            <div className="payment-info">
              <div className="payment-name">Efectivo</div>
              <div className="payment-amount">${stats.efectivo.toFixed(2)}</div>
              <div className="payment-percentage">
                {stats.ingresosTotales > 0 ? ((stats.efectivo / stats.ingresosTotales) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>

          <div className="payment-card">
            <div className="payment-icon">💳</div>
            <div className="payment-info">
              <div className="payment-name">Tarjeta</div>
              <div className="payment-amount">${stats.tarjeta.toFixed(2)}</div>
              <div className="payment-percentage">
                {stats.ingresosTotales > 0 ? ((stats.tarjeta / stats.ingresosTotales) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>

          <div className="payment-card">
            <div className="payment-icon">🏦</div>
            <div className="payment-info">
              <div className="payment-name">Transferencia</div>
              <div className="payment-amount">${stats.transferencia.toFixed(2)}</div>
              <div className="payment-percentage">
                {stats.ingresosTotales > 0 ? ((stats.transferencia / stats.ingresosTotales) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Productos más vendidos */}
      <div className="top-products-section">
        <h3>🏆 Productos más vendidos</h3>
        <div className="products-list">
          {stats.topProducts.length > 0 ? (
            stats.topProducts.map((product, index) => (
              <div key={product.name} className="product-item">
                <div className="product-rank">#{index + 1}</div>
                <div className="product-name">{product.name}</div>
                <div className="product-quantity">{product.quantity} unidades</div>
              </div>
            ))
          ) : (
            <div className="no-data">No hay datos de productos para este período</div>
          )}
        </div>
      </div>

      {/* Búsqueda y lista de ventas */}
      <div className="sales-section">
        <h3>🔍 Detalle de ventas - {periodLabels[selectedPeriod]}</h3>
        <div className="search-section">
          <input
            type="text"
            placeholder="Buscar por ID, cliente o producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="sales-table">
          {filteredSales.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Productos</th>
                  <th>Método</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale._id}>
                    <td className="sale-id">{sale._id?.slice(-6) || 'N/A'}</td>
                    <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                    <td>{sale.cliente?.nombre || 'Cliente general'}</td>
                    <td className="products-cell">
                      {sale.productos?.length || 0} producto(s)
                    </td>
                    <td>
                      <span className={`payment-badge ${sale.metodoPago}`}>
                        {sale.metodoPago}
                      </span>
                    </td>
                    <td className="total-amount">${(sale.totales?.total || 0).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${sale.estadoVenta}`}>
                        {sale.estadoVenta}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-sales">
              {searchTerm 
                ? `No se encontraron ventas que coincidan con "${searchTerm}"`
                : `No hay ventas registradas para ${periodLabels[selectedPeriod].toLowerCase()}`
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}