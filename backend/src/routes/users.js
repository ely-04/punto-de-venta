import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
} from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminRequired } from '../middleware/permisos.js';
import { registerValidator } from '../middleware/validators/auth.validator.js'; // Reutilizamos el register validator

const router = Router();

// Rutas de usuarios (solo para admin)
router.use(authMiddleware, adminRequired);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser); // Aquí se podría añadir un validador específico si se quisiera
router.patch('/:id/status', toggleUserStatus);

// Para crear un empleado, usamos una ruta diferente a /auth/register
// para mantener la lógica separada.
import { register } from '../controllers/auth.controller.js';
router.post('/create-employee', registerValidator, register);


export default router;
