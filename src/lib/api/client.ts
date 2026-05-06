import axios from 'axios';
import Cookies from 'js-cookie';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    // Only redirect on 401 if it's NOT the login request itself.
    // If we redirected on login 401s, the page would reload and swallow the error toast.
    if (error.response?.status === 401 && !isLoginRequest) {
      Cookies.remove('token');
      Cookies.remove('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default apiClient;