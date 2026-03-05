import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import AddressAutocomplete from "../components/AddressAutocomplete";
import type { LocationData } from "../components/AddressAutocomplete";
import { eventEditStyles as styles } from './EventEdit.styles';
import { AppTextField, AppDateField, AppSelectField } from '../components/form/index';
import {
    Typography, Button, Box, Paper, IconButton, Snackbar, Alert, CircularProgress,
    Stack, Grid, List, ListItem, ListItemText, Divider, Dialog, DialogTitle, DialogContent,
    DialogActions, Chip, Card, CardContent, Select, MenuItem, FormControl, InputLabel,
    useTheme, useMediaQuery, Drawer,
    Grow
} from "@mui/material";
import AppSidebar from "../components/Sidebar";
import type { SidebarItem } from "../components/Sidebar";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoIcon from '@mui/icons-material/Info';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PublishIcon from '@mui/icons-material/Publish';
import ArchiveIcon from '@mui/icons-material/Archive';
import { Html5QrcodeScanner } from 'html5-qrcode';

function EventEdit() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const filterParam = searchParams.get('filter') || 'active';
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentSection, setCurrentSection] = useState('general');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    const [event, setEvent] = useState<any>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [countryCode, setCountryCode] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
    const [ticketClauses, setTicketClauses] = useState("");
    const [posterImage, setPosterImage] = useState<File | null>(null);
    const [heroImage, setHeroImage] = useState<File | null>(null);
    const [organizerLogo, setOrganizerLogo] = useState<File | null>(null);

    const [categories, setCategories] = useState<any[]>([]);
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [catName, setCatName] = useState('');
    const [catPrice, setCatPrice] = useState('');
    const [catQty, setCatQty] = useState('');

    const [attendees, setAttendees] = useState<any[]>([]);
    const [scannerOpen, setScannerOpen] = useState(false);
    const scannerRef = useRef<any>(null);

    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

    useEffect(() => { fetchUser(); fetchEvent(); fetchAttendees(); }, [id]);

    const fetchUser = async () => {
        try { const res = await api.get("/api/user/profile/"); setUser(res.data); } catch (error) { console.error("Error fetching user profile", error); }
    };

    const fetchEvent = async () => {
        try {
            const res = await api.get(`/api/event/${id}/`);
            const eventData = res.data;
            setEvent(eventData);
            setTitle(eventData.title);
            setDescription(eventData.description);
            setLocation(eventData.location);
            setLatitude(eventData.latitude);
            setLongitude(eventData.longitude);
            setCountryCode(eventData.country_code || '');
            setEventDate(eventData.date || '');
            setStartTime(eventData.start_time ? eventData.start_time.substring(0, 5) : '');
            setEndTime(eventData.end_time ? eventData.end_time.substring(0, 5) : '');
            setBackgroundColor(eventData.background_color || '#FFFFFF');
            setTicketClauses(eventData.ticket_clauses || '');
            setCategories(eventData.ticket_categories || []);
        } catch (error) {
            setSnackbar({ open: true, message: "Errore nel caricamento dell'evento", severity: "error" });
        } finally { setLoading(false); }
    };

    const fetchAttendees = async () => {
        try { const res = await api.get(`/api/tickets/event/${id}/`); setAttendees(res.data); } catch (err) { console.error("Error fetching attendees", err); }
    };

    const handleLocationSelect = (data: LocationData) => {
        setLocation(data.address);
        setLatitude(data.latitude);
        setLongitude(data.longitude);
        setCountryCode(data.country_code);
    };

    const handleEventSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('location', location);
            if (latitude !== null) formData.append('latitude', String(latitude));
            if (longitude !== null) formData.append('longitude', String(longitude));
            if (countryCode) formData.append('country_code', countryCode);
            if (eventDate) formData.append('date', eventDate);
            if (startTime) formData.append('start_time', startTime);
            if (endTime) formData.append('end_time', endTime);
            formData.append('background_color', backgroundColor);
            formData.append('ticket_clauses', ticketClauses);
            if (posterImage) formData.append('poster_image', posterImage);
            if (heroImage) formData.append('hero_image', heroImage);
            if (organizerLogo) formData.append('organizer_logo', organizerLogo);

            await api.patch(`/api/event/update/${id}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSnackbar({ open: true, message: "Evento aggiornato con successo!", severity: "success" });
            fetchEvent();
        } catch (error: any) {
            const errData = error.response?.data;
            let msg = "Errore durante l'aggiornamento";
            if (errData && typeof errData === 'object') {
                const messages = Object.entries(errData).map(([k, v]) => `${k}: ${v}`).join('\n');
                if (messages) msg = messages;
            }
            setSnackbar({ open: true, message: msg, severity: "error" });
        } finally { setSaving(false); }
    };

    const handlePublish = async () => {
        try {
            await api.patch(`/api/event/update/${id}/`, { status: 'PUBLISHED' });
            setSnackbar({ open: true, message: "Evento pubblicato!", severity: "success" });
            fetchEvent();
        } catch (error: any) {
            const errData = error.response?.data;
            let msg = "Impossibile pubblicare";
            if (errData && typeof errData === 'object') {
                const messages = Object.entries(errData).map(([k, v]) => `${k}: ${v}`).join('\n');
                if (messages) msg = messages;
            }
            setSnackbar({ open: true, message: msg, severity: "error" });
        }
    };

    const handleArchive = async () => {
        if (!window.confirm("Sei sicuro di voler archiviare questo evento?")) return;
        try {
            await api.patch(`/api/event/update/${id}/`, { status: 'ARCHIVED' });
            setSnackbar({ open: true, message: "Evento archiviato!", severity: "success" });
            fetchEvent();
        } catch (error: any) {
            setSnackbar({ open: true, message: error.response?.data?.detail || "Errore nell'archiviazione", severity: "error" });
        }
    };

    const handleForceStatus = async (newStatus: string) => {
        try {
            await api.patch(`/api/event/${id}/force-status/`, { status: newStatus });
            setSnackbar({ open: true, message: `Stato cambiato a ${newStatus}`, severity: "success" });
            fetchEvent();
        } catch (error: any) {
            setSnackbar({ open: true, message: error.response?.data?.error || 'Errore nel cambio stato', severity: "error" });
        }
    };

    const handleOpenCategoryDialog = (cat: any = null) => {
        if (cat) { setEditingCategory(cat); setCatName(cat.name); setCatPrice(cat.price); setCatQty(cat.total_quantity); }
        else { setEditingCategory(null); setCatName(''); setCatPrice(''); setCatQty(''); }
        setCategoryDialogOpen(true);
    };

    const handleCategorySubmit = async () => {
        try {
            if (editingCategory) {
                await api.patch(`/api/tickets/categories/${editingCategory.id}/`, { name: catName, price: catPrice, total_quantity: catQty });
                setSnackbar({ open: true, message: 'Categoria aggiornata!', severity: 'success' });
            } else {
                await api.post('/api/tickets/categories/', { event: id, name: catName, price: catPrice, total_quantity: catQty });
                setSnackbar({ open: true, message: 'Categoria creata!', severity: 'success' });
            }
            setCategoryDialogOpen(false);
            fetchEvent();
        } catch (err) { setSnackbar({ open: true, message: 'Errore nella gestione della categoria', severity: 'error' }); }
    };

    const handleDeleteCategory = async (catId: number) => {
        if (!window.confirm("Sei sicuro di voler eliminare questa categoria?")) return;
        try {
            await api.delete(`/api/tickets/categories/delete/${catId}/`);
            setSnackbar({ open: true, message: 'Categoria eliminata!', severity: 'success' });
            fetchEvent();
        } catch (err: any) {
            setSnackbar({ open: true, message: err.response?.data?.[0] || "Errore durante l'eliminazione", severity: 'error' });
        }
    };

    const validateTicket = async (codeOrId: string | number, isCode = true) => {
        try {
            const payload = isCode ? { ticket_code: codeOrId } : { ticket_id: codeOrId };
            const res = await api.post('/api/tickets/validate/', payload);
            setSnackbar({ open: true, message: res.data.message + ' per ' + res.data.owner_name, severity: 'success' });
            fetchAttendees();
            if (scannerOpen) stopScanner();
        } catch (err: any) {
            setSnackbar({ open: true, message: err.response?.data?.error || 'Errore nella validazione', severity: 'error' });
        }
    };

    const startScanner = () => {
        setScannerOpen(true);
        setTimeout(() => {
            const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
            scanner.render((decodedText: string) => { scanner.clear(); validateTicket(decodedText, true); }, () => { });
            scannerRef.current = scanner;
        }, 100);
    };

    const stopScanner = () => {
        if (scannerRef.current) scannerRef.current.clear();
        setScannerOpen(false);
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    const sidebarItems: SidebarItem[] = [
        { id: 'general', label: 'Info Generali', icon: <InfoIcon /> },
        { id: 'tickets', label: 'Ticketing', icon: <ConfirmationNumberIcon /> },
        { id: 'checkin', label: 'Check-in', icon: <QrCodeScannerIcon /> },
    ];

    const handleSidebarChange = (section: string) => {
        setCurrentSection(section);
        setDrawerOpen(false);
    };

    return (
        <Box sx={styles.root}>
            {/* Mobile burger */}
            {isMobile && (
                <IconButton
                    onClick={() => setDrawerOpen(true)}
                    sx={styles.mobileMenuButton}
                >
                    <MenuIcon fontSize="small" />
                </IconButton>
            )}

            {/* Mobile drawer */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={styles.mobileDrawer}
            >
                <AppSidebar title="Gestione Evento" items={sidebarItems} activeItem={currentSection} onItemChange={handleSidebarChange} />
            </Drawer>

            {/* Desktop sidebar */}
            <Box sx={styles.desktopSidebar}>
                <AppSidebar title="Gestione Evento" items={sidebarItems} activeItem={currentSection} onItemChange={setCurrentSection} />
            </Box>

            {/* Main content */}
            <Box component="main" sx={styles.mainContent}>
                <Box sx={styles.contentWrapper}>
                    <Box sx={styles.headerRow}>
                        <IconButton onClick={() => navigate(`/dashboard?filter=${filterParam}`)} sx={styles.backButton}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h4" fontWeight="bold">Gestione Evento</Typography>
                        {event && (
                            <Chip
                                label={{
                                    DRAFT: 'Bozza', PUBLISHED: 'Pubblicato', TO_BE_REFUNDED: 'Da Rimborsare',
                                    CONCLUDED: 'Concluso', ARCHIVED: 'Archiviato'
                                }[event.status as 'DRAFT' | 'PUBLISHED' | 'TO_BE_REFUNDED' | 'CONCLUDED' | 'ARCHIVED'] || event.status}
                                color={{
                                    DRAFT: 'default' as const, PUBLISHED: 'success' as const, TO_BE_REFUNDED: 'warning' as const,
                                    CONCLUDED: 'info' as const, ARCHIVED: 'secondary' as const
                                }[event.status as 'DRAFT' | 'PUBLISHED' | 'TO_BE_REFUNDED' | 'CONCLUDED' | 'ARCHIVED'] || 'default' as const}
                                sx={styles.statusChip}
                            />
                        )}
                    </Box>

                    <Paper sx={styles.sectionPaper} elevation={0}>
                        {currentSection === 'general' && (
                            <Box component="form" onSubmit={handleEventSubmit} sx={styles.formContainer}>
                                <Typography variant="h5" gutterBottom sx={styles.sectionTitle}>Informazioni Generali</Typography>
                                <Grid container spacing={4}>
                                    <Grid size={{ xs: 12, md: 7 }}>
                                        <Stack spacing={4}>
                                            <AppTextField id="event-title-input" required fullWidth label="Titolo Evento" value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} disabled={event?.status === 'CONCLUDED' || event?.status === 'ARCHIVED'} />
                                            <AppTextField id="event-description-input" required fullWidth label="Descrizione" multiline minRows={1} maxRows={10} value={description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)} disabled={event?.status === 'CONCLUDED' || event?.status === 'ARCHIVED'} />
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 5 }}>
                                        <Stack spacing={4}>
                                            <AddressAutocomplete
                                                value={location}
                                                onChange={setLocation}
                                                onLocationSelect={handleLocationSelect}
                                                label="Luogo"
                                                placeholder="Cerca un luogo o indirizzo..."
                                                disabled={event?.status === 'CONCLUDED' || event?.status === 'ARCHIVED'}
                                            />
                                            <AppDateField id="event-date-input" required fullWidth label="Data Evento" type="date" value={eventDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEventDate(e.target.value)} disabled={event?.status === 'CONCLUDED' || event?.status === 'ARCHIVED'} />
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 6 }}>
                                                    <AppDateField id="event-start-time-input" fullWidth label="Ora Inizio" type="time" value={startTime} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartTime(e.target.value)} disabled={event?.status === 'CONCLUDED' || event?.status === 'ARCHIVED'} />
                                                </Grid>
                                                <Grid size={{ xs: 6 }}>
                                                    <AppDateField id="event-end-time-input" fullWidth label="Ora Fine" type="time" value={endTime} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndTime(e.target.value)} disabled={event?.status === 'CONCLUDED' || event?.status === 'ARCHIVED'} />
                                                </Grid>
                                            </Grid>
                                        </Stack>
                                    </Grid>
                                </Grid>

                                {/* Images & Styling Section */}
                                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Immagini e Stile</Typography>
                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Stack spacing={1}>
                                            <Typography variant="body2" fontWeight="bold">Manifesto (Poster)</Typography>
                                            {event?.poster_image && <img src={event.poster_image} alt="poster" style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8 }} />}
                                            <Button variant="outlined" component="label" size="small" sx={{ textTransform: 'none' }} disabled={event?.status === 'CONCLUDED' || event?.status === 'ARCHIVED'}>
                                                {posterImage ? posterImage.name : 'Carica Poster'}
                                                <input type="file" hidden accept="image/*" onChange={(e) => setPosterImage(e.target.files?.[0] || null)} />
                                            </Button>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Stack spacing={1}>
                                            <Typography variant="body2" fontWeight="bold">Hero Evento</Typography>
                                            {event?.hero_image && <img src={event.hero_image} alt="hero" style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8 }} />}
                                            <Button variant="outlined" component="label" size="small" sx={{ textTransform: 'none' }} disabled={event?.status === 'CONCLUDED' || event?.status === 'ARCHIVED'}>
                                                {heroImage ? heroImage.name : 'Carica Hero'}
                                                <input type="file" hidden accept="image/*" onChange={(e) => setHeroImage(e.target.files?.[0] || null)} />
                                            </Button>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Stack spacing={1}>
                                            <Typography variant="body2" fontWeight="bold">Logo Organizzatore</Typography>
                                            {event?.organizer_logo && <img src={event.organizer_logo} alt="logo" style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'contain', borderRadius: 8 }} />}
                                            <Button variant="outlined" component="label" size="small" sx={{ textTransform: 'none' }} disabled={event?.status === 'CONCLUDED' || event?.status === 'ARCHIVED'}>
                                                {organizerLogo ? organizerLogo.name : 'Carica Logo'}
                                                <input type="file" hidden accept="image/*" onChange={(e) => setOrganizerLogo(e.target.files?.[0] || null)} />
                                            </Button>
                                        </Stack>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={3} sx={{ mt: 2 }}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Stack spacing={1}>
                                            <Typography variant="body2" fontWeight="bold">Colore di sfondo</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} disabled={event?.status === 'CONCLUDED' || event?.status === 'ARCHIVED'} style={{ width: 48, height: 36, border: 'none', cursor: 'pointer', borderRadius: 4 }} />
                                                <Typography variant="body2" color="text.secondary">{backgroundColor}</Typography>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>Google Wallet Class ID</Typography>
                                        <Typography variant="body2" color="text.secondary">{event?.google_wallet_class_id || 'Verrà generato al salvataggio'}</Typography>
                                    </Grid>
                                </Grid>

                                {/* Ticket Clauses */}
                                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Clausole Biglietto</Typography>
                                <AppTextField id="ticket-clauses-input" fullWidth label="Clausole del Biglietto" multiline minRows={2} maxRows={6} value={ticketClauses} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTicketClauses(e.target.value)} disabled={event?.status === 'CONCLUDED' || event?.status === 'ARCHIVED'} />

                                <Box sx={styles.actionBar}>
                                    {event?.status !== 'CONCLUDED' && event?.status !== 'ARCHIVED' && (
                                        <Button type="submit" variant="contained" disabled={saving} sx={styles.saveButton}>
                                            {saving ? "Salvataggio..." : "Salva Modifiche"}
                                        </Button>
                                    )}
                                    {event?.status === 'DRAFT' && (
                                        <Button variant="contained" color="success" startIcon={<PublishIcon />} onClick={handlePublish} sx={styles.actionButton}>
                                            Pubblica Evento
                                        </Button>
                                    )}
                                    {event?.status === 'CONCLUDED' && (
                                        <Button variant="contained" color="secondary" startIcon={<ArchiveIcon />} onClick={handleArchive} sx={styles.actionButton}>
                                            Archivia Evento
                                        </Button>
                                    )}
                                    {user?.all_permissions?.includes('events.override_status') && (
                                        <AppSelectField
                                            id="admin-status-select"
                                            labelId="admin-status-label"
                                            label="Cambio Stato Admin"
                                            value={event?.status || ''}
                                            onChange={(e) => handleForceStatus(e.target.value as string)}
                                            sx={styles.forceStatusControl}
                                        >
                                            <MenuItem value="DRAFT">Bozza</MenuItem>
                                            <MenuItem value="PUBLISHED">Pubblicato</MenuItem>
                                            <MenuItem value="TO_BE_REFUNDED">Da Rimborsare</MenuItem>
                                            <MenuItem value="CONCLUDED">Concluso</MenuItem>
                                            <MenuItem value="ARCHIVED">Archiviato</MenuItem>
                                        </AppSelectField>
                                    )}
                                </Box>
                            </Box>
                        )}

                        {currentSection === 'tickets' && (
                            <Box>
                                <Box sx={styles.ticketsHeader}>
                                    <Typography variant="h5" fontWeight="bold">Gestione Biglietti</Typography>
                                    <Button variant="contained" color="warning" startIcon={<AddIcon />} onClick={() => handleOpenCategoryDialog()} sx={styles.actionButton}>
                                        Nuova Categoria
                                    </Button>
                                </Box>
                                <Grid container spacing={2}>
                                    {categories.map((cat: any) => (
                                        <Grid size={{ xs: 12, sm: 6 }} key={cat.id}>
                                            <Card variant="outlined" sx={styles.categoryCard}>
                                                <CardContent>
                                                    <Box sx={styles.categoryCardContent}>
                                                        <Box>
                                                            <Typography variant="h6">{cat.name}</Typography>
                                                            <Typography variant="h5" sx={styles.categoryPrice}>{parseFloat(cat.price).toFixed(2)}€</Typography>
                                                            <Typography variant="body2" color="text.secondary">Disponibilità: {cat.remaining_quantity} / {cat.total_quantity}</Typography>
                                                        </Box>
                                                        <Stack direction="row" spacing={1}>
                                                            <IconButton size="small" onClick={() => handleOpenCategoryDialog(cat)} color="primary"><EditIcon /></IconButton>
                                                            <IconButton size="small" onClick={() => handleDeleteCategory(cat.id)} color="error"><DeleteIcon /></IconButton>
                                                        </Stack>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                    {categories.length === 0 && <Typography sx={{ mt: 2, ml: 2 }} color="text.secondary">Nessuna categoria creata.</Typography>}
                                </Grid>
                            </Box>
                        )}

                        {currentSection === 'checkin' && (
                            <Box>
                                <Typography variant="h5" gutterBottom fontWeight="bold">Validazione Ingressi</Typography>
                                <Grid container spacing={4} sx={{ mt: 1 }}>
                                    <Grid size={{ xs: 12, md: 5 }}>
                                        <Button fullWidth variant="contained" color="secondary" startIcon={<QrCodeScannerIcon />} onClick={startScanner}
                                            sx={styles.scannerButton}>
                                            Avvia Scanner QR
                                        </Button>
                                        <Paper variant="outlined" sx={styles.scannerPaper}>
                                            <Typography variant="body2" color="text.secondary">Utilizza la fotocamera per scansionare i biglietti dei partecipanti all'ingresso.</Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 7 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Partecipanti ({attendees.length})</Typography>
                                        <List sx={styles.attendeesList}>
                                            {attendees.map((t: any) => (
                                                <ListItem key={t.id} divider secondaryAction={
                                                    !t.is_checked_in ? (
                                                        <Button size="small" variant="outlined" onClick={() => validateTicket(t.id, false)} sx={styles.validateButton}>Valida</Button>
                                                    ) : (
                                                        <Chip size="small" label="Validato" color="success" icon={<CheckCircleIcon />} />
                                                    )
                                                }>
                                                    <ListItemText primary={t.owner_name} secondary={`${t.category_name} - ${t.owner_email}`} />
                                                </ListItem>
                                            ))}
                                            {attendees.length === 0 && <ListItem><ListItemText secondary="Nessun partecipante al momento" /></ListItem>}
                                        </List>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </Paper>
                </Box>
            </Box>

            {/* Category Dialog */}
            <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>{editingCategory ? "Modifica Categoria" : "Nuova Categoria"}</DialogTitle>
                <DialogContent>
                    <AppTextField fullWidth label="Nome" margin="normal" value={catName} onChange={(e: any) => setCatName(e.target.value)} />
                    <AppTextField fullWidth label="Prezzo (€)" type="number" margin="normal" value={catPrice} onChange={(e: any) => setCatPrice(e.target.value)} />
                    <AppTextField fullWidth label="Quantità Totale" type="number" margin="normal" value={catQty} onChange={(e: any) => setCatQty(e.target.value)} />
                </DialogContent>
                <DialogActions sx={styles.dialogActions}>
                    <Button onClick={() => setCategoryDialogOpen(false)} sx={styles.cancelButton}>Annulla</Button>
                    <Button onClick={handleCategorySubmit} variant="contained" color="warning" sx={styles.submitButton}>
                        {editingCategory ? "Aggiorna" : "Crea"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Scanner Dialog */}
            <Dialog open={scannerOpen} onClose={stopScanner} fullWidth maxWidth="xs">
                <DialogTitle>Scansiona Biglietto</DialogTitle>
                <DialogContent><Box id="reader" sx={{ width: '100%' }}></Box></DialogContent>
                <DialogActions><Button onClick={stopScanner} sx={styles.cancelButton}>Chiudi</Button></DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity as any} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}

export default EventEdit;
