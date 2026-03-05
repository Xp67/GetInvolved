import { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress } from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import TicketCard from '../../components/TicketCard';
import api from '../../api';

export default function MyTickets() {
    const [myTickets, setMyTickets] = useState<any[]>([]);
    const [ticketsLoading, setTicketsLoading] = useState(false);

    useEffect(() => {
        getMyTickets();
    }, []);

    const getMyTickets = () => {
        setTicketsLoading(true);
        api.get('/api/tickets/my/').then(res => {
            setMyTickets(Array.isArray(res.data) ? res.data : []);
        }).catch(console.error).finally(() => setTicketsLoading(false));
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 5 }}>I Miei Biglietti</Typography>
            {ticketsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
            ) : myTickets.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <ConfirmationNumberIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary">Non hai ancora acquistato biglietti.</Typography>
                    <Typography variant="body2" color="text.secondary">Esplora gli eventi e acquista il tuo primo biglietto!</Typography>
                </Box>
            ) : (
                <Grid container spacing={2}>
                    {myTickets.map((ticket: any) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }} key={ticket.id}>
                            <TicketCard ticket={ticket} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}
