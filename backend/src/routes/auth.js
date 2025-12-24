import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { loginValidator, registerValidator } from '../middleware/validators/auth.validator.js';

const router = Router();

// Rutas de autenticación
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.get('/profile', authMiddleware, getProfile);

export default router;
