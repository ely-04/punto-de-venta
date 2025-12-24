import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import Client from '../models/Client.js';
import Sale from '../models/Sale.js';

// Función para generar número de recibo único
const generarNumeroRecibo = async () => {
  const ultimoPago = await Payment.findOne().sort({ createdAt: -1 });
  const ultimoNumero = ultimoPago ? parseInt(ultimoPago.numeroRecibo.split('-')[1]) : 0;
  return `REC-${(ultimoNumero + 1).toString().padStart(6, '0')}`;
};

// Registrar un nuevo pago/abono
export const registrarPago = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { clienteId, ventaId, monto, metodoPago } = req.body;

    const cliente = await Client.findById(clienteId).session(session);
    if (!cliente) throw new Error('Cliente no encontrado.');
    if (cliente.saldoActual <= 0) throw new Error('El cliente no tiene saldo pendiente.');
    if (monto > cliente.saldoActual) throw new Error('El monto del pago no puede ser mayor que el saldo actual.');

    const venta = await Sale.findById(ventaId).session(session);
    if (!venta) throw new Error('Venta no encontrada.');
    
    // Calcular el saldo pendiente de la venta específica
    const pagosAnteriores = await Payment.find({ venta: ventaId }).session(session);
    const totalPagadoVenta = pagosAnteriores.reduce((acc, pago) => acc + pago.monto, 0);
    const saldoVenta = venta.totales.total - totalPagadoVenta;

    if (monto > saldoVenta) throw new Error(`El monto excede el saldo pendiente de la venta, que es de ${saldoVenta.toFixed(2)}.`);

    // Actualizar saldo del cliente
    cliente.saldoActual -= monto;
    await cliente.save({ session });

    // Actualizar estado de la venta si se liquida
    if (Math.abs((saldoVenta - monto)) < 0.01) { // Usar tolerancia para flotantes
      venta.estadoPago = 'pagado';
    } else {
      venta.estadoPago = 'parcial';
    }
    await venta.save({ session });

    // Crear el registro del pago
    const nuevoPago = new Payment({
      numeroRecibo: await generarNumeroRecibo(),
      venta: ventaId,
      cliente: clienteId,
      monto,
      metodoPago,
    });
    await nuevoPago.save({ session });

    await session.commitTransaction();
    res.status(201).json({ message: 'Pago registrado exitosamente', pago: nuevoPago });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// Obtener historial de pagos de un cliente
export const obtenerPagosCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;
    const pagos = await Payment.find({ cliente: clienteId })
      .populate('venta', 'numero totales')
      .sort({ createdAt: -1 });
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los pagos del cliente', error });
  }
};

// Obtener historial completo de pagos
export const obtenerHistorialPagos = async (req, res) => {
  try {
    const historial = await Payment.find()
      .populate('cliente', 'nombre')
      .populate('venta', 'numero')
      .sort({ createdAt: -1 });
    res.json(historial);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el historial de pagos', error });
  }
};
