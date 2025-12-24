import { body } from 'express-validator';
import { handleValidationErrors } from './auth.validator.js';

export const paymentValidator = [
    body('clienteId').isMongoId().withMessage('ID de cliente no válido.'),
    body('ventaId').isMongoId().withMessage('ID de venta no válido.'),
    body('monto').isNumeric().withMessage('El monto debe ser numérico.'),
    body('metodoPago').isIn(['efectivo', 'tarjeta', 'transferencia']).withMessage('Método de pago no válido.'),
    handleValidationErrors,
];
