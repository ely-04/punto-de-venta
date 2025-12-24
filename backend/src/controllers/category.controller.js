import Category from '../models/Category.js';
import Product from '../models/Product.js';

// Crear una nueva categoría
export const crearCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;
    const categoriaExistente = await Category.findOne({ nombre });
    if (categoriaExistente) {
      return res.status(400).json({ message: `La categoría '${nombre}' ya existe.` });
    }

    const nuevaCategoria = new Category(req.body);
    await nuevaCategoria.save();
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la categoría', errors: error.errors });
  }
};

// Obtener todas las categorías
export const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await Category.find({});
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las categorías', error });
  }
};

// Actualizar una categoría
export const actualizarCategoria = async (req, res) => {
  try {
    const categoriaActualizada = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!categoriaActualizada) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.json(categoriaActualizada);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar la categoría', errors: error.errors });
  }
};

// Eliminar una categoría (borrado lógico)
export const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si algún producto está usando esta categoría
    const productoConCategoria = await Product.findOne({ categoria: id, activo: true });
    if (productoConCategoria) {
      return res.status(400).json({ message: 'No se puede eliminar la categoría porque está en uso por uno o más productos.' });
    }

    const categoria = await Category.findByIdAndUpdate(id, { activo: false }, { new: true });
    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la categoría', error });
  }
};
