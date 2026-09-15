import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5282/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar o Token JWT no cabeçalho das requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@T4English:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para redirecionar ao login se o token expirar
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('@T4English:token');
      localStorage.removeItem('@T4English:user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
