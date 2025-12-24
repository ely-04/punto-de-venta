import { Router } from 'express';
import {
  crearCliente,
  obtenerClientes,
  obtenerClienteById,
  actualizarCliente,
  eliminarCliente,
  obtenerCuentasPorCobrar,
} from '../controllers/client.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminRequired, cashierRequired } from '../middleware/permisos.js';
import { clientValidator } from '../middleware/validators/client.validator.js';

const router = Router();

// Rutas accesibles para Admin y Cajero/Empleado
router.get('/', authMiddleware, cashierRequired, obtenerClientes);
router.get('/:id', authMiddleware, cashierRequired, obtenerClienteById);
router.post('/', authMiddleware, cashierRequired, clientValidator, crearCliente);
router.put('/:id', authMiddleware, cashierRequired, clientValidator, actualizarCliente);

// Rutas solo para Admin
router.get('/cuentas-por-cobrar', authMiddleware, adminRequired, obtenerCuentasPorCobrar);
router.delete('/:id', authMiddleware, adminRequired, eliminarCliente);


export default router;
