import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ACCESS_TOKEN } from '../constants';
import {
    Container, Typography, Box, Button, Grid, Paper, Stack, Chip, Card, CardContent,
    Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, CircularProgress, Divider, IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [buyDialogOpen, setBuyDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const isLoggedIn = !!localStorage.getItem(ACCESS_TOKEN);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                // Try public endpoint first, then authenticated
                try {
                    const res = await api.get(`/api/event/public/${id}/`);
                    setEvent(res.data);
                } catch {
                    const res = await api.get(`/api/event/${id}/`);
                    setEvent(res.data);
                }
            } catch {
                setSnackbar({ open: true, message: 'Evento non trovato', severity: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handleBuyTicket = async () => {
        if (!isLoggedIn) { navigate('/login'); return; }
        try {
            await api.post('/api/tickets/purchase/', { category: selectedCategory.id });
            setSnackbar({ open: true, message: 'Biglietto acquistato con successo!', severity: 'success' });
            setBuyDialogOpen(false);
            // Refresh event data
            const res = await api.get(`/api/event/${id}/`);
            setEvent(res.data);
        } catch (err: any) {
            setSnackbar({ open: true, message: err.response?.data?.error || 'Errore nell\'acquisto', severity: 'error' });
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (!event) return <Container sx={{ mt: 4 }}><Alert severity="error">Evento non trovato</Alert></Container>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={() => navigate('/')} sx={{ mr: 2, bgcolor: 'background.paper', boxShadow: 1, border: '1px solid', borderColor: 'divider' }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                    Dettaglio Evento
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Main Content */}
                <Grid size={{ xs: 12, md: 8 }}>
                    {/* Hero Banner */}
                    <Box sx={{
                        height: { xs: 200, md: 300 }, borderRadius: 3, mb: 3, position: 'relative', overflow: 'hidden',
                        background: (t) => `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.primary.dark} 60%, ${t.palette.primary.light} 100%)`,
                        display: 'flex', alignItems: 'flex-end', p: 4,
                    }}>
                        <Box>
                            <Typography variant="h3" fontWeight="bold" sx={{ color: 'white', fontSize: { xs: '1.8rem', md: '3rem' }, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                                {event.title}
                            </Typography>
                        </Box>
                    </Box>

                    <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }} elevation={0}>
                        <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
                            <Chip icon={<PersonIcon />} label={`Organizzato da: ${event.organizer_name}`} variant="outlined" />
                            <Chip icon={<CalendarTodayIcon />} label={new Date(event.event_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })} variant="outlined" />
                            <Chip icon={<AccessTimeIcon />} label={new Date(event.event_date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} variant="outlined" />
                            <Chip icon={<LocationOnIcon />} label={event.location} color="primary" />
                        </Stack>

                        <Typography variant="h6" fontWeight="bold" gutterBottom>Descrizione</Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary', lineHeight: 1.8 }}>
                            {event.description}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Ticket Sidebar */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', position: 'sticky', top: 80 }} elevation={0}>
                        <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 3 }}>
                            <Typography variant="h6" fontWeight="bold">🎟️ Biglietti</Typography>
                        </Box>
                        <Box sx={{ p: 3 }}>
                            {event.ticket_categories?.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                                    Nessun biglietto disponibile al momento.
                                </Typography>
                            ) : (
                                <Stack spacing={2}>
                                    {event.ticket_categories?.map((cat: any) => (
                                        <Card key={cat.id} variant="outlined" sx={{ borderRadius: 2 }}>
                                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                <Typography variant="subtitle1" fontWeight="bold">{cat.name}</Typography>
                                                <Typography variant="h5" color="primary" fontWeight="bold" sx={{ my: 1 }}>
                                                    {parseFloat(cat.price) === 0 ? 'GRATIS' : `${parseFloat(cat.price).toFixed(2)}€`}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                                                    {cat.remaining_quantity} rimasti su {cat.total_quantity}
                                                </Typography>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    size="small"
                                                    disabled={cat.remaining_quantity <= 0}
                                                    startIcon={<ShoppingCartIcon />}
                                                    onClick={() => { setSelectedCategory(cat); setBuyDialogOpen(true); }}
                                                    sx={{ textTransform: 'none', borderRadius: 2 }}
                                                >
                                                    {cat.remaining_quantity <= 0 ? 'Esaurito' : 'Acquista'}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Buy Dialog */}
            <Dialog open={buyDialogOpen} onClose={() => setBuyDialogOpen(false)}>
                <DialogTitle>Conferma Acquisto</DialogTitle>
                <DialogContent>
                    {!isLoggedIn ? (
                        <Typography>Devi effettuare l'accesso per acquistare un biglietto.</Typography>
                    ) : (
                        <>
                            <Typography>Stai acquistando un biglietto <strong>{selectedCategory?.name}</strong> per <strong>{event.title}</strong>.</Typography>
                            <Typography variant="h5" sx={{ mt: 2, textAlign: 'center' }} color="primary" fontWeight="bold">
                                {selectedCategory?.price == 0 ? 'GRATIS' : `${parseFloat(selectedCategory?.price).toFixed(2)}€`}
                            </Typography>
                            <Typography variant="caption" sx={{ mt: 2, display: 'block', fontStyle: 'italic' }}>
                                * Simulazione pagamento: nessun addebito reale.
                            </Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setBuyDialogOpen(false)} sx={{ textTransform: 'none' }}>Annulla</Button>
                    {isLoggedIn ? (
                        <Button onClick={handleBuyTicket} variant="contained" sx={{ textTransform: 'none' }}>Conferma</Button>
                    ) : (
                        <Button onClick={() => navigate('/login')} variant="contained" sx={{ textTransform: 'none' }}>Accedi</Button>
                    )}
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
}

export default EventDetail;
