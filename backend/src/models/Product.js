import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  descripcion: {
    type: String,
    trim: true,
    default: '',
  },
  seccion: {
    type: String,
    required: true,
    enum: ['abarrotes', 'papeleria'],
  },
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  proveedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: false,
  },
  precios: {
    compra: {
      type: Number,
      required: true,
      default: 0,
    },
    venta: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  stockMinimo: {
    type: Number,
    default: 5,
  },
  imagen: String,
  activo: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Product', ProductSchema);

