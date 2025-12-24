import { createBrowserRouter } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';
import Home from '@/pages/Home/Home';
import Sales from '@/pages/Sales/Sales';
import Products from '@/pages/Products/Products';
import Reports from '@/pages/Reports/Reports';
import CashCut from '@/pages/CashCut/CashCut';
import Suppliers from '@/pages/Suppliers/Suppliers';
import Login from '@/pages/Login/Login';
import ErrorBoundary from './ErrorBoundary';

export const router = createBrowserRouter([
  { 
    path: '/login', 
    element: <Login />, 
    errorElement: <ErrorBoundary /> 
  },
  {
    path: '/',
    element: <AdminLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Home /> },
      { path: 'ventas', element: <Sales /> },
      { path: 'productos', element: <Products /> },
      { path: 'proveedores', element: <Suppliers /> },
      { path: 'reportes', element: <Reports /> },
      { path: 'corte-caja', element: <CashCut /> },
      { path: 'test', element: <div style={{padding:20}}>Ruta de prueba</div> },
    ],
  },
  { path: '*', element: <div style={{padding:20}}>Ruta no encontrada</div> },
]);

