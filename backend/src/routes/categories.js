import { Router } from 'express';
import {
  crearCategoria,
  obtenerCategorias,
  actualizarCategoria,
  eliminarCategoria,
} from '../controllers/category.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminRequired } from '../middleware/permisos.js';
import { categoryValidator } from '../middleware/validators/category.validator.js';

const router = Router();

// GET: obtener categorías (solo requiere autenticación)
router.get('/', authMiddleware, obtenerCategorias);

// POST, PUT, DELETE: requieren rol de administrador
router.post('/', authMiddleware, adminRequired, categoryValidator, crearCategoria);
router.put('/:id', authMiddleware, adminRequired, categoryValidator, actualizarCategoria);
router.delete('/:id', authMiddleware, adminRequired, eliminarCategoria);

export default router;
