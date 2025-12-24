import mongoose from 'mongoose';
import Supplier from '../src/models/Supplier.js';

const suppliersSeed = [
  {
    nombre: 'Distribuidora ABC S.A. de C.V.',
    contacto: 'Juan Carlos Méndez',
    email: 'ventas@distribuidoraabc.com',
    telefono: '555-123-4567',
    direccion: {
      calle: 'Av. Revolución 123',
      ciudad: 'Ciudad de México',
      codigoPostal: '06030',
      pais: 'México'
    },
    informacionFiscal: {
      rfc: 'DAB850123ABC',
      razonSocial: 'Distribuidora ABC S.A. de C.V.'
    },
    condicionesPago: 'credito_30',
    diasCredito: 30,
    notas: 'Proveedor principal de productos alimenticios'
  },
  {
    nombre: 'Tecnología y Equipos XYZ',
    contacto: 'María Elena Rodríguez',
    email: 'contacto@tecnoequiposxyz.com',
    telefono: '555-987-6543',
    direccion: {
      calle: 'Calle Industria 456',
      ciudad: 'Guadalajara',
      codigoPostal: '44100',
      pais: 'México'
    },
    informacionFiscal: {
      rfc: 'TEX900201XYZ',
      razonSocial: 'Tecnología y Equipos XYZ S.A.'
    },
    condicionesPago: 'credito_45',
    diasCredito: 45,
    notas: 'Especializado en equipos tecnológicos y electrónicos'
  },
  {
    nombre: 'Suministros Industriales DEF',
    contacto: 'Roberto García',
    email: 'ventas@suministrosdef.mx',
    telefono: '555-456-7890',
    direccion: {
      calle: 'Blvd. Industrial 789',
      ciudad: 'Monterrey',
      codigoPostal: '64000',
      pais: 'México'
    },
    informacionFiscal: {
      rfc: 'SID750515DEF',
      razonSocial: 'Suministros Industriales DEF S.A. de C.V.'
    },
    condicionesPago: 'contado',
    diasCredito: 0,
    notas: 'Proveedor de materiales industriales y herramientas'
  },
  {
    nombre: 'Alimentos Premium GHI',
    contacto: 'Ana Sofía López',
    email: 'pedidos@alimentospremium.com',
    telefono: '555-789-0123',
    direccion: {
      calle: 'Av. Central 321',
      ciudad: 'Puebla',
      codigoPostal: '72000',
      pais: 'México'
    },
    informacionFiscal: {
      rfc: 'APG820330GHI',
      razonSocial: 'Alimentos Premium GHI S.A.'
    },
    condicionesPago: 'credito_15',
    diasCredito: 15,
    notas: 'Productos gourmet y alimenticios de alta calidad'
  },
  {
    nombre: 'Limpieza Total JKL',
    contacto: 'Luis Fernando Torres',
    email: 'info@limpiezatotal.com',
    telefono: '555-321-0987',
    direccion: {
      calle: 'Calle Limpieza 654',
      ciudad: 'Tijuana',
      codigoPostal: '22000',
      pais: 'México'
    },
    informacionFiscal: {
      rfc: 'LTJ910815JKL',
      razonSocial: 'Limpieza Total JKL S. de R.L.'
    },
    condicionesPago: 'credito_30',
    diasCredito: 30,
    notas: 'Productos de limpieza e higiene'
  }
];

async function seedSuppliers() {
  try {
    // Conectar a MongoDB
    await mongoose.connect('mongodb://localhost:27017/pos');
    console.log('Conectado a MongoDB');

    // Limpiar proveedores existentes
    await Supplier.deleteMany({});
    console.log('Proveedores existentes eliminados');

    // Insertar nuevos proveedores
    const suppliers = await Supplier.insertMany(suppliersSeed);
    console.log(`${suppliers.length} proveedores creados exitosamente`);

    // Mostrar proveedores creados
    suppliers.forEach((supplier, index) => {
      console.log(`${index + 1}. ${supplier.nombre} - ${supplier.contacto}`);
    });

    await mongoose.connection.close();
    console.log('Conexión cerrada');
  } catch (error) {
    console.error('Error al poblar proveedores:', error);
    process.exit(1);
  }
}

seedSuppliers();