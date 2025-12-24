import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const suppliersApi = createApi({
  reducerPath: 'suppliersApi',
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
  tagTypes: ['Supplier'],
  endpoints: (builder) => ({
    getSuppliers: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const query = queryParams ? `?${queryParams}` : '';
        return `/suppliers${query}`;
      },
      providesTags: ['Supplier'],
    }),
    getSupplier: builder.query({
      query: (id) => `/suppliers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Supplier', id }],
    }),
    createSupplier: builder.mutation({
      query: (supplier) => ({
        url: '/suppliers',
        method: 'POST',
        body: supplier,
      }),
      invalidatesTags: ['Supplier'],
    }),
    updateSupplier: builder.mutation({
      query: ({ id, ...supplier }) => ({
        url: `/suppliers/${id}`,
        method: 'PUT',
        body: supplier,
      }),
      invalidatesTags: ['Supplier'],
    }),
    deleteSupplier: builder.mutation({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Supplier'],
    }),
    reactivateSupplier: builder.mutation({
      query: (id) => ({
        url: `/suppliers/${id}/reactivar`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Supplier'],
    }),
    getSuppliersStats: builder.query({
      query: () => '/suppliers/estadisticas',
      providesTags: ['Supplier'],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useReactivateSupplierMutation,
  useGetSuppliersStatsQuery,
} = suppliersApi;