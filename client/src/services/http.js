// Axios instance for the backend phase. Not used while VITE_USE_MOCK=true.
import axios from 'axios';
export const http = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', withCredentials: true });
http.interceptors.request.use((cfg) => { const t = localStorage.getItem('swms_token'); if (t) cfg.headers.Authorization = `Bearer ${t}`; return cfg; });
