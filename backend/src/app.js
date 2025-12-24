import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import salesRouter from './routes/sales.js';
import usersRouter from './routes/users.js';
import categoriesRouter from './routes/categories.js';
import clientsRouter from './routes/clients.js';
import paymentsRouter from './routes/payments.js';
import cashcutsRouter from './routes/cashcuts.js';
import reportsRouter from './routes/reports.js';
import suppliersRouter from './routes/suppliers.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

// Middlewares de seguridad
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limita cada IP a 100 peticiones por ventana
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Conectar a MongoDB
connectDB();

// Configuración de CORS robusta (incluye Authorization y preflight)
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

// Rutas
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/cashcuts', cashcutsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/suppliers', suppliersRouter);

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
