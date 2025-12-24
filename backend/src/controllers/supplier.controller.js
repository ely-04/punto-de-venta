import Supplier from '../models/Supplier.js';

// Obtener todos los proveedores
export const obtenerProveedores = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', estado = '' } = req.query;
    
    let query = {};
    
    // Filtrar por estado si se especifica
    if (estado) {
      query.estado = estado;
    }
    
    // Búsqueda por nombre, contacto o RFC
    if (search) {
      query.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { contacto: { $regex: search, $options: 'i' } },
        { 'informacionFiscal.rfc': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const proveedores = await Supplier.find(query)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit);

    const total = await Supplier.countDocuments(query);

    res.json({
      proveedores,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      totalProveedores: total
    });
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ 
      message: 'Error al obtener la lista de proveedores', 
      error: error.message 
    });
  }
};

// Obtener un proveedor por ID
export const obtenerProveedor = async (req, res) => {
  try {
    const proveedor = await Supplier.findById(req.params.id);
    
    if (!proveedor) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    res.json(proveedor);
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    res.status(500).json({ 
      message: 'Error al obtener el proveedor', 
      error: error.message 
    });
  }
};

// Crear un nuevo proveedor
export const crearProveedor = async (req, res) => {
  try {
    const {
      nombre,
      contacto,
      email,
      telefono,
      direccion,
      informacionFiscal,
      condicionesPago,
      diasCredito,
      descuentos,
      notas
    } = req.body;

    // Verificar si ya existe un proveedor con el mismo nombre
    const proveedorExistente = await Supplier.findOne({ 
      nombre: { $regex: `^${nombre}$`, $options: 'i' } 
    });
    
    if (proveedorExistente) {
      return res.status(400).json({ 
        message: 'Ya existe un proveedor con este nombre' 
      });
    }

    // Verificar RFC único si se proporciona
    if (informacionFiscal?.rfc) {
      const rfcExistente = await Supplier.findOne({ 
        'informacionFiscal.rfc': informacionFiscal.rfc 
      });
      
      if (rfcExistente) {
        return res.status(400).json({ 
          message: 'Ya existe un proveedor con este RFC' 
        });
      }
    }

    const nuevoProveedor = new Supplier({
      nombre,
      contacto,
      email,
      telefono,
      direccion,
      informacionFiscal,
      condicionesPago,
      diasCredito: condicionesPago === 'contado' ? 0 : diasCredito,
      descuentos: descuentos || [],
      notas
    });

    const proveedorGuardado = await nuevoProveedor.save();

    res.status(201).json({
      message: 'Proveedor creado exitosamente',
      proveedor: proveedorGuardado
    });
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({ 
      message: 'Error al crear el proveedor', 
      error: error.message 
    });
  }
};

// Actualizar un proveedor
export const actualizarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizacion = req.body;

    // Verificar si el proveedor existe
    const proveedor = await Supplier.findById(id);
    if (!proveedor) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    // Si se está cambiando el nombre, verificar que no exista otro con el mismo nombre
    if (datosActualizacion.nombre && datosActualizacion.nombre !== proveedor.nombre) {
      const nombreExistente = await Supplier.findOne({ 
        nombre: { $regex: `^${datosActualizacion.nombre}$`, $options: 'i' },
        _id: { $ne: id }
      });
      
      if (nombreExistente) {
        return res.status(400).json({ 
          message: 'Ya existe otro proveedor con este nombre' 
        });
      }
    }

    // Si se está cambiando el RFC, verificar que no exista otro con el mismo RFC
    if (datosActualizacion.informacionFiscal?.rfc) {
      const rfcExistente = await Supplier.findOne({ 
        'informacionFiscal.rfc': datosActualizacion.informacionFiscal.rfc,
        _id: { $ne: id }
      });
      
      if (rfcExistente) {
        return res.status(400).json({ 
          message: 'Ya existe otro proveedor con este RFC' 
        });
      }
    }

    // Ajustar días de crédito según condiciones de pago
    if (datosActualizacion.condicionesPago === 'contado') {
      datosActualizacion.diasCredito = 0;
    }

    const proveedorActualizado = await Supplier.findByIdAndUpdate(
      id,
      datosActualizacion,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Proveedor actualizado exitosamente',
      proveedor: proveedorActualizado
    });
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({ 
      message: 'Error al actualizar el proveedor', 
      error: error.message 
    });
  }
};

// Eliminar (desactivar) un proveedor
export const eliminarProveedor = async (req, res) => {
  try {
    const { id } = req.params;

    const proveedor = await Supplier.findById(id);
    if (!proveedor) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    // En lugar de eliminar, desactivamos el proveedor
    const proveedorDesactivado = await Supplier.findByIdAndUpdate(
      id,
      { estado: 'inactivo' },
      { new: true }
    );

    res.json({
      message: 'Proveedor desactivado exitosamente',
      proveedor: proveedorDesactivado
    });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({ 
      message: 'Error al eliminar el proveedor', 
      error: error.message 
    });
  }
};

// Reactivar un proveedor
export const reactivarProveedor = async (req, res) => {
  try {
    const { id } = req.params;

    const proveedor = await Supplier.findById(id);
    if (!proveedor) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    const proveedorReactivado = await Supplier.findByIdAndUpdate(
      id,
      { estado: 'activo' },
      { new: true }
    );

    res.json({
      message: 'Proveedor reactivado exitosamente',
      proveedor: proveedorReactivado
    });
  } catch (error) {
    console.error('Error al reactivar proveedor:', error);
    res.status(500).json({ 
      message: 'Error al reactivar el proveedor', 
      error: error.message 
    });
  }
};

// Obtener estadísticas de proveedores
export const obtenerEstadisticasProveedores = async (req, res) => {
  try {
    const totalProveedores = await Supplier.countDocuments();
    const proveedoresActivos = await Supplier.countDocuments({ estado: 'activo' });
    const proveedoresInactivos = await Supplier.countDocuments({ estado: 'inactivo' });
    
    const proveedoresPorCondicion = await Supplier.aggregate([
      { $match: { estado: 'activo' } },
      { $group: { _id: '$condicionesPago', total: { $sum: 1 } } }
    ]);

    res.json({
      totalProveedores,
      proveedoresActivos,
      proveedoresInactivos,
      porcentajeActivos: totalProveedores > 0 ? ((proveedoresActivos / totalProveedores) * 100).toFixed(2) : 0,
      proveedoresPorCondicion
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas de proveedores', 
      error: error.message 
    });
  }
};