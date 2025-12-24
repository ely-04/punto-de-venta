import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/features/auth/authSlice';

export const useAuth = () => {
  const user = useSelector(selectCurrentUser);
  
  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.rol === 'admin',
    isCajero: user?.rol === 'cajero',
    isReportero: user?.rol === 'reportes',
    hasRole: (rol) => user?.rol === rol,
  };
};
