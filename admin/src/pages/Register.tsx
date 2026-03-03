import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import {
    Box, Container, Paper, Typography, TextField, Button, Alert, Stack, Divider,
} from '@mui/material';

function Register() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== password2) { setError('Le password non coincidono.'); return; }
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/api/user/register/', { email, password });
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
            navigate('/onboarding');
        } catch (err: any) {
            const data = err.response?.data;
            const msg = data ? Object.values(data).flat().join(' ') : 'Errore durante la registrazione.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: { xs: 6, md: 10 } }}>
            <Paper
                elevation={0}
                sx={{ p: 5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
            >
                <Typography variant="h4" fontWeight="bold" gutterBottom textAlign="center">
                    Crea Account
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
                    Registra il tuo account organizzatore
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Stack spacing={2.5}>
                        <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
                        <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <TextField fullWidth label="Conferma Password" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
                        <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}
                            sx={{ textTransform: 'none', borderRadius: 2, py: 1.5, fontWeight: 'bold', fontSize: '1rem' }}>
                            {loading ? 'Registrazione...' : 'Registrati'}
                        </Button>
                    </Stack>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="body2" textAlign="center" color="text.secondary">
                    Hai già un account?{' '}
                    <Typography component={Link} to="/login" variant="body2" color="primary" fontWeight="bold"
                        sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                        Accedi
                    </Typography>
                </Typography>
            </Paper>
        </Container>
    );
}

export default Register;
