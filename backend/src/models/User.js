import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  // Información personal
  nombre: { type: String, required: true },
  apellido: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Rol y permisos
  rol: { 
    type: String, 
    enum: ['admin', 'cajero', 'reportes']
  },
  
  // Información del negocio
  caja: String,
  turno: { type: String, enum: ['mañana', 'tarde', 'noche'] },
  
  // Control de acceso
  estado: { type: Boolean, default: true },
  ultimoAcceso: Date,
  intentosFallidos: { type: Number, default: 0 },
  bloqueado: { type: Boolean, default: false },
  fechaBloqueado: Date,
  
  // Auditoría
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: String, // Usuario que lo creó
});

// Hash de contraseña antes de guardar
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcryptjs.hash(this.password, 10);
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (passwordIngresada) {
  return await bcryptjs.compare(passwordIngresada, this.password);
};

// Método para obtener datos públicos (sin contraseña)
UserSchema.methods.toJSON = function () {
  const { password, ...datosPublicos } = this.toObject();
  return datosPublicos;
};

export default mongoose.model('User', UserSchema);

