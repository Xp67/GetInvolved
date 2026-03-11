import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import Onboarding from '../Onboarding';

function DevOnboarding() {
    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BuildIcon color="primary" sx={{ mr: 1.5, fontSize: 28 }} />
                <Typography variant="h5" fontWeight="bold">
                    Dev: Anteprima Onboarding
                </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Questa sezione è visibile solo agli utenti con permessi da sviluppatore.
                Puoi testare il flusso completo di onboarding qui sotto — le modifiche vengono salvate realmente.
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Onboarding embedded />
        </Box>
    );
}

export default DevOnboarding;
