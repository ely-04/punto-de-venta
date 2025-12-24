import Client from '../models/Client.js';

// Crear un nuevo cliente
export const crearCliente = async (req, res) => {
  try {
    const nuevoCliente = new Client(req.body);
    await nuevoCliente.save();
    res.status(201).json(nuevoCliente);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el cliente', errors: error.errors });
  }
};

// Obtener todos los clientes
export const obtenerClientes = async (req, res) => {
  try {
    const clientes = await Client.find({ activo: true });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los clientes', error });
  }
};

// Obtener un cliente por ID
export const obtenerClienteById = async (req, res) => {
  try {
    const cliente = await Client.findById(req.params.id);
    if (!cliente || !cliente.activo) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el cliente', error });
  }
};

// Actualizar un cliente
export const actualizarCliente = async (req, res) => {
  try {
    const clienteActualizado = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!clienteActualizado) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json(clienteActualizado);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el cliente', errors: error.errors });
  }
};

// Eliminar un cliente (borrado lógico)
export const eliminarCliente = async (req, res) => {
    try {
      const cliente = await Client.findById(req.params.id);
      if (!cliente) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }
      // No se puede eliminar si tiene saldo pendiente
      if (cliente.saldoActual > 0) {
        return res.status(400).json({ message: 'No se puede eliminar un cliente con saldo pendiente.' });
      }
  
      cliente.activo = false;
      await cliente.save();
      res.json({ message: 'Cliente eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el cliente', error });
    }
  };

// Obtener cuentas por cobrar (clientes con saldo > 0)
export const obtenerCuentasPorCobrar = async (req, res) => {
  try {
    const clientesConDeuda = await Client.find({ saldoActual: { $gt: 0 }, activo: true });
    res.json(clientesConDeuda);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las cuentas por cobrar', error });
  }
};
