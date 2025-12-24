import { Router } from 'express';
import {
  crearVenta,
  obtenerVentas,
  obtenerVentaById,
  cancelarVenta,
  obtenerVentasPorSeccion,
} from '../controllers/sale.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminRequired, cashierRequired } from '../middleware/permisos.js';
import { saleValidator } from '../middleware/validators/sale.validator.js';

const router = Router();

// Rutas de Ventas
router.post('/', authMiddleware, cashierRequired, saleValidator, crearVenta);
router.get('/', authMiddleware, cashierRequired, obtenerVentas);
router.get('/reporte-seccion', authMiddleware, adminRequired, obtenerVentasPorSeccion);
router.get('/:id', authMiddleware, cashierRequired, obtenerVentaById);
router.patch('/:id/cancelar', authMiddleware, adminRequired, cancelarVenta);

export default router;

