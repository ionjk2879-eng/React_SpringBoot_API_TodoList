import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

const client = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return client(original);
        });
      }
      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
        const newToken: string = data.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return client(original);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default client;
