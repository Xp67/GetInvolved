import { useState } from "react";
import {
    Typography, Button, Box, Grid, Paper, Divider, Tabs, Tab,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Stack, TextField
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Event from "../../components/Event";
import AddressAutocomplete, { LocationData } from "../../components/AddressAutocomplete";
import api from "../../api";

interface EventsProps {
    events: any[];
    user: any;
    hasPermission: (perm: string) => boolean;
    getEvents: () => void;
    eventFilter: string;
    setEventFilter: (filter: string) => void;
    navigate: (path: string) => void;
}

export default function EventsSection({
    events, user, hasPermission, getEvents, eventFilter, setEventFilter, navigate
}: EventsProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [countryCode, setCountryCode] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");


    const handleOpen = () => {
        setTitle("");
        setDescription("");
        setLocation("");
        setLatitude(null);
        setLongitude(null);
        setCountryCode("");
        setEventDate("");
        setStartTime("");
        setEndTime("");
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleLocationSelect = (data: LocationData) => {
        setLocation(data.address);
        setLatitude(data.latitude);
        setLongitude(data.longitude);
        setCountryCode(data.country_code);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const eventData: any = {
            title,
            description,
            location,
            date: eventDate || null,
            start_time: startTime || null,
            end_time: endTime || null,
        };
        if (latitude !== null) eventData.latitude = latitude;
        if (longitude !== null) eventData.longitude = longitude;
        if (countryCode) eventData.country_code = countryCode;

        api.post("/api/event/", eventData)
            .then((res) => {
                if (res.status === 201) {
                    handleClose();
                    getEvents();
                } else alert("Error creating event");
            })
            .catch((error) => alert(error));
    };

    const deleteEvent = (id: number) => {
        api.delete(`/api/event/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) getEvents();
                else alert("Error deleting event");
            })
            .catch((error) => {
                const msg = error.response?.data?.detail || 'Errore durante l\'eliminazione';
                alert(msg);
            });
    };

    const archiveEvent = (event: any) => {
        if (!window.confirm(`Sei sicuro di voler archiviare l'evento "${event.title}"?`)) return;
        api.patch(`/api/event/update/${event.id}/`, { status: 'ARCHIVED' })
            .then(() => getEvents())
            .catch((error) => alert(error.response?.data?.detail || 'Errore durante l\'archiviazione'));
    };

    const forceStatus = (eventId: number, newStatus: string) => {
        api.patch(`/api/event/${eventId}/force-status/`, { status: newStatus })
            .then(() => getEvents())
            .catch((error) => alert(error.response?.data?.error || 'Errore nel cambio stato'));
    };

    const filteredEvents = events.filter((e: any) => {
        if (eventFilter === 'active') return ['PUBLISHED', 'TO_BE_REFUNDED', 'CONCLUDED'].includes(e.status);
        if (eventFilter === 'drafts') return e.status === 'DRAFT';
        if (eventFilter === 'archived') return e.status === 'ARCHIVED';
        return true;
    });

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">Dashboard Eventi</Typography>
                {hasPermission('events.create') && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpen}
                        sx={{ textTransform: 'none', px: 4, borderRadius: 2, boxShadow: 2 }}
                    >
                        Crea Evento
                    </Button>
                )}
            </Box>

            <Grid container spacing={4}>
                <Grid size={12}>
                    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }} elevation={0}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                                {hasPermission('events.view_all') ? 'Tutti gli Eventi' : 'I Tuoi Eventi'}
                            </Typography>
                            <Tabs value={eventFilter} onChange={(_e, v) => setEventFilter(v)} sx={{ minHeight: 36 }}>
                                <Tab value="active" label="Attivi" sx={{ textTransform: 'none', minHeight: 36, py: 0 }} />
                                <Tab value="drafts" label="Bozze" sx={{ textTransform: 'none', minHeight: 36, py: 0 }} />
                                <Tab value="archived" label="Archiviati" sx={{ textTransform: 'none', minHeight: 36, py: 0 }} />
                            </Tabs>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        {filteredEvents.length === 0 ? (
                            <Box sx={{ py: 6, textAlign: 'center' }}>
                                <Typography color="text.secondary" gutterBottom>Non ci sono eventi in questa sezione.</Typography>
                                {hasPermission('events.create') && eventFilter === 'drafts' && (
                                    <Button variant="outlined" sx={{ mt: 2, textTransform: 'none', borderRadius: 2 }} onClick={handleOpen}>
                                        Crea il tuo primo evento
                                    </Button>
                                )}
                            </Box>
                        ) : (
                            <Grid container spacing={3}>
                                {filteredEvents.map((event: any) => (
                                    <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={event.id}>
                                        <Event
                                            event={event}
                                            onDelete={deleteEvent}
                                            onEdit={(e: any) => navigate(`/dashboard/eventi/${e.id}/edit?filter=${eventFilter}`)}
                                            onView={(e: any) => navigate(`/dashboard/eventi/${e.id}?filter=${eventFilter}`)}
                                            onArchive={archiveEvent}
                                            canDelete={hasPermission('events.delete_all') || (hasPermission('events.delete_own') && event.organizer === user?.id)}
                                            canEdit={hasPermission('events.edit_all') || (hasPermission('events.edit_own') && event.organizer === user?.id)}
                                        />
                                        {hasPermission('events.override_status') && (
                                            <Box sx={{ mt: -1, mb: 2, px: 1 }}>
                                                <select
                                                    value={event.status}
                                                    onChange={(e) => forceStatus(event.id, e.target.value)}
                                                    style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #ccc', fontSize: '0.8rem', cursor: 'pointer' }}
                                                >
                                                    <option value="DRAFT">🟡 Bozza</option>
                                                    <option value="PUBLISHED">🟢 Pubblicato</option>
                                                    <option value="TO_BE_REFUNDED">🟠 Da Rimborsare</option>
                                                    <option value="CONCLUDED">🔵 Concluso</option>
                                                    <option value="ARCHIVED">⚫ Archiviato</option>
                                                </select>
                                            </Box>
                                        )}
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Dialog Creazione Evento */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ m: 0, px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">Crea Nuovo Evento</Typography>
                    <IconButton aria-label="close" onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ px: 3, py: 3 }}>
                    <Box component="form" id="create-event-form" onSubmit={handleSubmit} noValidate>
                        <Stack spacing={2.5}>
                            <TextField required fullWidth id="title" label="Titolo Evento" name="title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
                            <TextField required fullWidth id="description" label="Descrizione" name="description" multiline rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
                            <AddressAutocomplete value={location} onChange={setLocation} onLocationSelect={handleLocationSelect} label="Luogo" placeholder="Cerca un luogo o indirizzo..." />
                            <TextField required fullWidth id="event_date" label="Data Evento" name="event_date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                            <Stack direction="row" spacing={2}>
                                <TextField fullWidth id="start_time" label="Ora Inizio" name="start_time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} InputLabelProps={{ shrink: true }} />
                                <TextField fullWidth id="end_time" label="Ora Fine" name="end_time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} InputLabelProps={{ shrink: true }} />
                            </Stack>
                        </Stack>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleClose} sx={{ textTransform: 'none', color: 'text.secondary' }}>Annulla</Button>
                    <Button type="submit" form="create-event-form" variant="contained" sx={{ textTransform: 'none', borderRadius: 2, px: 4, fontWeight: 'bold' }}>Crea Evento</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}
