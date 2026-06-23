import axios from 'axios';

const getBaseURL = () => {
    let url = import.meta.env.VITE_API_URL;
    if (url) {
        url = url.trim();
        if (!url.endsWith('/api') && !url.endsWith('/api/')) {
            url = url.endsWith('/') ? `${url}api` : `${url}/api`;
        }
        return url;
    }
    return 'http://localhost:5050/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log("Axios API BaseURL initialized as:", api.defaults.baseURL);

// Add a request interceptor to include the token
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
