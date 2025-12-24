import { body } from 'express-validator';
import { handleValidationErrors } from './auth.validator.js';

export const cashcutValidator = [
    body('montoInicial').optional().isNumeric().withMessage('El monto inicial debe ser numérico.'),
    body('montoFinal').optional().isNumeric().withMessage('El monto final debe ser numérico.'),
    handleValidationErrors,
];
