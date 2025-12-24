import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  telefono: {
    type: String,
    trim: true,
    default: '',
  },
  direccion: {
    type: String,
    trim: true,
    default: '',
  },
  limiteCredito: {
    type: Number,
    default: 0,
  },
  saldoActual: {
    type: Number,
    default: 0,
  },
  activo: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Client', ClientSchema);
