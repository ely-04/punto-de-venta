import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { adminRequired } from '../middleware/permisos.js';
import {
    ventasPorFecha,
    ventasPorSeccion,
    productosMasVendidos,
    cuentasPorCobrar,
    inventarioBajo,
    resumenVentas
} from '../controllers/reports.controller.js';

const router = Router();

// Todas las rutas de reportes requieren ser admin
router.use(authMiddleware, adminRequired);

router.get('/ventas-por-fecha', ventasPorFecha);
router.get('/ventas-por-seccion', ventasPorSeccion);
router.get('/productos-mas-vendidos', productosMasVendidos);
router.get('/cuentas-por-cobrar', cuentasPorCobrar);
router.get('/inventario-bajo', inventarioBajo);
router.get('/resumen-ventas', resumenVentas);

export default router;
