import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ACCESS_TOKEN } from '../constants';
import {
    Container, Typography, Box, Button, Grid, Paper, Stack, Chip, Card, CardContent,
    Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, CircularProgress,
    Divider, IconButton, Avatar, Collapse,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TicketCard from '../components/TicketCard';
import type { SxProps, Theme } from '@mui/material';

const getContrastColor = (hex: string) => {
    if (!hex) return '#000000';
    if (hex.indexOf('#') === 0) hex = hex.slice(1);
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    if (hex.length !== 6) return '#000000';
    const r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#000000' : '#FFFFFF';
};

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
    const [posterZoomOpen, setPosterZoomOpen] = useState(false);
    const [posterScale, setPosterScale] = useState(1);
    const [ticketsOpen, setTicketsOpen] = useState(true);
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
            background: `linear-gradient(180deg, ${bgColor}88 0%, ${bgColor}33 30%, transparent 80%)`,
        }}>
            <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 4 } }}>
                <Box sx={{ mb: 2 }}>
                    <Button onClick={() => navigate('/')} startIcon={<ArrowBackIcon />} variant="text" sx={{ color: 'text.secondary', fontWeight: 'bold', '&:hover': { bgcolor: 'transparent', color: 'text.primary' } }}>
                        Indietro
                    </Button>
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
                                        sx={{ ...styles.posterImage, cursor: 'zoom-in', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}
                                        onClick={() => {
                                            setPosterScale(1);
                                            setPosterZoomOpen(true);
                                        }}
                                    />
                                )}

                                {/* Info + Description */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>

                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>
                                            Organizzato da
                                        </Typography>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            {logoUrl ? <Avatar src={logoUrl} sx={{ width: 48, height: 48 }} /> : <Avatar sx={{ width: 48, height: 48 }}><PersonIcon /></Avatar>}
                                            <Typography variant="h6" fontWeight="bold">{event.organizer_name}</Typography>
                                        </Stack>
                                    </Box>

                                    <Grid container spacing={3} sx={{ mb: 4 }}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            {event.date ? (() => {
                                                const dObj = new Date(event.date + 'T00:00:00');
                                                const mStr = dObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                                                const dNum = dObj.getDate().toString();
                                                const dayName = dObj.toLocaleDateString('it-IT', { weekday: 'long' });
                                                return (
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Box sx={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            minWidth: '60px',
                                                        }}>
                                                            <Typography variant="button" sx={{ color: 'text.secondary', fontWeight: 600, lineHeight: 1, letterSpacing: 1, mb: 0.5 }}>
                                                                {mStr}
                                                            </Typography>
                                                            <Typography variant="h4" sx={{ color: bgColor !== '#FFFFFF' ? bgColor : 'primary.main', fontWeight: 800, lineHeight: 1 }}>
                                                                {dNum}
                                                            </Typography>
                                                        </Box>
                                                        {/* Vertical Divider */}
                                                        <Box sx={{ width: '1px', height: '40px', bgcolor: 'divider', mx: 1 }} />
                                                        <Box sx={{ flex: 1 }}>
                                                            {(event.start_time || event.end_time) && (
                                                                <Stack spacing={0.5}>
                                                                    {event.start_time && (
                                                                        <Box>
                                                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, mb: 0.5 }}>Apertura</Typography>
                                                                            <Typography variant="h6" sx={{ fontWeight: 800, color: bgColor !== '#FFFFFF' ? bgColor : 'primary.main', lineHeight: 1 }}>{event.start_time.substring(0, 5)}</Typography>
                                                                        </Box>
                                                                    )}
                                                                    {event.end_time && (
                                                                        <Box sx={{ mt: event.start_time ? 1.5 : 0 }}>
                                                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, mb: 0.5 }}>Chiusura</Typography>
                                                                            <Typography variant="h6" sx={{ fontWeight: 800, color: bgColor !== '#FFFFFF' ? bgColor : 'primary.main', lineHeight: 1 }}>{event.end_time.substring(0, 5)}</Typography>
                                                                        </Box>
                                                                    )}
                                                                </Stack>
                                                            )}
                                                        </Box>
                                                    </Stack>
                                                );
                                            })() : (
                                                <Typography color="text.secondary">Data non impostata</Typography>
                                            )}
                                        </Grid>

                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Stack
                                                direction="row"
                                                spacing={2}
                                                alignItems="center"
                                                sx={{ p: 1, ml: -1 }}
                                            >
                                                <Box sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    minWidth: '60px',
                                                    color: bgColor !== '#FFFFFF' ? bgColor : 'primary.main',
                                                }}>
                                                    <LocationOnIcon sx={{ fontSize: 32 }} />
                                                </Box>
                                                <Box sx={{ width: '1px', height: '40px', bgcolor: 'divider', mx: 1 }} />
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography
                                                        variant="body1"
                                                        fontWeight="medium"
                                                        onClick={() => {
                                                            if (!event.location) return;
                                                            const isApple = /Mac|iPod|iPhone|iPad/.test(navigator.platform) || /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
                                                            const url = isApple
                                                                ? `http://maps.apple.com/?q=${encodeURIComponent(event.location)}`
                                                                : `https://maps.google.com/?q=${encodeURIComponent(event.location)}`;
                                                            window.open(url, '_blank');
                                                        }}
                                                        sx={{
                                                            cursor: 'pointer',
                                                            display: 'inline-block',
                                                            color: bgColor !== '#FFFFFF' ? bgColor : 'primary.main',
                                                            textDecoration: 'underline',
                                                            textUnderlineOffset: '2px',
                                                            '&:hover': { opacity: 0.8 }
                                                        }}
                                                    >
                                                        {event.location}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Grid>
                                    </Grid>

                                    <Divider sx={{ mb: 4 }} />

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
                        <Box sx={{ position: 'sticky', top: 80, maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' }, msOverflowStyle: 'none', scrollbarWidth: 'none', pb: 2 }}>
                            <Paper sx={styles.ticketSidebar} elevation={0}>
                                <Box
                                    onClick={() => setTicketsOpen(!ticketsOpen)}
                                    sx={{
                                        bgcolor: bgColor !== '#FFFFFF' ? bgColor : 'primary.main',
                                        color: bgColor !== '#FFFFFF' ? getContrastColor(bgColor) : 'primary.contrastText',
                                        px: 3,
                                        py: 2.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        userSelect: 'none'
                                    }}
                                >
                                    <Box sx={{ width: 32, display: 'flex', justifyContent: 'flex-start', mr: 1 }}>
                                        <LocalActivityIcon sx={{ color: 'inherit', display: 'flex' }} />
                                    </Box>
                                    <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1, color: 'inherit', textShadow: bgColor !== '#FFFFFF' ? (getContrastColor(bgColor) === '#FFFFFF' ? '0 1px 4px rgba(0,0,0,0.3)' : 'none') : undefined }}>
                                        Biglietti
                                    </Typography>
                                    <IconButton size="small" sx={{ color: 'inherit', p: 0 }}>
                                        {ticketsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </IconButton>
                                </Box>
                                <Collapse in={ticketsOpen}>
                                    <Box sx={{ p: 3 }}>
                                        {event.ticket_categories?.length === 0 ? (
                                            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                                                Nessun biglietto disponibile al momento.
                                            </Typography>
                                        ) : (
                                            <Stack spacing={2}>
                                                {event.ticket_categories?.map((cat: any) => {
                                                    const bgType = cat.card_bg_type || 'solid';
                                                    const bgColor1 = cat.card_bg_color || '#FFFFFF';
                                                    const bgColor2 = cat.card_bg_color2 || '#FFFFFF';
                                                    const background = bgType === 'gradient' ? `linear-gradient(135deg, ${bgColor1}, ${bgColor2})` : bgColor1;
                                                    const textColor = getContrastColor(bgColor1);
                                                    const secondaryTextColor = textColor === '#FFFFFF' ? 'rgba(255,255,255,0.7)' : 'text.secondary';

                                                    // Handle Sale Dates Logic
                                                    const now = new Date();
                                                    let isAvailable = true;
                                                    let availabilityMsg = "";

                                                    if (cat.sale_start_date) {
                                                        const startDateTime = new Date(`${cat.sale_start_date}T${cat.sale_start_time || '00:00'}`);
                                                        if (now < startDateTime) {
                                                            isAvailable = false;
                                                            availabilityMsg = `Inizio vendite: ${startDateTime.toLocaleDateString('it-IT')} ${cat.sale_start_time?.substring(0, 5) || ''}`;
                                                        }
                                                    }
                                                    if (cat.sale_end_date && isAvailable) {
                                                        const endDateTime = new Date(`${cat.sale_end_date}T${cat.sale_end_time || '23:59'}`);
                                                        if (now > endDateTime) {
                                                            isAvailable = false;
                                                            availabilityMsg = "Vendite terminate";
                                                        }
                                                    }

                                                    if (cat.remaining_quantity <= 0) {
                                                        isAvailable = false;
                                                        availabilityMsg = "Esaurito";
                                                    }

                                                    return (
                                                        <Card key={cat.id} variant="outlined" sx={{ borderRadius: 2, background, color: textColor, borderColor: 'divider' }}>
                                                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                                <Typography variant="subtitle1" fontWeight="bold">{cat.name}</Typography>

                                                                {cat.description && (
                                                                    <Typography variant="body2" sx={{ color: secondaryTextColor, mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                                        {cat.description}
                                                                    </Typography>
                                                                )}

                                                                <Typography variant="h5" sx={{ my: 1, fontWeight: 'bold' }}>
                                                                    {parseFloat(cat.price) === 0 ? 'GRATIS' : `${parseFloat(cat.price).toFixed(2)}€`}
                                                                </Typography>

                                                                <Typography variant="caption" display="block" sx={{ mb: 1.5, color: secondaryTextColor }}>
                                                                    {cat.remaining_quantity} rimasti su {cat.total_quantity}
                                                                    {availabilityMsg && ` • ${availabilityMsg}`}
                                                                </Typography>

                                                                <Button
                                                                    fullWidth
                                                                    variant="contained"
                                                                    size="small"
                                                                    disabled={!isAvailable}
                                                                    startIcon={<ShoppingCartIcon />}
                                                                    onClick={() => { setSelectedCategory(cat); setBuyDialogOpen(true); }}
                                                                    sx={{
                                                                        textTransform: 'none',
                                                                        borderRadius: 2,
                                                                        bgcolor: textColor === '#FFFFFF' ? 'rgba(255,255,255,0.2)' : 'primary.main',
                                                                        color: textColor === '#FFFFFF' ? '#FFFFFF' : 'primary.contrastText',
                                                                        '&:hover': {
                                                                            bgcolor: textColor === '#FFFFFF' ? 'rgba(255,255,255,0.3)' : 'primary.dark',
                                                                        }
                                                                    }}
                                                                >
                                                                    {isAvailable ? 'Acquista' : (availabilityMsg || 'Non Disponibile')}
                                                                </Button>
                                                            </CardContent>
                                                        </Card>
                                                    );
                                                })}
                                            </Stack>
                                        )}
                                    </Box>
                                </Collapse>
                            </Paper>

                            {/* My Tickets Section */}
                            {isLoggedIn && Array.isArray(myTickets) && myTickets.filter((t: any) => t.event_id === parseInt(id || '0')).length > 0 && (
                                <Paper sx={{ mt: 3, ...styles.ticketSidebar }} elevation={0}>
                                    <Box sx={{ bgcolor: bgColor !== '#FFFFFF' ? bgColor : 'primary.main', color: bgColor !== '#FFFFFF' ? getContrastColor(bgColor) : 'primary.contrastText', px: 3, py: 2.5, display: 'flex', alignItems: 'center' }}>
                                        <Box sx={{ width: 32, display: 'flex', justifyContent: 'flex-start', mr: 1 }}>
                                            <LocalActivityIcon sx={{ color: 'inherit' }} />
                                        </Box>
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
                        </Box>
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

                {/* Poster Zoom Dialog */}
                <Dialog
                    open={posterZoomOpen}
                    onClose={() => setPosterZoomOpen(false)}
                    maxWidth="md"
                    PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none', overflow: 'hidden' } }}
                >
                    <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 1, bgcolor: 'rgba(0,0,0,0.6)', borderRadius: 2, p: 0.5 }}>
                            <IconButton onClick={() => setPosterScale(s => Math.max(0.5, s - 0.25))} sx={{ color: 'white' }}><ZoomOutIcon /></IconButton>
                            <IconButton onClick={() => setPosterScale(1)} sx={{ color: 'white' }}><RestartAltIcon /></IconButton>
                            <IconButton onClick={() => setPosterScale(s => Math.min(3, s + 0.25))} sx={{ color: 'white' }}><ZoomInIcon /></IconButton>
                            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.3)', mx: 0.5 }} />
                            <IconButton onClick={() => setPosterZoomOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
                        </Box>
                        <Box
                            component="img"
                            src={posterUrl || ''}
                            alt="Poster Ingrandito"
                            sx={{
                                maxHeight: '90vh',
                                maxWidth: '100%',
                                objectFit: 'contain',
                                transform: `scale(${posterScale})`,
                                transition: 'transform 0.2s',
                                borderRadius: 1
                            }}
                        />
                    </Box>
                </Dialog>

                <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                    <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>{snackbar.message}</Alert>
                </Snackbar>
            </Container>
        </Box>
    );
}

export default EventDetail;
