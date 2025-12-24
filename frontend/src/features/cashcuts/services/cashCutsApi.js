import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const cashCutApi = createApi({
  reducerPath: 'cashCutApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['CashCut'],
  endpoints: (builder) => ({
    openCashCut: builder.mutation({
      query: (cashCut) => ({
        url: '/cashcuts/abrir',
        method: 'POST',
        body: cashCut,
      }),
      invalidatesTags: ['CashCut'],
    }),
    closeCashCut: builder.mutation({
      query: (cashCut) => ({
        url: '/cashcuts/cerrar',
        method: 'POST',
        body: cashCut,
      }),
      invalidatesTags: ['CashCut'],
      // Forzar re-fetch inmediato después de cerrar
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidar manualmente todas las consultas relacionadas
          dispatch(cashCutApi.util.invalidateTags(['CashCut']));
        } catch (error) {
          console.error('Error al cerrar caja:', error);
        }
      }
    }),
    getActiveCashCut: builder.query({
      query: () => '/cashcuts/actual',
      providesTags: ['CashCut'],
    }),
    getCashCuts: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const query = queryParams ? `?${queryParams}` : '';
        return `/cashcuts/historial${query}`;
      },
      providesTags: ['CashCut'],
    }),
  }),
});

export const {
  useOpenCashCutMutation,
  useCloseCashCutMutation,
  useGetActiveCashCutQuery,
  useGetCashCutsQuery,
} = cashCutApi;