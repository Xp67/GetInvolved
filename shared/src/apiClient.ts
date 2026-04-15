import axios from "axios";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, clearAuthTokens } from "./authTokens";

function getStorage(): Storage | null {
    if (typeof window === "undefined") return null;
    return window.localStorage ?? null;
}

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

// Attach access token to every request
apiClient.interceptors.request.use(
    (config) => {
        const storage = getStorage();
        const token = storage?.getItem(ACCESS_TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle 401 responses: try to refresh token, or redirect to home
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (token) {
            prom.resolve(token);
        } else {
            prom.reject(error);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only attempt refresh if the original request had a token (user was logged in)
        const hadToken = originalRequest.headers?.Authorization?.startsWith("Bearer ");
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/api/token/") &&
            hadToken
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(apiClient(originalRequest));
                        },
                        reject: (err: unknown) => reject(err),
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const storage = getStorage();
            const refreshToken = storage?.getItem(REFRESH_TOKEN_KEY);
            if (!refreshToken) {
                isRefreshing = false;
                if (storage) clearAuthTokens(storage);
                if (typeof window !== "undefined") window.location.href = "/";
                return Promise.reject(error);
            }

            try {
                const res = await axios.post(
                    `${apiClient.defaults.baseURL}/api/token/refresh/`,
                    { refresh: refreshToken }
                );
                const newAccess = res.data.access;
                if (storage) storage.setItem(ACCESS_TOKEN_KEY, newAccess);
                processQueue(null, newAccess);
                originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                if (storage) clearAuthTokens(storage);
                if (typeof window !== "undefined") window.location.href = "/";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
