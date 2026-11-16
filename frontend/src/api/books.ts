import { apiClient } from './client';
import { Book, BookRequest, PageResponse } from '../types';

export const bookApi = {
  getAll: async (params?: { query?: string; page?: number; size?: number; sort?: string }) => {
    const response = await apiClient.get<PageResponse<Book>>('/api/books', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<Book>(`/api/books/${id}`);
    return response.data;
  },

  create: async (data: BookRequest) => {
    const response = await apiClient.post<Book>('/api/books', data);
    return response.data;
  },

  update: async (id: number, data: BookRequest) => {
    const response = await apiClient.put<Book>(`/api/books/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/api/books/${id}`);
    return response.data;
  },
};

