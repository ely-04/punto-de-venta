import { Router } from 'express';
import {
  crearProducto,
  obtenerProductos,
  obtenerProductoById,
  actualizarProducto,
  eliminarProducto,
} from '../controllers/product.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminRequired } from '../middleware/permisos.js';

const router = Router();

// Rutas para Productos
router.get('/', authMiddleware, obtenerProductos);
router.get('/:id', authMiddleware, obtenerProductoById);

// Solo el admin puede crear, actualizar y eliminar (SIN validadores por ahora)
router.post('/', authMiddleware, adminRequired, crearProducto);
router.put('/:id', authMiddleware, adminRequired, actualizarProducto);
router.delete('/:id', authMiddleware, adminRequired, eliminarProducto);

export default router;

