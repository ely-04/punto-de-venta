import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la categoría es obligatorio'],
    trim: true,
    unique: true,
  },
  seccion: {
    type: String,
    required: [true, 'La sección es obligatoria'],
    enum: ['abarrotes', 'papeleria'],
  },
  descripcion: {
    type: String,
    trim: true,
  },
  activo: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true, // Agrega createdAt y updatedAt
});

export default mongoose.model('Category', CategorySchema);
