import axios from 'axios';

const api = axios.create({
    // Nëse VITE_API_URL ekziston në Netlify, përdore atë. Përndryshe, përdor Render.
    baseURL: import.meta.env.VITE_API_URL || 'https://secure-exam-api-fjn8.onrender.com/api',
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;