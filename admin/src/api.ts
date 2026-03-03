import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

// Attach access token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle 401 responses: try to refresh token, or redirect to home
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (token) {
            prom.resolve(token);
        } else {
            prom.reject(error);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Skip refresh logic for auth endpoints themselves
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/api/token/')
        ) {
            if (isRefreshing) {
                // Queue this request until refresh completes
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(api(originalRequest));
                        },
                        reject: (err: any) => reject(err),
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem(REFRESH_TOKEN);
            if (!refreshToken) {
                localStorage.clear();
                window.location.href = "/";
                return Promise.reject(error);
            }

            try {
                const res = await axios.post(
                    `${api.defaults.baseURL}/api/token/refresh/`,
                    { refresh: refreshToken }
                );
                const newAccess = res.data.access;
                localStorage.setItem(ACCESS_TOKEN, newAccess);
                processQueue(null, newAccess);
                originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.clear();
                window.location.href = "/";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
