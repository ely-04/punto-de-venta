import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from '../features/auth/services/authApi';
import { productsApi } from '../features/products/services/productsApi';
import { salesApi } from '../features/sales/services/salesApi';
import { cashCutApi } from '../features/cashcuts/services/cashCutsApi';
import { suppliersApi } from '../features/suppliers/services/suppliersApi';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [salesApi.reducerPath]: salesApi.reducer,
    [cashCutApi.reducerPath]: cashCutApi.reducer,
    [suppliersApi.reducerPath]: suppliersApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(productsApi.middleware)
      .concat(salesApi.middleware)
      .concat(cashCutApi.middleware)
      .concat(suppliersApi.middleware),
});

setupListeners(store.dispatch);
