import axios from 'axios';

// withCredentials ensures cookies are sent/received on every request —
// both the admin_session cookie (adminAuth.middleware.ts) and the
// user_session cookie (userAuth.middleware.ts) ride on this same setting.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
