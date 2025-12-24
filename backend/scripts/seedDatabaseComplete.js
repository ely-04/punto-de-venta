import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Importar modelos
import User from '../src/models/User.js';
import Category from '../src/models/Category.js';
import Client from '../src/models/Client.js';
import Product from '../src/models/Product.js';
import Sale from '../src/models/Sale.js';
import Payment from '../src/models/Payment.js';
import CashCut from '../src/models/CashCut.js';

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/pos');
    console.log('✅ MongoDB conectado a base de datos "pos"');
  } catch (error) {
    console.error('❌ Error conectando MongoDB:', error);
    process.exit(1);
  }
};

// Limpiar base de datos
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Category.deleteMany({});
    await Client.deleteMany({});
    await Product.deleteMany({});
    await Sale.deleteMany({});
    await Payment.deleteMany({});
    await CashCut.deleteMany({});
    console.log('🗑️ Base de datos limpiada');
  } catch (error) {
    console.error('❌ Error limpiando base de datos:', error);
  }
};

// Crear usuarios
const createUsers = async () => {
  try {
    const users = [
      {
        nombre: 'Administrador',
        email: 'admin@example.com',
        password: await bcrypt.hash('Admin123', 10),
        rol: 'admin',
        activo: true
      },
      {
        nombre: 'Cajero 1',
        email: 'cajero1@example.com',
        password: await bcrypt.hash('Cajero123', 10),
        rol: 'cajero',
        activo: true
      },
      {
        nombre: 'Reportes',
        email: 'reportes@example.com',
        password: await bcrypt.hash('Reportes123', 10),
        rol: 'reportes',
        activo: true
      }
    ];

    const usuariosCreados = await User.insertMany(users);
    console.log('✅ Usuarios creados:');
    usuariosCreados.forEach(user => {
      console.log(`   - ${user.nombre} (${user.email}) - Rol: ${user.rol}`);
    });

    return usuariosCreados;
  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
    return [];
  }
};

// Crear categorías
const createCategories = async () => {
  try {
    const categorias = [
      {
        nombre: 'Alimentos',
        seccion: 'abarrotes',
        descripcion: 'Productos alimenticios en general',
        activo: true
      },
      {
        nombre: 'Bebidas',
        seccion: 'abarrotes',
        descripcion: 'Bebidas refrescantes y naturales',
        activo: true
      },
      {
        nombre: 'Limpieza',
        seccion: 'abarrotes',
        descripcion: 'Productos de limpieza para el hogar',
        activo: true
      },
      {
        nombre: 'Lácteos',
        seccion: 'abarrotes',
        descripcion: 'Leche, yogurt, quesos',
        activo: true
      },
      {
        nombre: 'Cuadernos',
        seccion: 'papeleria',
        descripcion: 'Cuadernos y libretas',
        activo: true
      },
      {
        nombre: 'Útiles Escolares',
        seccion: 'papeleria',
        descripcion: 'Lápices, plumas y otros útiles',
        activo: true
      },
      {
        nombre: 'Papelería General',
        seccion: 'papeleria',
        descripcion: 'Papel, sobres, folders',
        activo: true
      }
    ];

    const categoriasCreadas = await Category.insertMany(categorias);
    console.log('✅ Categorías creadas:');
    categoriasCreadas.forEach(cat => {
      console.log(`   - ${cat.nombre} (${cat.seccion})`);
    });

    return categoriasCreadas;
  } catch (error) {
    console.error('❌ Error creando categorías:', error);
    return [];
  }
};

