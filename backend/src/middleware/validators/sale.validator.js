import { body } from 'express-validator';
import { handleValidationErrors } from './auth.validator.js';

export const saleValidator = [
    body('clienteId').optional().isMongoId().withMessage('ID de cliente no válido.'),
    body('clienteNombre').optional().isString().withMessage('Nombre de cliente debe ser texto.'),
    body('items').isArray({ min: 1 }).withMessage('La venta debe tener al menos un item.'),
    body('items.*.productoId').isMongoId().withMessage('ID de producto no válido.'),
    body('items.*.cantidad').isNumeric().withMessage('La cantidad debe ser numérica.'),
    body('metodoPago').isIn(['efectivo', 'tarjeta', 'transferencia', 'credito']).withMessage('Método de pago no válido.'),
    body('montoRecibido').optional().isNumeric().withMessage('Monto recibido debe ser numérico.'),
    body('cambio').optional().isNumeric().withMessage('Cambio debe ser numérico.'),
    handleValidationErrors,
];
