import { useState, useEffect, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../authTokens';
import api from '../apiClient';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
    children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        auth().catch(() => setIsAuthorized(false));
    }, []);

    const refreshToken = async () => {
        const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refresh) { setIsAuthorized(false); return; }
        try {
            const res = await api.post('/api/token/refresh/', { refresh });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN_KEY, res.data.access);
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        } catch {
            setIsAuthorized(false);
        }
    };

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (!token) { setIsAuthorized(false); return; }
        const decoded: any = jwtDecode(token);
        const now = Date.now() / 1000;
        if (decoded.exp < now) {
            await refreshToken();
        } else {
            setIsAuthorized(true);
        }
    };

    if (isAuthorized === null) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return isAuthorized ? <>{children}</> : <Navigate to="/login" />;
}

export default ProtectedRoute;
