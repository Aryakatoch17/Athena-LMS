import { apiClient } from './client';
import { BorrowTransaction, CheckoutRequest, PageResponse, TransactionStatus } from '../types';

export const transactionApi = {
  getAll: async (params?: {
    status?: TransactionStatus;
    query?: string;
    page?: number;
    size?: number;
    sort?: string;
  }) => {
    const response = await apiClient.get<PageResponse<BorrowTransaction>>('/api/transactions', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<BorrowTransaction>(`/api/transactions/${id}`);
    return response.data;
  },

  checkout: async (data: CheckoutRequest) => {
    const response = await apiClient.post<BorrowTransaction>('/api/transactions/checkout', data);
    return response.data;
  },

  returnBook: async (transactionId: number) => {
    const response = await apiClient.post<BorrowTransaction>(`/api/transactions/return/${transactionId}`);
    return response.data;
  },
};

