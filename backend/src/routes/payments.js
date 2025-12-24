import { Router } from 'express';
import {
  registrarPago,
  obtenerPagosCliente,
  obtenerHistorialPagos,
} from '../controllers/payment.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminRequired, cashierRequired } from '../middleware/permisos.js';
import { paymentValidator } from '../middleware/validators/payment.validator.js';

const router = Router();

// Rutas para Pagos/Abonos
router.post('/', authMiddleware, cashierRequired, paymentValidator, registrarPago);
router.get('/cliente/:clienteId', authMiddleware, cashierRequired, obtenerPagosCliente);

// Ruta solo para Admin
router.get('/historial', authMiddleware, adminRequired, obtenerHistorialPagos);

export default router;
