import { useState } from 'react';
import { useGetProductsQuery } from '@/features/products/services/productsApi';
import { useCreateSaleMutation, useGetSalesQuery } from '@/features/sales/services/salesApi';
import './Sales.css';

export default function Sales() {
  const { data: products = [], isLoading } = useGetProductsQuery();
  const { data: recentSales = [], refetch: refetchSales } = useGetSalesQuery();
  const [createSale, { isLoading: isCreatingSale }] = useCreateSaleMutation();

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoPago, setTipoPago] = useState('efectivo');
  const [clienteNombre, setClienteNombre] = useState('');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [mostrarCambio, setMostrarCambio] = useState(false);

  const filteredProducts = products.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    const existing = cart.find((item) => item.producto._id === product._id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.producto._id === product._id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { producto: product, cantidad: 1, precio: product.precios.venta }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.producto._id !== productId));
  };

  const updateQuantity = (productId, cantidad) => {
    if (cantidad <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.producto._id === productId ? { ...item, cantidad } : item
      )
    );
  };

  const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const cambio = montoRecibido ? parseFloat(montoRecibido) - total : 0;

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    // Validar pago en efectivo
    if (tipoPago === 'efectivo') {
      if (!montoRecibido || parseFloat(montoRecibido) < total) {
        alert('El monto recibido debe ser mayor o igual al total');
        return;
      }
    }

    try {
      const venta = {
        items: cart.map((item) => ({
          productoId: item.producto._id,
          cantidad: item.cantidad,
        })),
        metodoPago: tipoPago,
        montoRecibido: tipoPago === 'efectivo' ? parseFloat(montoRecibido) : total,
        cambio: tipoPago === 'efectivo' ? cambio : 0,
        ...(clienteNombre && { clienteNombre }),
      };

      await createSale(venta).unwrap();
      
      // Mostrar resumen de la venta
      if (tipoPago === 'efectivo' && cambio > 0) {
        alert(`Venta completada con éxito\n\nTotal: $${total.toFixed(2)}\nRecibido: $${parseFloat(montoRecibido).toFixed(2)}\nCambio: $${cambio.toFixed(2)}`);
      } else {
        alert('Venta completada con éxito');
      }
      
      // Limpiar formulario
      setCart([]);
      setClienteNombre('');
      setSearchTerm('');
      setMontoRecibido('');
      setMostrarCambio(false);
      
      // Refrescar lista de ventas
      refetchSales();
    } catch (error) {
      console.error('Error completo:', error);
      let errorMessage = 'Error desconocido al completar la venta';
      
      if (error.data) {
        errorMessage = error.data.message || JSON.stringify(error.data);
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(`Error al completar la venta: ${errorMessage}`);
    }
  };

  if (isLoading) return <div>Cargando productos...</div>;

  return (
    <div className="sales-container">
      <div className="sales-left">
        <h2>Productos</h2>
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="product-card"
              onClick={() => addToCart(product)}
            >
              <h3>{product.nombre}</h3>
              <p className="product-code">{product.codigo}</p>
              <p className="product-price">${product.precios.venta.toFixed(2)}</p>
              <p className="product-stock">Stock: {product.stock}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="sales-right">
        <h2>Carrito</h2>
        
        {cart.length === 0 ? (
          <p className="empty-cart">Carrito vacío</p>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.producto._id} className="cart-item">
                  <div className="cart-item-info">
                    <h4>{item.producto.nombre}</h4>
                    <p>${item.precio.toFixed(2)}</p>
                  </div>
                  <div className="cart-item-controls">
                    <button onClick={() => updateQuantity(item.producto._id, item.cantidad - 1)}>
                      -
                    </button>
                    <input
                      type="number"
                      value={item.cantidad}
                      onChange={(e) =>
                        updateQuantity(item.producto._id, parseInt(e.target.value) || 0)
                      }
                      min="1"
                    />
                    <button onClick={() => updateQuantity(item.producto._id, item.cantidad + 1)}>
                      +
                    </button>
                    <button onClick={() => removeFromCart(item.producto._id)} className="remove-btn">
                      ✕
                    </button>
                  </div>
                  <div className="cart-item-subtotal">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="form-group">
                <label>Cliente (opcional):</label>
                <input
                  type="text"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  placeholder="Nombre del cliente"
                />
              </div>

              <div className="form-group">
                <label>Tipo de pago:</label>
                <select 
                  value={tipoPago} 
                  onChange={(e) => {
                    setTipoPago(e.target.value);
                    setMostrarCambio(e.target.value === 'efectivo');
                    if (e.target.value !== 'efectivo') {
                      setMontoRecibido('');
                    }
                  }}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>

              {tipoPago === 'efectivo' && (
                <div className="form-group">
                  <label>Monto recibido:</label>
                  <input
                    type="number"
                    step="0.01"
                    min={total}
                    value={montoRecibido}
                    onChange={(e) => setMontoRecibido(e.target.value)}
                    placeholder={`Mínimo: $${total.toFixed(2)}`}
                    className="money-input"
                  />
                </div>
              )}

              <div className="total">
                <h3>Total: ${total.toFixed(2)}</h3>
                {tipoPago === 'efectivo' && montoRecibido && cambio >= 0 && (
                  <div className="change-info">
                    <p><strong>Recibido:</strong> ${parseFloat(montoRecibido).toFixed(2)}</p>
                    <p><strong>Cambio:</strong> <span className="change-amount">${cambio.toFixed(2)}</span></p>
                  </div>
                )}
              </div>

              <button
                onClick={handleCompleteSale}
                disabled={isCreatingSale}
                className="complete-sale-btn"
              >
                {isCreatingSale ? 'Procesando...' : 'Completar Venta'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
