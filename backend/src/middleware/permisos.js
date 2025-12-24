const PERMISOS = {
  admin: [
    // Gestión de usuarios
    'crear_usuario',
    'editar_usuario',
    'eliminar_usuario',
    'bloquear_usuario',
    
    // Gestión de productos
    'crear_producto',
    'editar_producto',
    'eliminar_producto',
    'ver_stock',
    
    // Ventas
    'crear_venta',
    'cancelar_venta',
    'anular_venta',
    
    // Reportes
    'ver_reportes_completos',
    'ver_historial_ventas',
    'ver_usuarios',
    
    // Configuración
    'configurar_negocio',
    'respaldar_datos',
  ],
  
  cajero: [
    // Ventas (lo principal)
    'crear_venta',
    'ver_carrito',
    'procesar_pago',
    
    // Productos (lectura)
    'ver_productos',
    'ver_stock_productos',
    
    // Reportes (básicos)
    'ver_reportes_dia',
    'ver_mis_ventas',
  ],
  
  reportes: [
    // Solo reportes
    'ver_reportes_completos',
    'ver_historial_ventas',
    'descargar_reportes',
  ],
};

export const tienePermiso = (rol, permiso) => {
  return PERMISOS[rol] && PERMISOS[rol].includes(permiso);
};

export const requierePermiso = (permiso) => {
  return (req, res, next) => {
    if (!tienePermiso(req.usuario.rol, permiso)) {
      return res.status(403).json({ 
        error: `No tienes permiso para: ${permiso}` 
      });
    }
    next();
  };
};

export const adminRequired = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
};

export const cashierRequired = (req, res, next) => {
  if (req.usuario && (req.usuario.rol === 'cajero' || req.usuario.rol === 'admin')) {
    return next();
  }
  return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de cajero o administrador.' });
};

export default PERMISOS;