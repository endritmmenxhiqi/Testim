import axios from 'axios';

const api = axios.create({
    baseURL: 'https://secure-exam-api-fjn8.onrender.com/api', // Matches ASP.NET Core default port
});

// Add a request interceptor to inject the JWT token
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
