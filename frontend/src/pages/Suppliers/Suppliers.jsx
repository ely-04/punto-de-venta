import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  useGetSuppliersQuery, 
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useReactivateSupplierMutation,
  useGetSuppliersStatsQuery
} from '@/features/suppliers/services/suppliersApi';
import './Suppliers.css';

export default function Suppliers() {
  const user = useSelector((state) => state?.auth?.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: suppliersData, isLoading, refetch } = useGetSuppliersQuery({
    page: currentPage,
    search: searchTerm,
    estado: statusFilter
  });
  
  const { data: stats } = useGetSuppliersStatsQuery();
  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();
  const [deleteSupplier] = useDeleteSupplierMutation();
  const [reactivateSupplier] = useReactivateSupplierMutation();

  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '',
    email: '',
    telefono: '',
    direccion: {
      calle: '',
      ciudad: '',
      codigoPostal: '',
      pais: 'México'
    },
    informacionFiscal: {
      rfc: '',
      razonSocial: ''
    },
    condicionesPago: 'contado',
    diasCredito: 0,
    notas: ''
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      contacto: '',
      email: '',
      telefono: '',
      direccion: {
        calle: '',
        ciudad: '',
        codigoPostal: '',
        pais: 'México'
      },
      informacionFiscal: {
        rfc: '',
        razonSocial: ''
      },
      condicionesPago: 'contado',
      diasCredito: 0,
      notas: ''
    });
    setEditingSupplier(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingSupplier) {
        await updateSupplier({ id: editingSupplier._id, ...formData }).unwrap();
        alert('Proveedor actualizado exitosamente');
      } else {
        await createSupplier(formData).unwrap();
        alert('Proveedor creado exitosamente');
      }
      
      setShowModal(false);
      resetForm();
      refetch();
    } catch (error) {
      alert('Error: ' + (error.data?.message || error.message));
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      nombre: supplier.nombre || '',
      contacto: supplier.contacto || '',
      email: supplier.email || '',
      telefono: supplier.telefono || '',
      direccion: {
        calle: supplier.direccion?.calle || '',
        ciudad: supplier.direccion?.ciudad || '',
        codigoPostal: supplier.direccion?.codigoPostal || '',
        pais: supplier.direccion?.pais || 'México'
      },
      informacionFiscal: {
        rfc: supplier.informacionFiscal?.rfc || '',
        razonSocial: supplier.informacionFiscal?.razonSocial || ''
      },
      condicionesPago: supplier.condicionesPago || 'contado',
      diasCredito: supplier.diasCredito || 0,
      notas: supplier.notas || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar este proveedor?')) {
      try {
        await deleteSupplier(id).unwrap();
        alert('Proveedor desactivado exitosamente');
        refetch();
      } catch (error) {
        alert('Error: ' + (error.data?.message || error.message));
      }
    }
  };

  const handleReactivate = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres reactivar este proveedor?')) {
      try {
        await reactivateSupplier(id).unwrap();
        alert('Proveedor reactivado exitosamente');
        refetch();
      } catch (error) {
        alert('Error: ' + (error.data?.message || error.message));
      }
    }
  };

  const suppliers = suppliersData?.proveedores || [];
  const totalPages = suppliersData?.totalPages || 1;

  if (isLoading) {
    return (
      <div className="suppliers-container">
        <div className="loading-state">
          <h2>🔄 Cargando proveedores...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="suppliers-container">
      <div className="suppliers-header">
        <h1>🏪 Gestión de Proveedores</h1>
        <div className="user-info">
          <span className="role-badge">{user?.role?.toUpperCase()}</span>
          <span>{user?.nombre}</span>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{stats.totalProveedores}</h3>
              <p>Total Proveedores</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.proveedoresActivos}</h3>
              <p>Activos</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <h3>{stats.proveedoresInactivos}</h3>
              <p>Inactivos</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{stats.porcentajeActivos}%</h3>
              <p>Tasa de Actividad</p>
            </div>
          </div>
        </div>
      )}

      {/* Controles */}
      <div className="suppliers-controls">
        <div className="search-filter-group">
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar por nombre, contacto o RFC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>

        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowModal(true)}
            className="add-supplier-btn"
          >
            ➕ Agregar Proveedor
          </button>
        )}
      </div>

      {/* Tabla de proveedores */}
      <div className="suppliers-table-container">
        <table className="suppliers-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Contacto</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>RFC</th>
              <th>Condiciones</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier._id} className={supplier.estado === 'inactivo' ? 'inactive-row' : ''}>
                <td>
                  <div className="supplier-name">
                    <strong>{supplier.nombre}</strong>
                  </div>
                </td>
                <td>{supplier.contacto}</td>
                <td>{supplier.telefono}</td>
                <td>{supplier.email || '-'}</td>
                <td>{supplier.informacionFiscal?.rfc || '-'}</td>
                <td>
                  <span className={`payment-terms ${supplier.condicionesPago}`}>
                    {supplier.condicionesPago === 'contado' ? 'Contado' : 
                     `Crédito ${supplier.diasCredito} días`}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${supplier.estado}`}>
                    {supplier.estado === 'activo' ? '✅ Activo' : '❌ Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {user?.role === 'admin' && (
                      <>
                        <button 
                          onClick={() => handleEdit(supplier)}
                          className="edit-btn"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        {supplier.estado === 'activo' ? (
                          <button 
                            onClick={() => handleDelete(supplier._id)}
                            className="delete-btn"
                            title="Desactivar"
                          >
                            🗑️
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleReactivate(supplier._id)}
                            className="reactivate-btn"
                            title="Reactivar"
                          >
                            ♻️
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {suppliers.length === 0 && (
          <div className="no-data">
            <p>No se encontraron proveedores</p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Anterior
          </button>
          <span className="pagination-info">
            Página {currentPage} de {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Modal para crear/editar proveedor */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSupplier ? '✏️ Editar Proveedor' : '➕ Agregar Proveedor'}</h2>
              <button 
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="modal-close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="supplier-form">
              <div className="form-grid">
                {/* Información básica */}
                <div className="form-section">
                  <h3>Información Básica</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre de la Empresa *</label>
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Persona de Contacto *</label>
                      <input
                        type="text"
                        name="contacto"
                        value={formData.contacto}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Teléfono *</label>
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Dirección */}
                <div className="form-section">
                  <h3>Dirección</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Calle</label>
                      <input
                        type="text"
                        name="direccion.calle"
                        value={formData.direccion.calle}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Ciudad</label>
                      <input
                        type="text"
                        name="direccion.ciudad"
                        value={formData.direccion.ciudad}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Código Postal</label>
                      <input
                        type="text"
                        name="direccion.codigoPostal"
                        value={formData.direccion.codigoPostal}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>País</label>
                      <input
                        type="text"
                        name="direccion.pais"
                        value={formData.direccion.pais}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Información fiscal */}
                <div className="form-section">
                  <h3>Información Fiscal</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>RFC</label>
                      <input
                        type="text"
                        name="informacionFiscal.rfc"
                        value={formData.informacionFiscal.rfc}
                        onChange={handleInputChange}
                        placeholder="XAXX010101000"
                        style={{textTransform: 'uppercase'}}
                      />
                    </div>
                    <div className="form-group">
                      <label>Razón Social</label>
                      <input
                        type="text"
                        name="informacionFiscal.razonSocial"
                        value={formData.informacionFiscal.razonSocial}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Condiciones de pago */}
                <div className="form-section">
                  <h3>Condiciones de Pago</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tipo de Pago</label>
                      <select
                        name="condicionesPago"
                        value={formData.condicionesPago}
                        onChange={handleInputChange}
                      >
                        <option value="contado">Contado</option>
                        <option value="credito_15">Crédito 15 días</option>
                        <option value="credito_30">Crédito 30 días</option>
                        <option value="credito_45">Crédito 45 días</option>
                        <option value="credito_60">Crédito 60 días</option>
                      </select>
                    </div>
                    {formData.condicionesPago !== 'contado' && (
                      <div className="form-group">
                        <label>Días de Crédito</label>
                        <input
                          type="number"
                          name="diasCredito"
                          value={formData.diasCredito}
                          onChange={handleInputChange}
                          min="0"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Notas */}
                <div className="form-section">
                  <h3>Notas Adicionales</h3>
                  <div className="form-group">
                    <label>Notas</label>
                    <textarea
                      name="notas"
                      value={formData.notas}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Información adicional sobre el proveedor..."
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="cancel-btn"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isCreating || isUpdating}
                >
                  {(isCreating || isUpdating) ? 'Guardando...' : 
                   (editingSupplier ? 'Actualizar' : 'Crear')} Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}