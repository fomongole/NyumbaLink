import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  // Required: tells the browser to send the httpOnly cookie with every request
  withCredentials: true,
});

// No request interceptor needed — cookie is sent automatically by the browser

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? '';

    const isLoginRequest = url.includes('/auth/login');
    const isPasswordChangeRequest = url.includes('/users/me/password');

    if (
      error.response?.status === 401 &&
      !isLoginRequest &&
      !isPasswordChangeRequest
    ) {
      // No need to remove cookie manually — call logout to let server clear it
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default apiClient;