import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Divider,
  IconButton,
  Stack,
  Card,
  CardContent,
  Avatar,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Tab,
  Tabs
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import QrCodeIcon from '@mui/icons-material/QrCode';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { hasPermission } from "../utils/permissionUtils";

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet + Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';

// Helper component to update map center
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 15);
  return null;
}

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [coords, setCoords] = useState([41.9028, 12.4964]); // Rome default
  const [tabValue, setTabValue] = useState(0);

  // Ticketing state
  const [myTickets, setMyTickets] = useState([]);
  const [eventTickets, setEventTickets] = useState([]); // For organizer
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  // New Category Form
  const [catName, setCatName] = useState('');
  const [catPrice, setCatPrice] = useState('');
  const [catQty, setCatQty] = useState('');

  // Scanner state
  const [scannerOpen, setScannerOpen] = useState(false);
  const scannerRef = useRef(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchData();
    fetchUser();
  }, [id]);

  useEffect(() => {
    if (event && user) {
        fetchMyTickets();
        if (event.organizer === user.id || user.is_super_admin || hasPermission(user, 'tickets.manage')) {
            fetchEventTickets();
        }
    }
  }, [event, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/event/${id}/`);
      setEvent(res.data);

      // Geocode the location
      geocodeAddress(res.data.location);
    } catch (err) {
      console.error("Error fetching event", err);
      setError("Errore nel caricamento dell'evento.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await api.get("/api/user/profile/");
      setUser(res.data);
    } catch (error) {
      console.error("Error fetching user", error);
    }
  };

  const fetchMyTickets = async () => {
    try {
        const res = await api.get('/api/tickets/my/');
        if (Array.isArray(res.data)) {
            setMyTickets(res.data);
        } else {
            console.error("fetchMyTickets: Expected array, got", res.data);
            setMyTickets([]);
        }
    } catch (err) {
        console.error("Error fetching my tickets", err);
    }
  };

  const fetchEventTickets = async () => {
    try {
        const res = await api.get(`/api/tickets/event/${id}/`);
        setEventTickets(res.data);
    } catch (err) {
        console.error("Error fetching event tickets", err);
    }
  };

  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    } catch (err) {
      console.error("Geocoding error", err);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleBuyTicket = async () => {
    try {
      const res = await api.post('/api/tickets/purchase/', { category: selectedCategory.id });
      setSnackbar({ open: true, message: 'Biglietto acquistato con successo!', severity: 'success' });
      setBuyDialogOpen(false);
      fetchData(); // Refresh to update quantities and tickets
    } catch (err) {
      setSnackbar({ open: true, message: 'Errore nell\'acquisto: ' + (err.response?.data?.error || 'Riprova più tardi'), severity: 'error' });
    }
  };

  const handleAddCategory = async () => {
    try {
      await api.post('/api/tickets/categories/', {
        event: id,
        name: catName,
        price: catPrice,
        total_quantity: catQty
      });
      setSnackbar({ open: true, message: 'Categoria aggiunta con successo!', severity: 'success' });
      setCategoryDialogOpen(false);
      setCatName(''); setCatPrice(''); setCatQty('');
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Errore nella creazione categoria', severity: 'error' });
    }
  };

  const validateTicket = async (codeOrId, isCode = true) => {
    try {
      const payload = isCode ? { ticket_code: codeOrId } : { ticket_id: codeOrId };
      const res = await api.post('/api/tickets/validate/', payload);
      setSnackbar({ open: true, message: res.data.message + ' per ' + res.data.owner_name, severity: 'success' });
      fetchEventTickets();
      if (scannerOpen) setScannerOpen(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Errore nella validazione', severity: 'error' });
    }
  };

  const startScanner = () => {
    setScannerOpen(true);
    setTimeout(() => {
        const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
        scanner.render((decodedText) => {
            scanner.clear();
            validateTicket(decodedText, true);
        }, (error) => {
            // ignore
        });
        scannerRef.current = scanner;
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
        scannerRef.current.clear();
    }
    setScannerOpen(false);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (error || !event) return <Container sx={{ mt: 4 }}><Alert severity="error">{error || "Evento non trovato"}</Alert><Button onClick={handleBack} sx={{ mt: 2 }}>Torna indietro</Button></Container>;

  const isOrganizer = event.organizer === user?.id || user?.is_super_admin;
  const canManage = isOrganizer || hasPermission(user, 'tickets.manage');
  const canPurchase = hasPermission(user, 'tickets.purchase') || user?.is_super_admin || isOrganizer; // Let's allow organizer to buy too

  const myTicketsForThisEvent = Array.isArray(myTickets) ? myTickets.filter(t => t.event_id === parseInt(id)) : [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={handleBack} sx={{ mr: 2, bgcolor: 'background.paper', boxShadow: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>Dettagli Evento</Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Sinistra: Info Evento e Mappa */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h3" gutterBottom color="primary" fontWeight="bold" sx={{ fontSize: { xs: '2rem', sm: '3rem' } }}>
              {event.title}
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
              <Chip icon={<PersonIcon />} label={`Organizzato da: ${event.organizer_name}`} variant="outlined" />
              <Chip icon={<CalendarTodayIcon />} label={new Date(event.event_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })} variant="outlined" />
              <Chip icon={<AccessTimeIcon />} label={new Date(event.event_date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} variant="outlined" />
              <Chip icon={<LocationOnIcon />} label={event.location} color="primary" />
            </Stack>

            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap', mb: 4, fontSize: '1.1rem', color: 'text.secondary' }}>
              {event.description}
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon color="primary" /> Posizione sulla mappa
            </Typography>
            <Box sx={{ height: 400, width: '100%', borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
              <MapContainer center={coords} zoom={15} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={coords}>
                  <Popup>{event.title}<br />{event.location}</Popup>
                </Marker>
                <ChangeView center={coords} />
              </MapContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Destra: Ticketing */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="fullWidth">
                <Tab label="Biglietti" />
                {canManage && <Tab label="Gestione" />}
              </Tabs>
            </Box>

            <Box sx={{ p: 2 }}>
              {tabValue === 0 && (
                <Box>
                  {/* Biglietti disponibili per l'acquisto */}
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 1 }}>
                    Scegli il tuo biglietto
                  </Typography>
                  <List>
                    {event.ticket_categories.length === 0 && (
                        <Typography variant="body2" color="text.secondary">Nessun biglietto disponibile al momento.</Typography>
                    )}
                    {event.ticket_categories.map((cat) => (
                      <Card key={cat.id} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }} elevation={0}>
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
                                <Button
                                    variant="contained"
                                    size="small"
                                    disabled={cat.remaining_quantity <= 0}
                                    startIcon={<ShoppingCartIcon />}
                                    onClick={() => { setSelectedCategory(cat); setBuyDialogOpen(true); }}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Acquista
                                </Button>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </List>

                  {/* I miei biglietti */}
                  {myTicketsForThisEvent.length > 0 && (
                    <>
                      <Divider sx={{ my: 3 }} />
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        I Tuoi Biglietti
                      </Typography>
                      {myTicketsForThisEvent.map(ticket => (
                        <Paper key={ticket.id} sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" fontWeight="bold">{ticket.category_name}</Typography>
                                    <Typography variant="caption" display="block">Codice: {ticket.ticket_code.substring(0,8)}...</Typography>
                                    {ticket.is_checked_in && (
                                        <Chip size="small" label="Validato" color="success" sx={{ mt: 1, bgcolor: 'white', color: 'success.main' }} icon={<CheckCircleIcon />} />
                                    )}
                                </Box>
                                <IconButton
                                    onClick={() => { setSelectedCategory({ ticket }); }} // Temporary hack to show QR
                                    sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f5f5f5' } }}
                                >
                                    <QrCodeIcon color="primary" />
                                </IconButton>
                            </Box>
                        </Paper>
                      ))}
                    </>
                  )}
                </Box>
              )}

              {tabValue === 1 && canManage && (
                <Box>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setCategoryDialogOpen(true)}
                    sx={{
                        mb: 2,
                        textTransform: 'none',
                        color: '#ffb74d',
                        borderColor: '#ffb74d',
                        '&:hover': { borderColor: '#ffa726', bgcolor: 'rgba(255, 183, 77, 0.04)' }
                    }}
                  >
                    Aggiungi Categoria
                  </Button>

                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    startIcon={<QrCodeScannerIcon />}
                    onClick={startScanner}
                    sx={{ mb: 3, textTransform: 'none' }}
                  >
                    Scansiona QR Code
                  </Button>

                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Partecipanti ({eventTickets.length})
                  </Typography>
                  <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {eventTickets.length === 0 && <Typography variant="body2" color="text.secondary">Nessun biglietto venduto.</Typography>}
                    {eventTickets.map(ticket => (
                        <ListItem
                            key={ticket.id}
                            divider
                            secondaryAction={
                                !ticket.is_checked_in ? (
                                    <Tooltip title="Segna come Arrivato">
                                        <IconButton edge="end" color="primary" onClick={() => validateTicket(ticket.id, false)}>
                                            <CheckCircleIcon />
                                        </IconButton>
                                    </Tooltip>
                                ) : (
                                    <Typography variant="caption" color="success.main">Arrivato</Typography>
                                )
                            }
                        >
                            <ListItemText
                                primary={ticket.owner_name}
                                secondary={`${ticket.category_name} - ${ticket.owner_email}`}
                                primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                            />
                        </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog Acquisto */}
      <Dialog open={buyDialogOpen} onClose={() => setBuyDialogOpen(false)}>
        <DialogTitle>Conferma Acquisto</DialogTitle>
        <DialogContent>
          <Typography>
            Stai acquistando un biglietto <strong>{selectedCategory?.name}</strong> per l'evento <strong>{event.title}</strong>.
          </Typography>
          <Typography variant="h5" sx={{ mt: 2, textAlign: 'center' }} color="primary" fontWeight="bold">
            Prezzo: {selectedCategory?.price == 0 ? "GRATIS" : `${parseFloat(selectedCategory?.price).toFixed(2)}€`}
          </Typography>
          <Typography variant="caption" sx={{ mt: 2, display: 'block', fontStyle: 'italic' }}>
            * Simulazione pagamento: l'acquisto verrà registrato immediatamente senza addebito reale.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBuyDialogOpen(false)}>Annulla</Button>
          <Button onClick={handleBuyTicket} variant="contained" color="primary">Conferma e "Paga"</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Nuova Categoria */}
      <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)}>
        <DialogTitle>Nuova Categoria Biglietto</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nome Categoria (es. Standard, VIP)"
            margin="normal"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
          />
          <TextField
            fullWidth
            label="Prezzo (€)"
            type="number"
            margin="normal"
            value={catPrice}
            onChange={(e) => setCatPrice(e.target.value)}
          />
          <TextField
            fullWidth
            label="Quantità Totale"
            type="number"
            margin="normal"
            value={catQty}
            onChange={(e) => setCatQty(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialogOpen(false)} sx={{ textTransform: 'none' }}>Annulla</Button>
          <Button
            onClick={handleAddCategory}
            variant="contained"
            sx={{
                textTransform: 'none',
                bgcolor: '#ffb74d',
                '&:hover': { bgcolor: '#ffa726' }
            }}
          >
            Crea
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog QR Code Personal (Visualizzazione) */}
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

      {/* Dialog Scanner */}
      <Dialog open={scannerOpen} onClose={stopScanner} fullWidth maxWidth="xs">
        <DialogTitle>Scansiona Biglietto</DialogTitle>
        <DialogContent>
          <Box id="reader" sx={{ width: '100%' }}></Box>
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>Inquadra il QR Code del partecipante</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={stopScanner}>Chiudi</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default EventDetail;
