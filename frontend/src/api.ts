import axios from 'axios';
import { ACCESS_TOKEN } from './constants';


const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})


api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token && config.headers){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

export const authAPI = {
    login: (data: FormData) => api.post('/auth/login', data),
    signup: (data: any) => api.post('/auth/signup', data),
    getMe: () => api.get('/auth/me')
};

export const pdfAPI = {
    upload: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/pdf/upload', formData);
    },
    process: (pdfId: string) => api.post(`/pdf/process/${pdfId}`),
    getUploads: () => api.get('/pdf/uploads'),
    deleteUpload: (pdfId: string) => api.delete(`/pdf/delete/${pdfId}`)
};

export const chatAPI = {
    sendMessage: (pdfId: string, message: string) => api.post(`/chat/${pdfId}`, { message }),
    getHistory: (pdfId: string) => api.get(`/chat/${pdfId}/history`)
};

export default api;