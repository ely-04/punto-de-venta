import mongoose from 'mongoose';
import CashCut from '../models/CashCut.js';
import Sale from '../models/Sale.js';
import Payment from '../models/Payment.js';

// Abrir un nuevo corte de caja
export const abrirCaja = async (req, res) => {
  try {
    console.log('🔥 abrirCaja called:', { user: req.usuario?.id || req.user?.id, body: req.body });
    
    const { montoInicial } = req.body;
    const usuarioId = req.usuario?.id || req.user?.id;

    // Verificar si ya hay una caja abierta
    const cajaAbierta = await CashCut.findOne({ usuario: usuarioId, estado: 'abierta' });
    if (cajaAbierta) {
      console.log('❌ Ya hay caja abierta:', cajaAbierta._id);
      return res.status(400).json({ message: 'Ya tienes una caja abierta. Debes cerrarla antes de abrir una nueva.' });
    }

    // Crear nuevo corte de caja
    const nuevoCorte = new CashCut({
      montoInicial: Number(montoInicial) || 0,
      usuario: usuarioId,
      fechaApertura: new Date(),
      estado: 'abierta'
    });

    const corteSaved = await nuevoCorte.save();
    console.log('✅ Caja abierta exitosamente:', corteSaved._id);
    
    res.status(201).json({ 
      message: 'Caja abierta exitosamente.', 
      corte: corteSaved 
    });
  } catch (error) {
    console.error('💥 Error al abrir la caja:', error);
    res.status(500).json({ 
      message: 'Error al abrir la caja', 
      error: error.message 
    });
  }
};

// Cerrar el corte de caja actual
export const cerrarCaja = async (req, res) => {
  try {
    console.log('🔥 cerrarCaja called:', { user: req.usuario?.id || req.user?.id, body: req.body });
    
    const { montoFinal } = req.body;
    const usuarioId = req.usuario?.id || req.user?.id;

    // Buscar corte abierto
    const corte = await CashCut.findOne({ usuario: usuarioId, estado: 'abierta' });
    if (!corte) {
      console.log('❌ No hay caja abierta para el usuario:', usuarioId);
      return res.status(404).json({ message: 'No hay ninguna caja abierta para este usuario.' });
    }

    // Obtener ventas realizadas durante el corte
    const ventas = await Sale.find({ 
      createdAt: { $gte: corte.fechaApertura }, 
      estadoVenta: 'completada' 
    });

    // Calcular totales
    let totalEfectivo = 0;
    let totalTarjeta = 0;
    let totalTransferencia = 0;
    let totalVentas = 0;

    ventas.forEach(venta => {
      const total = venta.totales?.total || 0;
      totalVentas += total;
      
      if (venta.metodoPago === 'efectivo') totalEfectivo += total;
      else if (venta.metodoPago === 'tarjeta') totalTarjeta += total;
      else if (venta.metodoPago === 'transferencia') totalTransferencia += total;
    });

    // Calcular diferencia
    const montoEsperado = corte.montoInicial + totalEfectivo;
    const diferencia = Number(montoFinal) - montoEsperado;

    // Actualizar corte
    corte.fechaCierre = new Date();
    corte.montoFinal = Number(montoFinal);
    corte.ventasIds = ventas.map(v => v._id);
    corte.totales = {
      efectivo: totalEfectivo,
      tarjeta: totalTarjeta,
      transferencia: totalTransferencia,
      totalVentas
    };
    corte.diferencia = diferencia;
    corte.estado = 'cerrada';

    const corteCerrado = await corte.save();

    console.log('✅ Caja cerrada exitosamente:', {
      id: corteCerrado._id,
      montoInicial: corte.montoInicial,
      montoFinal: Number(montoFinal),
      diferencia
    });

    res.json({ 
      message: 'Caja cerrada exitosamente.', 
      corte: corteCerrado 
    });

  } catch (error) {
    console.error('💥 Error al cerrar la caja:', error);
    res.status(500).json({ 
      message: 'Error al cerrar la caja', 
      error: error.message 
    });
  }
};

// Obtener el corte de caja actual (abierto)
export const obtenerCajaActual = async (req, res) => {
  try {
    const corte = await CashCut.findOne({ 
      usuario: req.usuario?.id || req.user?.id, 
      estado: 'abierta' 
    }).populate('usuario', 'nombre email');
    
    if (!corte) {
      return res.status(404).json({ message: 'No hay una caja abierta para este usuario.' });
    }
    
    res.json(corte);
  } catch (error) {
    console.error('Error al obtener la caja actual:', error);
    res.status(500).json({ 
      message: 'Error al obtener la caja actual', 
      error: error.message 
    });
  }
};

// Obtener historial de cortes de caja
export const obtenerHistorialCajas = async (req, res) => {
  try {
    console.log('🔥 obtenerHistorialCajas called:', { user: req.usuario?.id || req.user?.id, role: req.usuario?.role });
    
    const usuarioId = req.usuario?.id || req.user?.id;
    const userRole = req.usuario?.role;
    
    // Si es admin, muestra todos los cortes, si no, solo los del usuario
    const filter = userRole === 'admin' ? {} : { usuario: usuarioId };
    
    const historial = await CashCut.find(filter)
      .populate('usuario', 'nombre email')
      .sort({ createdAt: -1 });
    
    console.log('✅ Historial encontrado:', historial.length, 'cortes');
    res.json(historial);
  } catch (error) {
    console.error('Error al obtener historial de cajas:', error);
    res.status(500).json({ 
      message: 'Error al obtener el historial de cajas', 
      error: error.message 
    });
  }
};
