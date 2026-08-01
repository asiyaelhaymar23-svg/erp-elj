import axios from 'axios';

// Les variables VITE_* sont figées au moment du build. En conteneur, l'image
// est générique et l'URL de l'API est injectée au démarrage par
// docker-entrypoint.sh dans window.__ENV__ (voir public/env-config.js).
declare global {
  interface Window {
    __ENV__?: { VITE_API_URL?: string };
  }
}

const apiUrl = window.__ENV__?.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: apiUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Déconnexion automatique si le token est expiré ou invalide.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);
