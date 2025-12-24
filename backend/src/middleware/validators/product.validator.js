import { body } from 'express-validator';
import { handleValidationErrors } from './auth.validator.js';

export const productValidator = [
    body('codigo').notEmpty().withMessage('El código es requerido.'),
    body('nombre').notEmpty().withMessage('El nombre es requerido.'),
    body('seccion').isIn(['abarrotes', 'papeleria']).withMessage('Sección no válida.'),
    body('categoria').isMongoId().withMessage('ID de categoría no válido.'),
    body('precios.compra').isNumeric().withMessage('El precio de compra debe ser un número.'),
    body('precios.venta').isNumeric().withMessage('El precio de venta debe ser un número.'),
    body('stock').isNumeric().withMessage('El stock debe ser un número.'),
    handleValidationErrors,
];
