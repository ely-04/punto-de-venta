import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const loginValidator = [
  body('email').isEmail().withMessage('Debe ser un correo electrónico válido.'),
  body('password').notEmpty().withMessage('La contraseña es requerida.'),
  handleValidationErrors,
];

export const registerValidator = [
  body('nombre').notEmpty().withMessage('El nombre es requerido.'),
  body('email').isEmail().withMessage('Debe ser un correo electrónico válido.'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  body('rol').optional().isIn(['admin', 'cajero', 'reportes']).withMessage('Rol no válido.'),
  handleValidationErrors,
];
