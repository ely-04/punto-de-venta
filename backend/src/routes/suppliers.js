import { Router } from 'express';
import {
  obtenerProveedores,
  obtenerProveedor,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
  reactivarProveedor,
  obtenerEstadisticasProveedores
} from '../controllers/supplier.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminRequired } from '../middleware/permisos.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas públicas (para usuarios autenticados)
router.get('/', obtenerProveedores);
router.get('/estadisticas', obtenerEstadisticasProveedores);
router.get('/:id', obtenerProveedor);

// Rutas que requieren permisos de administrador
router.post('/', adminRequired, crearProveedor);
router.put('/:id', adminRequired, actualizarProveedor);
router.delete('/:id', adminRequired, eliminarProveedor);
router.patch('/:id/reactivar', adminRequired, reactivarProveedor);

export default router;