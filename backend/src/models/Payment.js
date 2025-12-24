import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  venta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    required: true,
  },
  metodoPago: {
    type: String,
    required: true,
    enum: ['efectivo', 'tarjeta', 'transferencia', 'credito'],
    default: 'efectivo',
  },
  monto: {
    type: Number,
    required: true,
    default: 0,
  },
  referencia: {
    type: String,
    trim: true,
    default: '',
  },
  observaciones: {
    type: String,
    trim: true,
    default: '',
  },
  estado: {
    type: String,
    enum: ['pendiente', 'completado', 'cancelado'],
    default: 'completado',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Payment', PaymentSchema);
