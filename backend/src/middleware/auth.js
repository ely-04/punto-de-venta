import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No hay token, autorización denegada' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    
    // Adjuntar el usuario completo al request
    const usuario = await User.findById(decoded.id).select('-password');
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    req.usuario = usuario;
    next();
  } catch (error) {
    console.error('Error en el middleware de autenticación:', error);
    res.status(401).json({ message: 'Token no es válido' });
  }
};
