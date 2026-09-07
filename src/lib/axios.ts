import axios from 'axios';

// No user-login system at this stage — only a single hidden admin session
// (cookie-based, see adminAuth.middleware.ts on the backend). withCredentials
// ensures that cookie is sent on admin write requests; it's a no-op for the
// public GET requests every page below makes.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
