import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
  Grid,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Avatar,
  CardContent,
  Chip,
  Card,
  Autocomplete
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoIcon from '@mui/icons-material/Info';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { hasPermission } from "../utils/permissionUtils";

function EventEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState(null);

  // Event Data
  const [event, setEvent] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");

  // Location suggestions
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    let active = true;

    if (inputValue === '') {
      setOptions([]);
      return undefined;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputValue)}&addressdetails=1&limit=8`);
        const data = await response.json();
        if (active) {
          // Filter out duplicates if any and map to label/value
          const uniqueResults = data.map(item => item.display_name);
          setOptions([...new Set(uniqueResults)]);
        }
      } catch (error) {
        console.error("Error fetching suggestions", error);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 500);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [inputValue]);

  // Ticket Categories
  const [categories, setCategories] = useState([]);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catName, setCatName] = useState('');
  const [catPrice, setCatPrice] = useState('');
  const [catQty, setCatQty] = useState('');

  // Attendees/Check-in
  const [attendees, setAttendees] = useState([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const scannerRef = useRef(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchUser();
    fetchEvent();
    fetchAttendees();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await api.get("/api/user/profile/");
      setUser(res.data);
    } catch (error) {
      console.error("Error fetching user profile", error);
    }
  };

  const formatDateTimeForInput = (utcString) => {
    if (!utcString) return "";
    const d = new Date(utcString);
    if (isNaN(d.getTime())) return "";
    const pad = (n) => n.toString().padStart(2, "0");
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
      console.error("Error fetching event", error);
      setSnackbar({ open: true, message: "Errore nel caricamento dell'evento", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendees = async () => {
    try {
        const res = await api.get(`/api/tickets/event/${id}/`);
        setAttendees(res.data);
    } catch (err) {
        console.error("Error fetching attendees", err);
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const eventData = {
      title,
      description,
      location,
      event_date: eventDate ? new Date(eventDate).toISOString() : null,
    };

    try {
      await api.patch(`/api/event/update/${id}/`, eventData);
      setSnackbar({ open: true, message: "Evento aggiornato con successo!", severity: "success" });
      fetchEvent();
    } catch (error) {
      setSnackbar({ open: true, message: "Errore durante l'aggiornamento", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Category Management
  const handleOpenCategoryDialog = (cat = null) => {
    if (cat) {
        setEditingCategory(cat);
        setCatName(cat.name);
        setCatPrice(cat.price);
        setCatQty(cat.total_quantity);
    } else {
        setEditingCategory(null);
        setCatName('');
        setCatPrice('');
        setCatQty('');
    }
    setCategoryDialogOpen(true);
  };

  const handleCategorySubmit = async () => {
    try {
      if (editingCategory) {
        await api.patch(`/api/tickets/categories/${editingCategory.id}/`, {
          name: catName,
          price: catPrice,
          total_quantity: catQty
        });
        setSnackbar({ open: true, message: 'Categoria aggiornata!', severity: 'success' });
      } else {
        await api.post('/api/tickets/categories/', {
          event: id,
          name: catName,
          price: catPrice,
          total_quantity: catQty
        });
        setSnackbar({ open: true, message: 'Categoria creata!', severity: 'success' });
      }
      setCategoryDialogOpen(false);
      fetchEvent();
    } catch (err) {
      setSnackbar({ open: true, message: 'Errore nella gestione della categoria', severity: 'error' });
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm("Sei sicuro di voler eliminare questa categoria?")) return;
    try {
      await api.delete(`/api/tickets/categories/delete/${catId}/`);
      setSnackbar({ open: true, message: 'Categoria eliminata!', severity: 'success' });
      fetchEvent();
    } catch (err) {
        const msg = err.response?.data?.[0] || 'Errore durante l\'eliminazione';
        setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  // Check-in logic
  const validateTicket = async (codeOrId, isCode = true) => {
    try {
      const payload = isCode ? { ticket_code: codeOrId } : { ticket_id: codeOrId };
      const res = await api.post('/api/tickets/validate/', payload);
      setSnackbar({ open: true, message: res.data.message + ' per ' + res.data.owner_name, severity: 'success' });
      fetchAttendees();
      if (scannerOpen) stopScanner();
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
        }, (error) => { /* ignore */ });
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

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2, bgcolor: 'background.paper', boxShadow: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">Gestione Evento</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Tabs
              orientation="vertical"
              value={activeTab}
              onChange={(e, v) => setActiveTab(v)}
              sx={{ borderRight: 1, borderColor: 'divider', minHeight: 200 }}
            >
              <Tab icon={<InfoIcon />} iconPosition="start" label="Info Generali" sx={{ justifyContent: 'flex-start', textTransform: 'none', fontWeight: 'bold' }} />
              <Tab icon={<ConfirmationNumberIcon />} iconPosition="start" label="Ticketing" sx={{ justifyContent: 'flex-start', textTransform: 'none', fontWeight: 'bold' }} />
              <Tab icon={<QrCodeScannerIcon />} iconPosition="start" label="Check-in" sx={{ justifyContent: 'flex-start', textTransform: 'none', fontWeight: 'bold' }} />
            </Tabs>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2, minHeight: 400 }}>
            {activeTab === 0 && (
              <Box component="form" onSubmit={handleEventSubmit} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>Informazioni Generali</Typography>
                <Grid container spacing={4} sx={{ flexGrow: 1 }}>
                  {/* Left Column: Title and Description */}
                  <Grid item xs={12} md={7}>
                    <Stack spacing={3}>
                      <TextField required fullWidth label="Titolo Evento" value={title} onChange={(e) => setTitle(e.target.value)} />
                      <TextField required fullWidth label="Descrizione" multiline rows={6} value={description} onChange={(e) => setDescription(e.target.value)} />
                    </Stack>
                  </Grid>

                  {/* Right Column: Location and Date/Time */}
                  <Grid item xs={12} md={5}>
                    <Stack spacing={3} alignItems="flex-start">
                      <Autocomplete
                        sx={{
                          width: 'fit-content',
                          maxWidth: { md: '30ch', xs: '100%' },
                          flexGrow: 0
                        }}
                        fullWidth={false}
                        value={location}
                        onChange={(event, newValue) => {
                          setLocation(newValue || "");
                        }}
                        inputValue={inputValue}
                        onInputChange={(event, newInputValue) => {
                          setInputValue(newInputValue);
                        }}
                        options={options}
                        noOptionsText="Nessun luogo trovato"
                        loading={inputValue.length > 0 && options.length === 0}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Luogo (Seleziona dai suggerimenti)"
                            required
                            fullWidth
                            placeholder="Inizia a scrivere per vedere i suggerimenti..."
                          />
                        )}
                      />
                      <TextField
                        required
                        fullWidth
                        label="Data e Ora"
                        type="datetime-local"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Stack>
                  </Grid>
                </Grid>

                {/* Save Button: Bottom Left */}
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-start' }}>
                  <Button type="submit" variant="contained" disabled={saving} sx={{ px: 4, textTransform: 'none' }}>
                    {saving ? "Salvataggio..." : "Salva Modifiche"}
                  </Button>
                </Box>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" fontWeight="bold">Gestione Biglietti</Typography>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenCategoryDialog()} sx={{ textTransform: 'none', bgcolor: '#ffb74d', '&:hover': { bgcolor: '#ffa726' } }}>
                    Nuova Categoria
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  {categories.map((cat) => (
                    <Grid item xs={12} sm={6} key={cat.id}>
                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="h6">{cat.name}</Typography>
                              <Typography variant="h5" color="primary" fontWeight="bold">{parseFloat(cat.price).toFixed(2)}€</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Disponibilità: {cat.remaining_quantity} / {cat.total_quantity}
                              </Typography>
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
                  <Grid item xs={12} md={5}>
                    <Button fullWidth variant="contained" color="secondary" startIcon={<QrCodeScannerIcon />} onClick={startScanner} sx={{ py: 2, mb: 3, textTransform: 'none', fontSize: '1.1rem' }}>
                      Avvia Scanner QR
                    </Button>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                      <Typography variant="body2" color="text.secondary">Utilizza la fotocamera per scansionare i biglietti dei partecipanti all'ingresso.</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Partecipanti ({attendees.length})</Typography>
                    <List sx={{ maxHeight: 500, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      {attendees.map((t) => (
                        <ListItem key={t.id} divider secondaryAction={
                          !t.is_checked_in ? (
                            <Button size="small" variant="outlined" onClick={() => validateTicket(t.id, false)} sx={{ textTransform: 'none' }}>Valida</Button>
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
          <Button onClick={() => setCategoryDialogOpen(false)}>Annulla</Button>
          <Button onClick={handleCategorySubmit} variant="contained" sx={{ bgcolor: '#ffb74d', '&:hover': { bgcolor: '#ffa726' } }}>
            {editingCategory ? "Aggiorna" : "Crea"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Scanner Dialog */}
      <Dialog open={scannerOpen} onClose={stopScanner} fullWidth maxWidth="xs">
        <DialogTitle>Scansiona Biglietto</DialogTitle>
        <DialogContent>
          <Box id="reader" sx={{ width: '100%' }}></Box>
        </DialogContent>
        <DialogActions><Button onClick={stopScanner}>Chiudi</Button></DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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

export default EventEdit;
