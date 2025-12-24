import { body } from 'express-validator';
import { handleValidationErrors } from './auth.validator.js';

export const clientValidator = [
    body('nombre').notEmpty().withMessage('El nombre es requerido.'),
    body('limiteCredito').optional().isNumeric().withMessage('El límite de crédito debe ser numérico.'),
    handleValidationErrors,
];
