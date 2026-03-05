import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ACCESS_TOKEN } from '../constants';
import {
    Container, Typography, Box, Button, Grid, Paper, Stack, Chip, Card, CardContent,
    Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, CircularProgress,
    Divider, IconButton, Avatar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TicketCard from '../components/TicketCard';
import type { SxProps, Theme } from '@mui/material';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/** Resolve potentially relative image URLs to absolute ones */
const resolveImg = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url}`;
};

const styles: Record<string, SxProps<Theme>> = {
    pageWrapper: {
        minHeight: '100vh',
        pt: 0,
        pb: 6,
        transition: 'background 0.3s ease',
    },
    heroBox: {
        height: { xs: 240, md: 380 },
        borderRadius: { xs: 0, md: 3 },
        mb: 3,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-end',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    heroOverlay: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(0deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.05) 100%)',
    },
    heroContent: {
        position: 'relative',
        zIndex: 1,
        p: { xs: 3, md: 4 },
        width: '100%',
    },
    contentPaper: {
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
    },
    posterImage: {
        width: '100%',
        maxWidth: { xs: 180, md: 220 },
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        objectFit: 'cover',
        aspectRatio: '2/3',
        flexShrink: 0,
    },
    clausesPaper: {
        mt: 3,
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'info.light',
        bgcolor: 'background.paper',
    },
    ticketSidebar: {
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 80,
    },
};

function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [buyDialogOpen, setBuyDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [myTickets, setMyTickets] = useState<any[]>([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const isLoggedIn = !!localStorage.getItem(ACCESS_TOKEN);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
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

        const fetchMyTickets = async () => {
            if (!isLoggedIn) return;
            try {
                const res = await api.get('/api/tickets/my/');
                setMyTickets(res.data);
            } catch (err) {
                console.error("Errore nel caricamento dei biglietti", err);
            }
        };

        fetchEvent();
        fetchMyTickets();
    }, [id, isLoggedIn]);

    const handleBuyTicket = async () => {
        if (!isLoggedIn) { navigate(`/login?redirect=/event/${id}`); return; }
        try {
            await api.post('/api/tickets/purchase/', { category: selectedCategory.id });
            setBuyDialogOpen(false);
            setSnackbar({ open: true, message: 'Biglietto acquistato con successo! 🎉', severity: 'success' });
            const res = await api.get(`/api/event/public/${id}/`);
            setEvent(res.data);
            const ticketsRes = await api.get('/api/tickets/my/');
            setMyTickets(ticketsRes.data);
        } catch (err: any) {
            setSnackbar({ open: true, message: err.response?.data?.error || 'Errore nell\'acquisto', severity: 'error' });
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (!event) return <Container sx={{ mt: 4 }}><Alert severity="error">Evento non trovato</Alert></Container>;

    const heroUrl = resolveImg(event.hero_image);
    const posterUrl = resolveImg(event.poster_image);
    const logoUrl = resolveImg(event.organizer_logo);
    const bgColor = event.background_color || '#FFFFFF';

    return (
        <Box sx={{
            ...styles.pageWrapper,
            background: `linear-gradient(180deg, ${bgColor}22 0%, ${bgColor}08 40%, transparent 80%)`,
        }}>
            <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 4 } }}>
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
                            ...styles.heroBox,
                            backgroundImage: heroUrl
                                ? `url(${heroUrl})`
                                : undefined,
                            background: heroUrl
                                ? undefined
                                : (t: Theme) => `linear-gradient(135deg, ${bgColor} 0%, ${t.palette.primary.dark} 60%, ${t.palette.primary.light} 100%)`,
                        }}>
                            {/* Dark overlay for text readability */}
                            <Box sx={styles.heroOverlay} />
                            {/* Title */}
                            <Box sx={styles.heroContent}>
                                {logoUrl && (
                                    <Avatar
                                        src={logoUrl}
                                        alt="Logo organizzatore"
                                        sx={{ width: 48, height: 48, mb: 1.5, border: '2px solid rgba(255,255,255,0.7)', bgcolor: 'white' }}
                                    />
                                )}
                                <Typography variant="h3" fontWeight="bold" sx={{ color: 'white', fontSize: { xs: '1.8rem', md: '3rem' }, textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                                    {event.title}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Main Content Paper — poster + info */}
                        <Paper sx={styles.contentPaper} elevation={0}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                {/* Poster Image */}
                                {posterUrl && (
                                    <Box
                                        component="img"
                                        src={posterUrl}
                                        alt="Poster evento"
                                        sx={styles.posterImage}
                                    />
                                )}

                                {/* Info + Description */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Stack direction="row" spacing={1} sx={{ mb: 2.5 }} flexWrap="wrap" useFlexGap>
                                        <Chip
                                            avatar={logoUrl ? <Avatar src={logoUrl} /> : undefined}
                                            icon={!logoUrl ? <PersonIcon /> : undefined}
                                            label={`Organizzato da: ${event.organizer_name}`}
                                            variant="outlined"
                                        />
                                        <Chip
                                            icon={<CalendarTodayIcon />}
                                            label={event.date
                                                ? new Date(event.date + 'T00:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
                                                : 'Data non impostata'}
                                            variant="outlined"
                                        />
                                        {event.start_time && (
                                            <Chip icon={<AccessTimeIcon />} label={event.start_time.substring(0, 5)} variant="outlined" />
                                        )}
                                        {event.end_time && (
                                            <Chip icon={<AccessTimeIcon />} label={`Fino alle ${event.end_time.substring(0, 5)}`} variant="outlined" />
                                        )}
                                        <Chip icon={<LocationOnIcon />} label={event.location} color="primary" />
                                    </Stack>

                                    <Typography variant="h6" fontWeight="bold" gutterBottom>Descrizione</Typography>
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary', lineHeight: 1.8 }}>
                                        {event.description}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>

                        {/* Ticket Clauses Section */}
                        {event.ticket_clauses && (
                            <Paper sx={styles.clausesPaper} elevation={0}>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                                    <InfoOutlinedIcon color="info" />
                                    <Typography variant="subtitle1" fontWeight="bold">Termini e Clausole</Typography>
                                </Stack>
                                <Divider sx={{ mb: 2 }} />
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary', lineHeight: 1.7 }}>
                                    {event.ticket_clauses}
                                </Typography>
                            </Paper>
                        )}
                    </Grid>

                    {/* Ticket Sidebar */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={styles.ticketSidebar} elevation={0}>
                            <Box sx={{ bgcolor: bgColor !== '#FFFFFF' ? bgColor : 'primary.main', color: 'primary.contrastText', p: 3 }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ color: bgColor !== '#FFFFFF' ? '#fff' : undefined, textShadow: bgColor !== '#FFFFFF' ? '0 1px 4px rgba(0,0,0,0.3)' : undefined }}>
                                    🎟️ Biglietti
                                </Typography>
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

                        {/* My Tickets Section */}
                        {isLoggedIn && Array.isArray(myTickets) && myTickets.filter((t: any) => t.event_id === parseInt(id || '0')).length > 0 && (
                            <Paper sx={{ mt: 3, borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'primary.light', bgcolor: 'primary.50' }} elevation={0}>
                                <Box sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', p: 2, display: 'flex', alignItems: 'center' }}>
                                    <LocalActivityIcon sx={{ mr: 1 }} />
                                    <Typography variant="h6" fontWeight="bold">I tuoi biglietti</Typography>
                                </Box>
                                <Box sx={{ p: 2 }}>
                                    <Stack spacing={1.5}>
                                        {myTickets
                                            .filter((t: any) => t.event_id === parseInt(id || '0'))
                                            .map((ticket: any) => (
                                                <TicketCard key={ticket.id} ticket={ticket} compact={true} />
                                            ))}
                                    </Stack>
                                </Box>
                            </Paper>
                        )}
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
                            <Button onClick={() => navigate(`/login?redirect=/event/${id}`)} variant="contained" sx={{ textTransform: 'none' }}>Accedi</Button>
                        )}
                    </DialogActions>
                </Dialog>

                <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                    <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>{snackbar.message}</Alert>
                </Snackbar>
            </Container>
        </Box>
    );
}

export default EventDetail;
