import User from '../models/User.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Registro de un nuevo usuario
export const register = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol, caja, turno } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo electrónico ya está en uso' });
    }

    // Crear el nuevo usuario
    const newUser = new User({
      nombre,
      apellido,
      email,
      password,
      rol,
      caja,
      turno,
      createdBy: req.usuario?.id, // Opcional: si se requiere auditoría
    });

    await newUser.save();

    // Generar token JWT igual que en login
    const token = jwt.sign({ id: newUser._id, rol: newUser.rol }, process.env.JWT_SECRET, {
      expiresIn: '8h',
    });

    return res.status(201).json({ 
      token, 
      user: {
        ...newUser.toJSON(),
        role: newUser.rol // Alias para compatibilidad con frontend
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al registrar el usuario', error: error?.message || error });
  }
};

// Inicio de sesión
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar al usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si la cuenta está bloqueada
    if (user.bloqueado) {
      return res.status(403).json({ message: 'La cuenta está bloqueada' });
    }

    // Comparar contraseñas
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Incrementar intentos fallidos y bloquear si es necesario
      user.intentosFallidos += 1;
      if (user.intentosFallidos >= 5) {
        user.bloqueado = true;
        user.fechaBloqueado = Date.now();
      }
      await user.save();
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Restablecer intentos fallidos
    user.intentosFallidos = 0;
    user.ultimoAcceso = Date.now();
    await user.save();

    // Generar token JWT
    const token = jwt.sign({ id: user._id, rol: user.rol }, process.env.JWT_SECRET, {
      expiresIn: '8h',
    });

    return res.json({ 
      token, 
      user: {
        ...user.toJSON(),
        role: user.rol // Alias para compatibilidad con frontend
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al iniciar sesión', error: error?.message || error });
  }
};

// Obtener el perfil del usuario actual
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.usuario.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    return res.json({
      ...user.toJSON(),
      role: user.rol // Alias para compatibilidad con frontend
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener el perfil', error: error?.message || error });
  }
};