// Crear clientes
const createClients = async () => {
  try {
    const clientes = [
      {
        nombre: 'Cliente General',
        telefono: '',
        direccion: '',
        limiteCredito: 0,
        saldoActual: 0,
        activo: true
      },
      {
        nombre: 'Juan Pérez',
        telefono: '55-1234-5678',
        direccion: 'Calle Principal 123',
        limiteCredito: 5000,
        saldoActual: 0,
        activo: true
      },
      {
        nombre: 'María García',
        telefono: '55-2345-6789',
        direccion: 'Av. Central 456',
        limiteCredito: 3000,
        saldoActual: 0,
        activo: true
      },
      {
        nombre: 'Escuela Primaria',
        telefono: '55-3456-7890',
        direccion: 'Calle Educación 789',
        limiteCredito: 10000,
        saldoActual: 0,
        activo: true
      }
    ];

    const clientesCreados = await Client.insertMany(clientes);
    console.log('✅ Clientes creados:');
    clientesCreados.forEach(client => {
      console.log(`   - ${client.nombre} (Límite: $${client.limiteCredito})`);
    });

    return clientesCreados;
  } catch (error) {
    console.error('❌ Error creando clientes:', error);
    return [];
  }
};

// Crear productos
const createProducts = async (categorias) => {
  try {
    const alimentosId = categorias.find(c => c.nombre === 'Alimentos')?._id;
    const bebidasId = categorias.find(c => c.nombre === 'Bebidas')?._id;
    const limpiezaId = categorias.find(c => c.nombre === 'Limpieza')?._id;
    const lacteosId = categorias.find(c => c.nombre === 'Lácteos')?._id;
    const cuadernosId = categorias.find(c => c.nombre === 'Cuadernos')?._id;
    const utilesId = categorias.find(c => c.nombre === 'Útiles Escolares')?._id;
    const papeleriaId = categorias.find(c => c.nombre === 'Papelería General')?._id;

    const productos = [
      // Abarrotes - Alimentos
      {
        codigo: 'ALI001',
        nombre: 'Arroz Blanco 1kg',
        descripcion: 'Arroz blanco de primera calidad',
        seccion: 'abarrotes',
        categoria: alimentosId,
        precios: { compra: 15, venta: 25 },
        stock: 50,
        stockMinimo: 10,
        activo: true
      },
      {
        codigo: 'ALI002',
        nombre: 'Frijoles Negros 1kg',
        descripcion: 'Frijoles negros seleccionados',
        seccion: 'abarrotes',
        categoria: alimentosId,
        precios: { compra: 20, venta: 35 },
        stock: 30,
        stockMinimo: 5,
        activo: true
      },
      {
        codigo: 'ALI003',
        nombre: 'Aceite Vegetal 1L',
        descripcion: 'Aceite vegetal comestible',
        seccion: 'abarrotes',
        categoria: alimentosId,
        precios: { compra: 25, venta: 40 },
        stock: 25,
        stockMinimo: 5,
        activo: true
      },

      // Abarrotes - Bebidas
      {
        codigo: 'BEB001',
        nombre: 'Coca Cola 600ml',
        descripcion: 'Refresco de cola',
        seccion: 'abarrotes',
        categoria: bebidasId,
        precios: { compra: 12, venta: 20 },
        stock: 100,
        stockMinimo: 20,
        activo: true
      },
      {
        codigo: 'BEB002',
        nombre: 'Agua Natural 1L',
        descripcion: 'Agua purificada',
        seccion: 'abarrotes',
        categoria: bebidasId,
        precios: { compra: 5, venta: 10 },
        stock: 200,
        stockMinimo: 50,
        activo: true
      },

      // Abarrotes - Limpieza
      {
        codigo: 'LIM001',
        nombre: 'Jabón en Polvo 1kg',
        descripcion: 'Detergente para ropa',
        seccion: 'abarrotes',
        categoria: limpiezaId,
        precios: { compra: 30, venta: 50 },
        stock: 40,
        stockMinimo: 8,
        activo: true
      },
      {
        codigo: 'LIM002',
        nombre: 'Cloro 1L',
        descripcion: 'Blanqueador multiusos',
        seccion: 'abarrotes',
        categoria: limpiezaId,
        precios: { compra: 15, venta: 25 },
        stock: 35,
        stockMinimo: 10,
        activo: true
      },

      // Abarrotes - Lácteos
      {
        codigo: 'LAC001',
        nombre: 'Leche Entera 1L',
        descripcion: 'Leche pasteurizada',
        seccion: 'abarrotes',
        categoria: lacteosId,
        precios: { compra: 18, venta: 28 },
        stock: 60,
        stockMinimo: 15,
        activo: true
      },

      // Papelería - Cuadernos
      {
        codigo: 'CUA001',
        nombre: 'Cuaderno Profesional 100 hojas',
        descripcion: 'Cuaderno rayado profesional',
        seccion: 'papeleria',
        categoria: cuadernosId,
        precios: { compra: 12, venta: 20 },
        stock: 80,
        stockMinimo: 15,
        activo: true
      },
      {
        codigo: 'CUA002',
        nombre: 'Cuaderno Francés 200 hojas',
        descripcion: 'Cuaderno cuadriculado francés',
        seccion: 'papeleria',
        categoria: cuadernosId,
        precios: { compra: 25, venta: 40 },
        stock: 60,
        stockMinimo: 10,
        activo: true
      },

      // Papelería - Útiles
      {
        codigo: 'UTI001',
        nombre: 'Lápiz del No. 2',
        descripcion: 'Lápiz de grafito para escritura',
        seccion: 'papeleria',
        categoria: utilesId,
        precios: { compra: 3, venta: 5 },
        stock: 200,
        stockMinimo: 50,
        activo: true
      },
      {
        codigo: 'UTI002',
        nombre: 'Pluma BIC Azul',
        descripcion: 'Bolígrafo de tinta azul',
        seccion: 'papeleria',
        categoria: utilesId,
        precios: { compra: 5, venta: 8 },
        stock: 150,
        stockMinimo: 30,
        activo: true
      },
      {
        codigo: 'UTI003',
        nombre: 'Borrador Blanco',
        descripcion: 'Goma de borrar blanca',
        seccion: 'papeleria',
        categoria: utilesId,
        precios: { compra: 2, venta: 4 },
        stock: 100,
        stockMinimo: 20,
        activo: true
      },

      // Papelería General
      {
        codigo: 'PAP001',
        nombre: 'Hojas Blancas Carta 500pz',
        descripcion: 'Paquete de hojas bond blancas',
        seccion: 'papeleria',
        categoria: papeleriaId,
        precios: { compra: 45, venta: 70 },
        stock: 25,
        stockMinimo: 5,
        activo: true
      },
      {
        codigo: 'PAP002',
        nombre: 'Folder Tamaño Carta',
        descripcion: 'Folder de cartulina amarillo',
        seccion: 'papeleria',
        categoria: papeleriaId,
        precios: { compra: 2, venta: 4 },
        stock: 80,
        stockMinimo: 20,
        activo: true
      }
    ];

    const productosCreados = await Product.insertMany(productos);
    console.log('✅ Productos creados:');
    productosCreados.forEach(prod => {
      console.log(`   - ${prod.codigo}: ${prod.nombre} ($${prod.precios.venta})`);
    });

    return productosCreados;
  } catch (error) {
    console.error('❌ Error creando productos:', error);
    return [];
  }
};

// Ejecutar seed completo
const runFullSeed = async () => {
  await connectDB();
  
  console.log('🌱 Iniciando seed completo de la base de datos...\n');
  
  // Limpiar base de datos
  await clearDatabase();
  
  // Crear datos
  const usuarios = await createUsers();
  console.log('');
  
  const categorias = await createCategories();
  console.log('');
  
  const clientes = await createClients();
  console.log('');
  
  const productos = await createProducts(categorias);
  console.log('');
  
  // Resumen final
  console.log('✅ Seed completo exitoso!');
  console.log('');
  console.log('📊 Resumen de datos creados:');
  console.log(`   👥 Usuarios: ${usuarios.length}`);
  console.log(`   🏷️  Categorías: ${categorias.length}`);
  console.log(`   👤 Clientes: ${clientes.length}`);
  console.log(`   📦 Productos: ${productos.length}`);
  console.log('');
  console.log('🔑 Credenciales de acceso:');
  console.log('   Admin:    admin@example.com / Admin123');
  console.log('   Cajero:   cajero1@example.com / Cajero123');
  console.log('   Reportes: reportes@example.com / Reportes123');
  console.log('');
  console.log('🚀 ¡Sistema listo para usar!');
  
  process.exit(0);
};

runFullSeed();