import { Router } from 'express';
import {
  abrirCaja,
  cerrarCaja,
  obtenerCajaActual,
  obtenerHistorialCajas,
} from '../controllers/cashcut.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminRequired, cashierRequired } from '../middleware/permisos.js';
import { cashcutValidator } from '../middleware/validators/cashcut.validator.js';

const router = Router();

// Permitir que administradores y cajeros manejen cortes de caja
router.use(authMiddleware);

router.post('/abrir', cashierRequired, cashcutValidator, abrirCaja);
router.post('/cerrar', cashierRequired, cashcutValidator, cerrarCaja);
router.get('/actual', cashierRequired, obtenerCajaActual);
router.get('/historial', obtenerHistorialCajas);

export default router;
