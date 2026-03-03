import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import {
    Box, Container, Paper, Typography, TextField, Button, Alert, Stack, Divider,
} from '@mui/material';

function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/api/token/', { email, password });
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh);

            // Check if onboarding is completed
            const profileRes = await api.get('/api/user/profile/');
            if (!profileRes.data.onboarding_completed) {
                navigate(`/onboarding?redirect=${encodeURIComponent(redirectTo)}`);
            } else {
                navigate(redirectTo);
            }
        } catch {
            setError('Email o password non validi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: { xs: 6, md: 12 } }}>
            <Paper
                elevation={0}
                sx={{
                    p: 5,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                }}
            >
                <Typography variant="h4" fontWeight="bold" gutterBottom textAlign="center">
                    Bentornato
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
                    Accedi al tuo account per scoprire gli eventi
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Stack spacing={2.5}>
                        <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
                        <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}
                            sx={{ textTransform: 'none', borderRadius: 2, py: 1.5, fontWeight: 'bold', fontSize: '1rem' }}>
                            {loading ? 'Accesso in corso...' : 'Accedi'}
                        </Button>
                    </Stack>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="body2" textAlign="center" color="text.secondary">
                    Non hai un account?{' '}
                    <Typography component={Link} to={`/register${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} variant="body2" color="primary" fontWeight="bold"
                        sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                        Registrati
                    </Typography>
                </Typography>
            </Paper>
        </Container>
    );
}

export default Login;
