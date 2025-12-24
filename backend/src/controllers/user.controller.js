import User from '../models/User.js';

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error });
  }
};

// Obtener un usuario por ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el usuario', error });
  }
};

// Actualizar un usuario
export const updateUser = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    if (password) {
      return res.status(400).json({ message: 'La contraseña no se puede actualizar por esta vía' });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el usuario', error });
  }
};

// Desactivar/Activar un usuario
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    user.estado = !user.estado;
    await user.save();
    res.json({ message: `Usuario ${user.estado ? 'activado' : 'desactivado'} correctamente` });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar el estado del usuario', error });
  }
};
