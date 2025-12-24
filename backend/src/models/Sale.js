import mongoose from 'mongoose';

const SaleSchema = new mongoose.Schema({
  numero: {
    type: String,
    unique: true,
    required: true,
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    default: null,
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      codigo: { type: String, required: true },
      nombre: { type: String, required: true },
      cantidad: { type: Number, required: true, default: 1 },
      precioUnitario: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      seccion: { type: String, required: true, enum: ['abarrotes', 'papeleria'] },
    },
  ],
  totales: {
    subtotal: { type: Number, required: true, default: 0 },
    impuestos: { type: Number, default: 0 },
    total: { type: Number, required: true },
    montoRecibido: { type: Number, default: 0 },
    cambio: { type: Number, default: 0 },
  },
  metodoPago: {
    type: String,
    enum: ['efectivo', 'tarjeta', 'transferencia', 'credito'],
    required: true,
  },
  estadoPago: {
    type: String,
    enum: ['pagado', 'pendiente', 'parcial'],
    default: 'pagado',
  },
  estadoVenta: {
    type: String,
    enum: ['completada', 'cancelada'],
    default: 'completada',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Sale', SaleSchema);

