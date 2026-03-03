import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import AddressAutocomplete from "../components/AddressAutocomplete";
import {
    Container, Typography, TextField, Button, Box, Paper, IconButton, Snackbar, Alert, CircularProgress,
    Stack, Grid, Tabs, Tab, List, ListItem, ListItemText, Divider, Dialog, DialogTitle, DialogContent,
    DialogActions, Chip, Card, CardContent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoIcon from '@mui/icons-material/Info';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Html5QrcodeScanner } from 'html5-qrcode';

function EventEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [user, setUser] = useState<any>(null);

    const [event, setEvent] = useState<any>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [eventDate, setEventDate] = useState("");



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

    const formatDateTimeForInput = (utcString: string) => {
        if (!utcString) return "";
        const d = new Date(utcString);
        if (isNaN(d.getTime())) return "";
        const pad = (n: number) => n.toString().padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const fetchEvent = async () => {
        try {
            const res = await api.get(`/api/event/${id}/`);
            const eventData = res.data;
            setEvent(eventData);
            setTitle(eventData.title);
            setDescription(eventData.description);
            setLocation(eventData.location);
            setEventDate(formatDateTimeForInput(eventData.event_date));
            setCategories(eventData.ticket_categories || []);
        } catch (error) {
            setSnackbar({ open: true, message: "Errore nel caricamento dell'evento", severity: "error" });
        } finally { setLoading(false); }
    };

    const fetchAttendees = async () => {
        try { const res = await api.get(`/api/tickets/event/${id}/`); setAttendees(res.data); } catch (err) { console.error("Error fetching attendees", err); }
    };

    const handleEventSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.patch(`/api/event/update/${id}/`, {
                title, description, location,
                event_date: eventDate ? new Date(eventDate).toISOString() : null,
            });
            setSnackbar({ open: true, message: "Evento aggiornato con successo!", severity: "success" });
            fetchEvent();
        } catch (error) {
            setSnackbar({ open: true, message: "Errore durante l'aggiornamento", severity: "error" });
        } finally { setSaving(false); }
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

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2, bgcolor: 'background.paper', boxShadow: 1, border: '1px solid', borderColor: 'divider' }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" fontWeight="bold">Gestione Evento</Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }} elevation={0}>
                        <Tabs orientation="vertical" value={activeTab} onChange={(_e, v) => setActiveTab(v)}
                            sx={{ borderRight: 1, borderColor: 'divider', minHeight: 200 }}>
                            <Tab icon={<InfoIcon />} iconPosition="start" label="Info Generali" sx={{ justifyContent: 'flex-start', textTransform: 'none', fontWeight: 'bold' }} />
                            <Tab icon={<ConfirmationNumberIcon />} iconPosition="start" label="Ticketing" sx={{ justifyContent: 'flex-start', textTransform: 'none', fontWeight: 'bold' }} />
                            <Tab icon={<QrCodeScannerIcon />} iconPosition="start" label="Check-in" sx={{ justifyContent: 'flex-start', textTransform: 'none', fontWeight: 'bold' }} />
                        </Tabs>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 9 }}>
                    <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, minHeight: 400, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }} elevation={0}>
                        {activeTab === 0 && (
                            <Box component="form" onSubmit={handleEventSubmit} sx={{ height: '100%', justifyContent: 'stretch', display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>Informazioni Generali</Typography>
                                <Grid container spacing={4} sx={{ flexGrow: 1 }}>
                                    <Grid size={{ xs: 12, md: 7 }}>
                                        <Stack spacing={3}>
                                            <TextField required fullWidth label="Titolo Evento" value={title} onChange={(e) => setTitle(e.target.value)} />
                                            <TextField required fullWidth label="Descrizione" multiline rows={6} value={description} onChange={(e) => setDescription(e.target.value)} />
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 5 }}>
                                        <Stack spacing={3}>
                                            <AddressAutocomplete
                                                value={location}
                                                onChange={setLocation}
                                                label="Luogo"
                                                placeholder="Cerca un luogo o indirizzo..."
                                            />
                                            <TextField required fullWidth label="Data e Ora" type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                                        </Stack>
                                    </Grid>
                                </Grid>
                                <Box sx={{ mt: 4 }}>
                                    <Button type="submit" variant="contained" disabled={saving} sx={{ px: 4, textTransform: 'none', borderRadius: 2 }}>
                                        {saving ? "Salvataggio..." : "Salva Modifiche"}
                                    </Button>
                                </Box>
                            </Box>
                        )}

                        {activeTab === 1 && (
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h5" fontWeight="bold">Gestione Biglietti</Typography>
                                    <Button variant="contained" color="warning" startIcon={<AddIcon />} onClick={() => handleOpenCategoryDialog()} sx={{ textTransform: 'none', borderRadius: 2 }}>
                                        Nuova Categoria
                                    </Button>
                                </Box>
                                <Grid container spacing={2}>
                                    {categories.map((cat: any) => (
                                        <Grid size={{ xs: 12, sm: 6 }} key={cat.id}>
                                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <Box>
                                                            <Typography variant="h6">{cat.name}</Typography>
                                                            <Typography variant="h5" color="primary" fontWeight="bold">{parseFloat(cat.price).toFixed(2)}€</Typography>
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

                        {activeTab === 2 && (
                            <Box>
                                <Typography variant="h5" gutterBottom fontWeight="bold">Validazione Ingressi</Typography>
                                <Grid container spacing={4} sx={{ mt: 1 }}>
                                    <Grid size={{ xs: 12, md: 5 }}>
                                        <Button fullWidth variant="contained" color="secondary" startIcon={<QrCodeScannerIcon />} onClick={startScanner}
                                            sx={{ py: 2, mb: 3, textTransform: 'none', fontSize: '1.1rem', borderRadius: 2 }}>
                                            Avvia Scanner QR
                                        </Button>
                                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                                            <Typography variant="body2" color="text.secondary">Utilizza la fotocamera per scansionare i biglietti dei partecipanti all'ingresso.</Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 7 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Partecipanti ({attendees.length})</Typography>
                                        <List sx={{ maxHeight: 500, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                            {attendees.map((t: any) => (
                                                <ListItem key={t.id} divider secondaryAction={
                                                    !t.is_checked_in ? (
                                                        <Button size="small" variant="outlined" onClick={() => validateTicket(t.id, false)} sx={{ textTransform: 'none', borderRadius: 2 }}>Valida</Button>
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
                </Grid>
            </Grid>

            {/* Category Dialog */}
            <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>{editingCategory ? "Modifica Categoria" : "Nuova Categoria"}</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Nome" margin="normal" value={catName} onChange={(e) => setCatName(e.target.value)} />
                    <TextField fullWidth label="Prezzo (€)" type="number" margin="normal" value={catPrice} onChange={(e) => setCatPrice(e.target.value)} />
                    <TextField fullWidth label="Quantità Totale" type="number" margin="normal" value={catQty} onChange={(e) => setCatQty(e.target.value)} />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setCategoryDialogOpen(false)} sx={{ textTransform: 'none' }}>Annulla</Button>
                    <Button onClick={handleCategorySubmit} variant="contained" color="warning" sx={{ textTransform: 'none' }}>
                        {editingCategory ? "Aggiorna" : "Crea"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Scanner Dialog */}
            <Dialog open={scannerOpen} onClose={stopScanner} fullWidth maxWidth="xs">
                <DialogTitle>Scansiona Biglietto</DialogTitle>
                <DialogContent><Box id="reader" sx={{ width: '100%' }}></Box></DialogContent>
                <DialogActions><Button onClick={stopScanner} sx={{ textTransform: 'none' }}>Chiudi</Button></DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity as any} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
}

export default EventEdit;
