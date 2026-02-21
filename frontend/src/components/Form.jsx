import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Alert
} from "@mui/material";

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const name = method === "login" ? "Accedi" : "Registrati";

    const handleSubmit = async (e) => {
        setLoading(true);
        setError("");
        e.preventDefault();

        try {
            // For login, we use email as the identifier
            const data = method === "login"
                ? { email, password }
                : { username, email, password };

            const res = await api.post(route, data);

            if (method === "login") {
                const access = res?.data?.access;
                const refresh = res?.data?.refresh;
                if (!access || !refresh) {
                    throw new Error("Risposta del server non valida.");
                }
                localStorage.setItem(ACCESS_TOKEN, access);
                localStorage.setItem(REFRESH_TOKEN, refresh);
                navigate("/dashboard");
            } else {
                navigate("/login");
            }
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.detail || "Si è verificato un errore. Riprova.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5" fontWeight="bold">
                    {name}
                </Typography>

                {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
                    {method === "register" && (
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    )}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Indirizzo Email"
                        name="email"
                        autoComplete="email"
                        autoFocus={method === "login"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, height: 45 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : name}
                    </Button>
                    <Button
                        fullWidth
                        variant="text"
                        onClick={() => navigate(method === "login" ? "/register" : "/login")}
                        sx={{
                            textTransform: 'none',
                            fontSize: method === "login" ? '0.8rem' : 'inherit',
                            color: 'text.secondary',
                            mt: 1
                        }}
                    >
                        {method === "login" ? "oppure registrati subito" : "Hai già un account? Accedi"}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default Form;
