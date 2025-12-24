import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  useOpenCashCutMutation, 
  useCloseCashCutMutation, 
  useGetActiveCashCutQuery 
} from '@/features/cashcuts/services/cashCutsApi';
import { useGetSalesQuery } from '@/features/sales/services/salesApi';
import './CashCut.css';

export default function CashCut() {
  const user = useSelector((state) => state?.auth?.user);
  const { data: activeCashCut, isLoading: loadingCashCut, refetch } = useGetActiveCashCutQuery();
  const { data: sales = [] } = useGetSalesQuery();
  const [openCashCut, { isLoading: isOpening }] = useOpenCashCutMutation();
  const [closeCashCut, { isLoading: isClosing }] = useCloseCashCutMutation();
  
  const [montoInicial, setMontoInicial] = useState('');
  const [montoFinal, setMontoFinal] = useState('');

  // Debug logging
  console.log('CashCut Debug:', {
    activeCashCut,
    loadingCashCut,
    hasActiveCashCut: !!activeCashCut
  });

  // Calcular ventas del día actual para la caja abierta
  const salesDuringCashCut = activeCashCut ? sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt);
    const cashCutDate = new Date(activeCashCut.fechaApertura);
    return saleDate >= cashCutDate && sale.metodoPago === 'efectivo' && sale.estadoVenta === 'completada';
  }) : [];

  const ventasEfectivo = salesDuringCashCut.reduce((sum, sale) => sum + (sale.totales?.total || 0), 0);
  const montoEsperado = activeCashCut ? activeCashCut.montoInicial + ventasEfectivo : 0;
  const diferencia = montoFinal ? parseFloat(montoFinal) - montoEsperado : 0;

  const abrirCaja = async () => {
    if (!montoInicial || parseFloat(montoInicial) < 0) {
      alert('Por favor ingresa un monto inicial válido');
      return;
    }

    try {
      const result = await openCashCut({ 
        montoInicial: parseFloat(montoInicial) 
      }).unwrap();
      
      console.log('Caja abierta exitosamente:', result);
      alert('Caja abierta exitosamente');
      setMontoInicial('');
      
      // Refetch de la caja actual para actualizar el estado
      setTimeout(() => {
        refetch();
      }, 100);
    } catch (error) {
      console.error('Error al abrir la caja:', error);
      alert('Error al abrir la caja: ' + (error.data?.message || error.message));
    }
  };

  const cerrarCaja = async () => {
    if (!montoFinal || parseFloat(montoFinal) < 0) {
      alert('Por favor ingresa el monto final válido');
      return;
    }

    try {
      const result = await closeCashCut({ 
        montoFinal: parseFloat(montoFinal) 
      }).unwrap();
      
      console.log('Caja cerrada exitosamente:', result);
      
      const resumen = `Caja cerrada exitosamente\n\nMonto inicial: $${activeCashCut.montoInicial.toFixed(2)}\nVentas en efectivo: $${ventasEfectivo.toFixed(2)}\nMonto esperado: $${montoEsperado.toFixed(2)}\nMonto final: $${parseFloat(montoFinal).toFixed(2)}\nDiferencia: $${diferencia.toFixed(2)}\n\n${diferencia === 0 ? '✅ Cuadra perfecto' : diferencia > 0 ? '📈 Sobrante' : '📉 Faltante'}`;
      
      alert(resumen);
      setMontoFinal('');
      
      // Refetch múltiple y más agresivo
      refetch();
      setTimeout(() => {
        refetch();
      }, 200);
      setTimeout(() => {
        refetch();
      }, 500);
      // Recargar la página como último recurso
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error al cerrar la caja:', error);
      alert('Error al cerrar la caja: ' + (error.data?.message || error.message));
    }
  };

  if (loadingCashCut) {
    return (
      <div className="cashcut-container">
        <div className="loading-state">
          <h2>🔄 Cargando estado de caja...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="cashcut-container">
      <div className="cashcut-header">
        <h1>💰 Corte de Caja</h1>
        <div className="user-info">
          <span>👤 {user?.nombre}</span>
          <span className="role-badge">{user?.rol}</span>
        </div>
      </div>

      {!activeCashCut ? (
        // Abrir Caja
        <div className="cashcut-card">
          <div className="cashcut-status closed">
            <h2>🔐 Caja Cerrada</h2>
            <p>No hay una caja abierta actualmente</p>
          </div>

          <div className="cashcut-form">
            <h3>🚀 Abrir Caja</h3>
            <div className="form-group">
              <label htmlFor="montoInicial">Monto Inicial</label>
              <div className="money-input">
                <span className="currency">$</span>
                <input
                  type="number"
                  id="montoInicial"
                  value={montoInicial}
                  onChange={(e) => setMontoInicial(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={isOpening}
                />
              </div>
            </div>
            <button 
              className="btn-primary"
              onClick={abrirCaja}
              disabled={isOpening || !montoInicial}
            >
              {isOpening ? '⏳ Abriendo...' : '🔓 Abrir Caja'}
            </button>
          </div>
        </div>
      ) : (
        // Caja Abierta - Mostrar resumen y opción de cerrar
        <div className="cashcut-card">
          <div className="cashcut-status open">
            <h2>🟢 Caja Abierta</h2>
            <p>Abierta desde: {new Date(activeCashCut.fechaApertura).toLocaleString()}</p>
            <p>Por: {activeCashCut.usuario?.nombre}</p>
          </div>

          <div className="cashcut-summary">
            <div className="summary-row">
              <span>💵 Monto inicial:</span>
              <span className="amount">${activeCashCut.montoInicial.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>🛒 Ventas en efectivo:</span>
              <span className="amount">${ventasEfectivo.toFixed(2)}</span>
            </div>
            <div className="summary-row highlight">
              <span>📊 Monto esperado:</span>
              <span className="amount">${montoEsperado.toFixed(2)}</span>
            </div>
            {salesDuringCashCut.length > 0 && (
              <div className="sales-detail">
                <small>📋 {salesDuringCashCut.length} venta(s) en efectivo realizadas</small>
              </div>
            )}
          </div>

          <div className="cashcut-form">
            <h3>🔒 Cerrar Caja</h3>
            <div className="form-group">
              <label htmlFor="montoFinal">Monto Final (contado físicamente)</label>
              <div className="money-input">
                <span className="currency">$</span>
                <input
                  type="number"
                  id="montoFinal"
                  value={montoFinal}
                  onChange={(e) => setMontoFinal(e.target.value)}
                  placeholder={montoEsperado.toFixed(2)}
                  min="0"
                  step="0.01"
                  disabled={isClosing}
                />
              </div>
            </div>

            {montoFinal && (
              <div className={`difference-preview ${diferencia === 0 ? 'exact' : diferencia > 0 ? 'surplus' : 'deficit'}`}>
                <strong>
                  Diferencia: ${Math.abs(diferencia).toFixed(2)} 
                  {diferencia === 0 ? ' ✅ Cuadra perfecto' : diferencia > 0 ? ' 📈 Sobrante' : ' 📉 Faltante'}
                </strong>
              </div>
            )}

            <button 
              className={`btn-secondary ${diferencia < 0 ? 'warning' : ''}`}
              onClick={cerrarCaja}
              disabled={isClosing || !montoFinal}
            >
              {isClosing ? '⏳ Cerrando...' : '🔐 Cerrar Caja'}
            </button>
          </div>
        </div>
      )}

      <div className="cashcut-tips">
        <h4>💡 Consejos</h4>
        <ul>
          <li>🔍 Siempre cuenta físicamente el dinero antes de cerrar la caja</li>
          <li>📝 El sistema calcula automáticamente el monto esperado basado en las ventas en efectivo</li>
          <li>⚠️ Las diferencias deben investigarse y documentarse</li>
          <li>📊 Todos los cortes quedan registrados para auditoría</li>
        </ul>
      </div>
    </div>
  );
}