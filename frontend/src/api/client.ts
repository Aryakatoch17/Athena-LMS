import axios, { AxiosError } from 'axios';
import { ApiError } from '../types';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    if (axiosError.response?.data?.message) {
      if (axiosError.response.data.validationErrors) {
        const fieldErrors = Object.entries(axiosError.response.data.validationErrors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ');
        return `${axiosError.response.data.message} (${fieldErrors})`;
      }
      return axiosError.response.data.message;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }
  return 'An unexpected error occurred. Please try again.';
}

