import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001',
  // withCredentials: true,
});

export default axiosInstance;
