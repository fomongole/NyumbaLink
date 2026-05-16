import axios from 'axios';
import Cookies from 'js-cookie';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  // No withCredentials needed — we send the token as a Bearer header
});

// Attach the JWT from the cookie as a Bearer header on every request
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? '';
    const isLoginRequest = url.includes('/auth/admin/login');
    const isPasswordChangeRequest = url.includes('/users/me/password');

    if (
      error.response?.status === 401 &&
      !isLoginRequest &&
      !isPasswordChangeRequest
    ) {
      Cookies.remove('token');
      Cookies.remove('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default apiClient;