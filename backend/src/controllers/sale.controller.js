import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Client from '../models/Client.js';
import mongoose from 'mongoose';

// Función para generar número de venta único
const generarNumeroVenta = async () => {
  const ultimaVenta = await Sale.findOne().sort({ createdAt: -1 });
  const ultimoNumero = ultimaVenta ? parseInt(ultimaVenta.numero.split('-')[1]) : 0;
  return `VTA-${(ultimoNumero + 1).toString().padStart(6, '0')}`;
};

// Crear una nueva venta
export const crearVenta = async (req, res) => {
  try {
    const { 
      clienteId, 
      clienteNombre, 
      items, 
      metodoPago, 
      impuestos = 0,
      montoRecibido = 0,
      cambio = 0
    } = req.body;
    const usuarioId = req.usuario._id;

    // Validar que hay items
    if (!items || items.length === 0) {
      throw new Error('No se pueden procesar ventas sin productos');
    }

    let subtotal = 0;
    const itemsProcesados = [];

    for (const item of items) {
      const producto = await Product.findById(item.productoId);
      if (!producto) throw new Error(`Producto con ID ${item.productoId} no encontrado.`);
      if (producto.stock < item.cantidad) throw new Error(`Stock insuficiente para ${producto.nombre}.`);

      const itemSubtotal = producto.precios.venta * item.cantidad;
      subtotal += itemSubtotal;

      itemsProcesados.push({
        producto: item.productoId,
        codigo: producto.codigo,
        nombre: producto.nombre,
        cantidad: item.cantidad,
        precioUnitario: producto.precios.venta,
        subtotal: itemSubtotal,
        seccion: producto.seccion,
      });

      // Actualizar stock
      producto.stock -= item.cantidad;
      await producto.save();
    }

    const total = subtotal + impuestos;
    
    // Validar pago en efectivo
    if (metodoPago === 'efectivo' && montoRecibido < total) {
      throw new Error('El monto recibido es insuficiente');
    }

    let estadoPago = 'pagado';
    let clienteObj = null;

    // Manejar cliente (por ID o por nombre)
    if (clienteId) {
      clienteObj = await Client.findById(clienteId);
      if (!clienteObj) throw new Error('Cliente no encontrado.');
    } else if (clienteNombre && clienteNombre.trim()) {
      // Buscar cliente por nombre o crear uno nuevo
      clienteObj = await Client.findOne({ nombre: clienteNombre.trim() });
      if (!clienteObj) {
        clienteObj = new Client({
          nombre: clienteNombre.trim(),
          tipo: 'ocasional',
          contacto: { telefono: '', email: '' }
        });
        await clienteObj.save();
      }
    }

    // Manejar crédito si aplica
    if (metodoPago === 'credito') {
      if (!clienteObj) throw new Error('Se requiere un cliente para ventas a crédito.');
      if (clienteObj.saldoActual + total > clienteObj.limiteCredito) {
        throw new Error('El límite de crédito del cliente es insuficiente.');
      }
      clienteObj.saldoActual += total;
      await clienteObj.save();
      estadoPago = 'pendiente';
    }

    const nuevaVenta = new Sale({
      numero: await generarNumeroVenta(),
      cliente: clienteObj?._id || null,
      usuario: usuarioId,
      items: itemsProcesados,
      totales: { 
        subtotal, 
        impuestos, 
        total,
        montoRecibido: metodoPago === 'efectivo' ? montoRecibido : total,
        cambio: metodoPago === 'efectivo' ? cambio : 0
      },
      metodoPago,
      estadoPago,
      estadoVenta: 'completada'
    });

    await nuevaVenta.save();

    // Populated response para incluir detalles
    const ventaCompleta = await Sale.findById(nuevaVenta._id)
      .populate('cliente', 'nombre')
      .populate('usuario', 'nombre')
      .populate('items.producto', 'nombre codigo');

    res.status(201).json(ventaCompleta);
  } catch (error) {
    console.error('Error en crearVenta:', error);
    res.status(400).json({ message: error.message });
  }
};

// Obtener todas las ventas con filtros
export const obtenerVentas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, seccion } = req.query;
    const query = { estadoVenta: 'completada' };

    if (fechaInicio && fechaFin) {
      query.createdAt = { $gte: new Date(fechaInicio), $lte: new Date(fechaFin) };
    }
    if (seccion) {
      query['items.seccion'] = seccion;
    }

    const ventas = await Sale.find(query)
      .populate('cliente', 'nombre')
      .populate('usuario', 'nombre')
      .populate('items.producto', 'nombre');
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las ventas', error });
  }
};

// Obtener una venta por ID
export const obtenerVentaById = async (req, res) => {
  try {
    const venta = await Sale.findById(req.params.id)
      .populate('cliente', 'nombre telefono')
      .populate('usuario', 'nombre')
      .populate('items.producto', 'nombre codigo');
    if (!venta) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    res.json(venta);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la venta', error });
  }
};

// Cancelar una venta
export const cancelarVenta = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const venta = await Sale.findById(id).session(session);
    if (!venta) throw new Error('Venta no encontrada.');
    if (venta.estadoVenta === 'cancelada') throw new Error('La venta ya ha sido cancelada.');

    // Revertir stock
    for (const item of venta.items) {
      await Product.findByIdAndUpdate(item.producto, { $inc: { stock: item.cantidad } }, { session });
    }

    // Si fue a crédito, revertir saldo del cliente
    if (venta.metodoPago === 'credito' && venta.estadoPago !== 'pagado') {
      await Client.findByIdAndUpdate(venta.cliente, { $inc: { saldoActual: -venta.totales.total } }, { session });
    }

    venta.estadoVenta = 'cancelada';
    await venta.save({ session });

    await session.commitTransaction();
    res.json({ message: 'Venta cancelada correctamente.' });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// Obtener ventas por sección (para reportes)
export const obtenerVentasPorSeccion = async (req, res) => {
    try {
      const ventasAgrupadas = await Sale.aggregate([
        { $unwind: '$items' },
        { $match: { estadoVenta: 'completada' } },
        {
          $group: {
            _id: '$items.seccion',
            totalVendido: { $sum: '$items.subtotal' },
            cantidadProductos: { $sum: '$items.cantidad' },
          },
        },
        {
          $project: {
            _id: 0,
            seccion: '$_id',
            totalVendido: 1,
            cantidadProductos: 1,
          },
        },
      ]);
      res.json(ventasAgrupadas);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el reporte de ventas por sección', error });
    }
  };
  
