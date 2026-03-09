import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BuildIcon from '@mui/icons-material/Build';

function DevOnboarding() {
    const navigate = useNavigate();

    return (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <BuildIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
                <Typography variant="h5" fontWeight="bold">
                    Sviluppatore: Onboarding
                </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" paragraph>
                Questa sezione è visibile solo agli utenti con i permessi da sviluppatore.
                Ti permette di visualizzare e testare il flusso di onboarding degli utenti senza dover creare un nuovo account.
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/onboarding?redirect=/profile')}
                sx={{ mt: 2 }}
            >
                Testa Onboarding
            </Button>
        </Paper>
    );
}

export default DevOnboarding;
