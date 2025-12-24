import mongoose from 'mongoose';
import Category from '../src/models/Category.js';
import User from '../src/models/User.js';
import bcrypt from 'bcryptjs';

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/pos_db');
    console.log('✅ MongoDB conectado');
  } catch (error) {
    console.error('❌ Error conectando MongoDB:', error);
    process.exit(1);
  }
};

const seedCategories = async () => {
  try {
    // Eliminar categorías existentes
    await Category.deleteMany({});
    console.log('🗑️ Categorías anteriores eliminadas');

    // Crear categorías nuevas
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
      }
    ];

    const categoriasCreadas = await Category.insertMany(categorias);
    console.log('✅ Categorías creadas:');
    categoriasCreadas.forEach(cat => {
      console.log(`   - ${cat.nombre} (ID: ${cat._id})`);
    });

    return categoriasCreadas;
  } catch (error) {
    console.error('❌ Error creando categorías:', error);
  }
};

const seedAdmin = async () => {
  try {
    // Verificar si ya existe un admin
    const adminExistente = await User.findOne({ email: 'admin@example.com' });
    if (adminExistente) {
      console.log('👤 Usuario admin ya existe');
      return adminExistente;
    }

    // Crear usuario admin
    const hashedPassword = await bcrypt.hash('Admin123', 10);
    const admin = new User({
      nombre: 'Administrador',
      email: 'admin@example.com',
      password: hashedPassword,
      rol: 'admin',
      activo: true
    });

    await admin.save();
    console.log('✅ Usuario admin creado: admin@example.com / Admin123');
    return admin;
  } catch (error) {
    console.error('❌ Error creando admin:', error);
  }
};

const runSeeder = async () => {
  await connectDB();
  
  console.log('🌱 Iniciando seed de la base de datos...\n');
  
  await seedCategories();
  await seedAdmin();
  
  console.log('\n✅ Seed completado exitosamente!');
  console.log('📝 Ahora puedes:');
  console.log('   1. Crear productos desde la interfaz');
  console.log('   2. Usar admin@example.com / Admin123 para login');
  
  process.exit(0);
};

runSeeder();