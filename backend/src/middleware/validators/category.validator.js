import { body } from 'express-validator';
import { handleValidationErrors } from './auth.validator.js';

export const categoryValidator = [
    body('nombre').notEmpty().withMessage('El nombre es requerido.'),
    body('seccion').isIn(['abarrotes', 'papeleria']).withMessage('Sección no válida.'),
    handleValidationErrors,
];
