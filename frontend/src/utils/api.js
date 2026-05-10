import axios from 'axios';

// Create an Axios instance with a base URL
const apiClient = axios.create({
  // Use relative path by default, which works perfectly with Vite proxy and Nginx reverse proxy
  // This allows the frontend running on port 3000 to transparently hit the backend on 8000
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

export default apiClient;
