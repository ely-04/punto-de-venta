import Product from '../models/Product.js';

// Crear un nuevo producto
export const crearProducto = async (req, res) => {
  try {
    const { codigo } = req.body;
    const productoExistente = await Product.findOne({ codigo });
    if (productoExistente) {
      return res.status(400).json({ message: `El producto con el código ${codigo} ya existe` });
    }

    const nuevoProducto = new Product(req.body);
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error('Error creating product:', error);
    const errorMessage = error.message || 'Error al crear el producto';
    const validationErrors = error.errors ? Object.values(error.errors).map(e => e.message) : [];
    res.status(400).json({ 
      message: errorMessage,
      validationErrors,
      details: error.toString()
    });
  }
};

// Obtener todos los productos con filtros
export const obtenerProductos = async (req, res) => {
  try {
    const { seccion } = req.query;
    const query = {};
    if (seccion) {
      query.seccion = seccion;
    }

    const productos = await Product.find(query)
      .populate('categoria', 'nombre')
      .populate('proveedor', 'nombre contacto');
    console.log('Productos encontrados:', productos.length); // Para debug
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener los productos', error });
  }
};

// Obtener un producto por ID
export const obtenerProductoById = async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id)
      .populate('categoria', 'nombre')
      .populate('proveedor', 'nombre contacto');
    if (!producto || !producto.activo) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el producto', error });
  }
};

// Actualizar un producto
export const actualizarProducto = async (req, res) => {
  try {
    const productoActualizado = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!productoActualizado) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(productoActualizado);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el producto', errors: error.errors });
  }
};

// Eliminar un producto (borrado lógico)
export const eliminarProducto = async (req, res) => {
  try {
    const producto = await Product.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto', error });
  }
};

