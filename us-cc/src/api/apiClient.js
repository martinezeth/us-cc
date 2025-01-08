import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
});

apiClient.interceptors.request.use((config) => {
  const isGuest = localStorage.getItem('guestMode') === 'true';
  if (isGuest) {
    config.headers['x-guest-mode'] = 'true';
  }
  return config;
});

export default apiClient;