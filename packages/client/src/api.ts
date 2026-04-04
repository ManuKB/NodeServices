import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active: number;
}

export interface Expense {
  id: number;
  name: string;
  date: string;
  amount: number;
  added_by: number;
  updated_by: number;
  added_by_name: string;
  updated_by_name: string;
  added_date: string;
  updated_date: string;
}

export interface MonthlySummary {
  month: string;
  year: string;
  total: number;
  count: number;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User; token: string }>('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post<{ user: User; token: string }>('/auth/register', { name, email, password }),
  getMe: () => api.get<User>('/auth/me'),
  updateUser: (id: number, data: Partial<User & { password: string }>) =>
    api.put<User>(`/auth/users/${id}`, data),
};

export const expenseApi = {
  getAll: (month?: string, year?: string) =>
    api.get<Expense[]>('/expenses', { params: { month, year } }),
  getSummary: (year?: string) =>
    api.get<MonthlySummary[]>('/expenses/summary', { params: { year } }),
  create: (data: { name: string; date: string; amount: number }) =>
    api.post<Expense>('/expenses', data),
  update: (id: number, data: { name?: string; date?: string; amount?: number }) =>
    api.put<Expense>(`/expenses/${id}`, data),
  delete: (id: number) => api.delete(`/expenses/${id}`),
};

export default api;
