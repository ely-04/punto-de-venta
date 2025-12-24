import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  contacto: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  telefono: {
    type: String,
    required: true,
    trim: true
  },
  direccion: {
    calle: {
      type: String,
      trim: true
    },
    ciudad: {
      type: String,
      trim: true
    },
    codigoPostal: {
      type: String,
      trim: true
    },
    pais: {
      type: String,
      trim: true,
      default: 'México'
    }
  },
  informacionFiscal: {
    rfc: {
      type: String,
      trim: true,
      uppercase: true
    },
    razonSocial: {
      type: String,
      trim: true
    }
  },
  condicionesPago: {
    type: String,
    enum: ['contado', 'credito_15', 'credito_30', 'credito_45', 'credito_60'],
    default: 'contado'
  },
  diasCredito: {
    type: Number,
    default: 0
  },
  descuentos: [{
    categoria: {
      type: String,
      required: true
    },
    porcentaje: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  }],
  estado: {
    type: String,
    enum: ['activo', 'inactivo'],
    default: 'activo'
  },
  notas: {
    type: String,
    trim: true
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  },
  ultimaCompra: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para búsquedas eficientes
supplierSchema.index({ nombre: 1 });
supplierSchema.index({ estado: 1 });
supplierSchema.index({ 'informacionFiscal.rfc': 1 });

// Virtual para obtener el nombre completo de contacto
supplierSchema.virtual('nombreCompleto').get(function() {
  return `${this.nombre} - ${this.contacto}`;
});

// Middleware para validar RFC si se proporciona
supplierSchema.pre('save', function(next) {
  if (this.informacionFiscal?.rfc) {
    const rfcPattern = /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    if (!rfcPattern.test(this.informacionFiscal.rfc)) {
      const error = new Error('RFC no tiene un formato válido');
      error.name = 'ValidationError';
      return next(error);
    }
  }
  next();
});

export default mongoose.model('Supplier', supplierSchema);