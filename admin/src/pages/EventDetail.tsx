import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import {
    Container, Typography, Box, Button, Grid, Paper, Divider, IconButton, Stack, Card, CardContent,
    Chip, Dialog, DialogTitle, DialogContent, DialogActions, List, CircularProgress, Snackbar, Alert,
    Tooltip, Avatar,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { hasPermission, AppUser } from "../utils/permissionUtils";

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet + Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

import { QRCodeSVG } from 'qrcode.react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
        borderRadius: 3,
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
        mb: 3,
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
        mb: 3,
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

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    map.setView(center, 15);
    return null;
}

function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const filterParam = searchParams.get('filter') || 'active';
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<AppUser | null>(null);
    const [coords, setCoords] = useState<[number, number]>([41.9028, 12.4964]);

    const [myTickets, setMyTickets] = useState<any[]>([]);
    const [buyDialogOpen, setBuyDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => { fetchData(); fetchUser(); }, [id]);
    useEffect(() => { if (event && user) fetchMyTickets(); }, [event, user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/event/${id}/`);
            setEvent(res.data);
            if (res.data.latitude && res.data.longitude) {
                setCoords([parseFloat(res.data.latitude), parseFloat(res.data.longitude)]);
            } else {
                geocodeAddress(res.data.location);
            }
        } catch (err) {
            setError("Errore nel caricamento dell'evento.");
        } finally {
            setLoading(false);
        }
    };

    const fetchUser = async () => {
        try { const res = await api.get("/api/user/profile/"); setUser(res.data); } catch (error) { console.error("Error fetching user", error); }
    };

    const fetchMyTickets = async () => {
        try {
            const res = await api.get('/api/tickets/my/');
            setMyTickets(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error("Error fetching my tickets", err); }
    };

    const geocodeAddress = async (address: string) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const data = await response.json();
            if (data?.length > 0) setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } catch (err) { console.error("Geocoding error", err); }
    };

    const handleBack = () => navigate(`/dashboard?filter=${filterParam}`);

    const handleBuyTicket = async () => {
        try {
            await api.post('/api/tickets/purchase/', { category: selectedCategory.id });
            setSnackbar({ open: true, message: 'Biglietto acquistato con successo!', severity: 'success' });
            setBuyDialogOpen(false);
            fetchData();
        } catch (err: any) {
            setSnackbar({ open: true, message: "Errore nell'acquisto: " + (err.response?.data?.error || 'Riprova più tardi'), severity: 'error' });
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (error || !event) return <Container sx={{ mt: 4 }}><Alert severity="error">{error || "Evento non trovato"}</Alert><Button onClick={handleBack} sx={{ mt: 2 }}>Torna indietro</Button></Container>;

    const isOrganizer = event.organizer === user?.id || user?.is_super_admin;
    const canPurchase = hasPermission(user, 'tickets.purchase') || user?.is_super_admin || isOrganizer;
    const myTicketsForThisEvent = myTickets.filter((t: any) => t.event_id === parseInt(id!));

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
                    <IconButton onClick={handleBack} sx={{ mr: 2, bgcolor: 'background.paper', boxShadow: 1, border: '1px solid', borderColor: 'divider' }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>Dettagli Evento</Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        {/* Hero Banner */}
                        <Box sx={{
                            ...styles.heroBox,
                            backgroundImage: heroUrl ? `url(${heroUrl})` : undefined,
                            background: heroUrl
                                ? undefined
                                : (t: Theme) => `linear-gradient(135deg, ${bgColor} 0%, ${t.palette.primary.dark} 60%, ${t.palette.primary.light} 100%)`,
                        }}>
                            <Box sx={styles.heroOverlay} />
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

                        {/* Main Content — poster + info */}
                        <Paper sx={styles.contentPaper} elevation={0}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                {posterUrl && (
                                    <Box
                                        component="img"
                                        src={posterUrl}
                                        alt="Poster evento"
                                        sx={styles.posterImage}
                                    />
                                )}
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
                                        {event.start_time && <Chip icon={<AccessTimeIcon />} label={event.start_time.substring(0, 5)} variant="outlined" />}
                                        {event.end_time && <Chip icon={<AccessTimeIcon />} label={`Fino alle ${event.end_time.substring(0, 5)}`} variant="outlined" />}
                                        <Chip icon={<LocationOnIcon />} label={event.location} color="primary" />
                                    </Stack>

                                    <Typography variant="h6" fontWeight="bold" gutterBottom>Descrizione</Typography>
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary', lineHeight: 1.8 }}>
                                        {event.description}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>

                        {/* Ticket Clauses */}
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

                        {/* Map */}
                        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }} elevation={0}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationOnIcon color="primary" /> Posizione sulla mappa
                            </Typography>
                            <Box sx={{ height: 400, width: '100%', borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                                <MapContainer center={coords} zoom={15} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={coords}><Popup>{event.title}<br />{event.location}</Popup></Marker>
                                    <ChangeView center={coords} />
                                </MapContainer>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Sidebar */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={styles.ticketSidebar} elevation={0}>
                            <Box sx={{ bgcolor: bgColor !== '#FFFFFF' ? bgColor : 'primary.main', color: 'primary.contrastText', p: 2.5 }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ color: bgColor !== '#FFFFFF' ? '#fff' : undefined, textShadow: bgColor !== '#FFFFFF' ? '0 1px 4px rgba(0,0,0,0.3)' : undefined }}>
                                    🎟️ Biglietti
                                </Typography>
                            </Box>
                            <Box sx={{ p: 2.5 }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 1 }}>Scegli il tuo biglietto</Typography>
                                <List>
                                    {event.ticket_categories.length === 0 && (
                                        <Typography variant="body2" color="text.secondary">Nessun biglietto disponibile al momento.</Typography>
                                    )}
                                    {event.ticket_categories.map((cat: any) => (
                                        <Card key={cat.id} sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }} elevation={0}>
                                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box>
                                                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>{cat.name}</Typography>
                                                        <Typography variant="h5" color="primary" fontWeight="bold">
                                                            {cat.price == 0 ? "GRATIS" : `${parseFloat(cat.price).toFixed(2)}€`}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {cat.remaining_quantity} rimasti su {cat.total_quantity}
                                                        </Typography>
                                                    </Box>
                                                    {canPurchase && (
                                                        <Button variant="contained" size="small" disabled={cat.remaining_quantity <= 0} startIcon={<ShoppingCartIcon />}
                                                            onClick={() => { setSelectedCategory(cat); setBuyDialogOpen(true); }}
                                                            sx={{ textTransform: 'none', borderRadius: 2 }}>
                                                            Acquista
                                                        </Button>
                                                    )}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </List>

                                {myTicketsForThisEvent.length > 0 && (
                                    <>
                                        <Divider sx={{ my: 3 }} />
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>I Tuoi Biglietti</Typography>
                                        {myTicketsForThisEvent.map((ticket: any) => (
                                            <Paper key={ticket.id} sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="bold">{ticket.category_name}</Typography>
                                                        <Typography variant="caption" display="block">Codice: {ticket.ticket_code.substring(0, 8)}...</Typography>
                                                        {ticket.is_checked_in && <Chip size="small" label="Validato" color="success" sx={{ mt: 1 }} icon={<CheckCircleIcon />} />}
                                                    </Box>
                                                    <IconButton onClick={() => setSelectedCategory({ ticket })} sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}>
                                                        <QrCodeIcon color="primary" />
                                                    </IconButton>
                                                </Box>
                                            </Paper>
                                        ))}
                                    </>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Dialog Acquisto */}
                <Dialog open={buyDialogOpen} onClose={() => setBuyDialogOpen(false)}>
                    <DialogTitle>Conferma Acquisto</DialogTitle>
                    <DialogContent>
                        <Typography>Stai acquistando un biglietto <strong>{selectedCategory?.name}</strong> per l'evento <strong>{event.title}</strong>.</Typography>
                        <Typography variant="h5" sx={{ mt: 2, textAlign: 'center' }} color="primary" fontWeight="bold">
                            Prezzo: {selectedCategory?.price == 0 ? "GRATIS" : `${parseFloat(selectedCategory?.price).toFixed(2)}€`}
                        </Typography>
                        <Typography variant="caption" sx={{ mt: 2, display: 'block', fontStyle: 'italic' }}>
                            * Simulazione pagamento: l'acquisto verrà registrato immediatamente senza addebito reale.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setBuyDialogOpen(false)} sx={{ textTransform: 'none' }}>Annulla</Button>
                        <Button onClick={handleBuyTicket} variant="contained" color="primary" sx={{ textTransform: 'none' }}>Conferma e "Paga"</Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog QR Code */}
                <Dialog open={!!selectedCategory?.ticket} onClose={() => setSelectedCategory(null)}>
                    <DialogTitle sx={{ textAlign: 'center' }}>Il Tuo Biglietto</DialogTitle>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 4 }}>
                        {selectedCategory?.ticket && (
                            <>
                                <Typography variant="h6" gutterBottom>{selectedCategory.ticket.category_name}</Typography>
                                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: 2, mb: 2 }}>
                                    <QRCodeSVG value={selectedCategory.ticket.ticket_code} size={200} />
                                </Box>
                                <Typography variant="caption" color="text.secondary">Mostra questo QR Code all'ingresso</Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>{selectedCategory.ticket.owner_name}</Typography>
                                <Typography variant="caption">{selectedCategory.ticket.ticket_code}</Typography>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

                <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                    <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
                </Snackbar>
            </Container>
        </Box>
    );
}

export default EventDetail;
