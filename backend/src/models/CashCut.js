import mongoose from 'mongoose';

const CashCutSchema = new mongoose.Schema({
  fechaApertura: {
    type: Date,
    required: true,
    default: Date.now,
  },
  fechaCierre: {
    type: Date,
  },
  montoInicial: {
    type: Number,
    required: true,
  },
  montoFinal: {
    type: Number,
  },
  ventasIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
  }],
  totales: {
    abarrotes: { type: Number, default: 0 },
    papeleria: { type: Number, default: 0 },
    efectivo: { type: Number, default: 0 },
    tarjeta: { type: Number, default: 0 },
    transferencia: { type: Number, default: 0 },
    credito: { type: Number, default: 0 },
    totalVentas: { type: Number, default: 0 },
  },
  diferencia: {
    type: Number,
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  estado: {
    type: String,
    enum: ['abierta', 'cerrada'],
    default: 'abierta',
  },
}, {
  timestamps: true,
});

export default mongoose.model('CashCut', CashCutSchema);
