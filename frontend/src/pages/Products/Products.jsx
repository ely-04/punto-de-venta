import { useState, useEffect } from 'react';
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
} from '@/features/products/services/productsApi';
import { useGetSuppliersQuery } from '@/features/suppliers/services/suppliersApi';
import './Products.css';

export default function Products() {
  const { data: products = [], isLoading } = useGetProductsQuery();
  const { data: categoriesData = [] } = useGetCategoriesQuery();
  const { data: suppliersData = [] } = useGetSuppliersQuery({ estado: 'activo' });
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    seccion: 'abarrotes',
    categoria: '',
    proveedor: '',
    precios: {
      compra: '',
      venta: '',
    },
    stock: '',
    stockMinimo: '',
  });
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // Cargar categorías y proveedores del backend
  useEffect(() => {
    if (categoriesData && categoriesData.length > 0) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  useEffect(() => {
    if (suppliersData && suppliersData.proveedores) {
      setSuppliers(suppliersData.proveedores);
    }
  }, [suppliersData]);

  const resetForm = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      seccion: 'abarrotes',
      categoria: '',
      proveedor: '',
      precios: { compra: '', venta: '' },
      stock: '',
      stockMinimo: '',
    });
    setEditingProduct(null);
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        codigo: product.codigo,
        nombre: product.nombre,
        descripcion: product.descripcion || '',
        seccion: product.seccion || 'abarrotes',
        categoria: product.categoria?._id || product.categoria || '',
        proveedor: product.proveedor?._id || product.proveedor || '',
        precios: {
          compra: product.precios.compra,
          venta: product.precios.venta,
        },
        stock: product.stock,
        stockMinimo: product.stockMinimo || 0,
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.codigo || !formData.nombre || !formData.categoria || !formData.seccion) {
      alert('Por favor rellena todos los campos requeridos');
      return;
    }

    try {
      const productData = {
        codigo: formData.codigo,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        seccion: formData.seccion,
        categoria: formData.categoria,
        proveedor: formData.proveedor || null,
        precios: {
          compra: parseFloat(formData.precios.compra),
          venta: parseFloat(formData.precios.venta),
        },
        stock: parseInt(formData.stock) || 0,
        stockMinimo: parseInt(formData.stockMinimo) || 0,
      };

      if (editingProduct) {
        await updateProduct({ id: editingProduct._id, ...productData }).unwrap();
        alert('Producto actualizado correctamente');
      } else {
        await createProduct(productData).unwrap();
        alert('Producto creado correctamente');
      }
      handleCloseModal();
    } catch (error) {
      const errorMessage = 
        error?.data?.message || 
        error?.data?.errors?.[0]?.msg ||
        error?.message || 
        'Error al guardar el producto';
      alert('Error: ' + errorMessage);
      console.error('Error detallado:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteProduct(id).unwrap();
        alert('Producto eliminado');
      } catch (error) {
        alert('Error: ' + (error.data?.message || error.message));
      }
    }
  };

  if (isLoading) return <div>Cargando productos...</div>;

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Gestión de Productos</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          + Nuevo Producto
        </button>
      </div>

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Proveedor</th>
              <th>Precio Compra</th>
              <th>Precio Venta</th>
              <th>Stock</th>
              <th>Stock Mínimo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>{product.codigo}</td>
                <td>{product.nombre}</td>
                <td>{product.proveedor ? product.proveedor.nombre : '-'}</td>
                <td>${product.precios.compra.toFixed(2)}</td>
                <td>${product.precios.venta.toFixed(2)}</td>
                <td className={product.stock <= product.stockMinimo ? 'low-stock' : ''}>
                  {product.stock}
                </td>
                <td>{product.stockMinimo}</td>
                <td className="actions">
                  <button onClick={() => handleOpenModal(product)} className="btn-edit">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(product._id)} className="btn-delete">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Código*</label>
                  <input
                    type="text"
                    name="codigo"
                    required
                    value={formData.codigo}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Nombre*</label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sección*</label>
                  <select
                    name="seccion"
                    required
                    value={formData.seccion}
                    onChange={handleChange}
                  >
                    <option value="">Selecciona una sección</option>
                    <option value="abarrotes">Abarrotes</option>
                    <option value="papeleria">Papelería</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="categoria">Categoría*</label>
                  <select
                    id="categoria"
                    name="categoria"
                    required
                    value={formData.categoria}
                    onChange={handleChange}
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories && categories.length > 0 ? (
                      categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.nombre}
                        </option>
                      ))
                    ) : (
                      <option disabled>Cargando categorías...</option>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="proveedor">Proveedor</label>
                  <select
                    id="proveedor"
                    name="proveedor"
                    value={formData.proveedor}
                    onChange={handleChange}
                  >
                    <option value="">Sin proveedor asignado</option>
                    {suppliers && suppliers.length > 0 ? (
                      suppliers.map((supplier) => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier.nombre} - {supplier.contacto}
                        </option>
                      ))
                    ) : (
                      <option disabled>Cargando proveedores...</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Precio Compra*</label>
                  <input
                    type="number"
                    step="0.01"
                    name="precios.compra"
                    required
                    value={formData.precios.compra}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Precio Venta*</label>
                  <input
                    type="number"
                    step="0.01"
                    name="precios.venta"
                    required
                    value={formData.precios.venta}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stock*</label>
                  <input
                    type="number"
                    name="stock"
                    required
                    value={formData.stock}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Stock Mínimo*</label>
                  <input
                    type="number"
                    name="stockMinimo"
                    required
                    value={formData.stockMinimo}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  {editingProduct ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
