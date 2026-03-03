import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

function NotFound() {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm">
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                textAlign: 'center'
            }}>
                <Typography variant="h1" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
                    404
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
                    La pagina che cerchi non esiste.
                </Typography>
                <Button variant="contained" onClick={() => navigate('/')} sx={{ textTransform: 'none', borderRadius: 2, px: 4 }}>
                    Torna alla Home
                </Button>
            </Box>
        </Container>
    );
}

export default NotFound;
