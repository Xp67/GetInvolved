import { useState, useEffect } from "react";
import api from "../api";
import Event from "../components/Event";
import Sidebar from "../components/Sidebar";
import RolesManagement from "../components/RolesManagement";
import UsersManagement from "../components/UsersManagement";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Snackbar,
  Alert
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function Dashboard() {
  const [currentSection, setCurrentSection] = useState('eventi');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Event state
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [open, setOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (currentSection === 'eventi') {
      getEvents();
    }
  }, [currentSection]);

  const fetchUser = async () => {
    try {
      const res = await api.get("/api/user/profile/");
      setUser(res.data);
    } catch (error) {
      console.error("Error fetching user profile", error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (perm) => {
    return user?.all_permissions?.includes(perm);
  };

  const handleOpen = () => {
    setEditingEvent(null);
    setTitle("");
    setDescription("");
    setLocation("");
    setEventDate("");
    setOpen(true);
  };

  const formatDateTimeForInput = (utcString) => {
    if (!utcString) return "";
    const d = new Date(utcString);
    if (isNaN(d.getTime())) return "";
    const pad = (n) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleEditOpen = (event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description);
    setLocation(event.location);
    setEventDate(formatDateTimeForInput(event.event_date));
    setOpen(true);
  };

  const handleViewOpen = (event) => {
    setViewingEvent(event);
    setViewDialogOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingEvent(null);
    setTitle("");
    setDescription("");
    setLocation("");
    setEventDate("");
  };

  const handleViewClose = () => {
    setViewDialogOpen(false);
    setViewingEvent(null);
  };

  const getEvents = () => {
    api
      .get("/api/event/")
      .then((res) => res.data)
      .then((data) => {
        setEvents(data);
      })
      .catch((error) => alert(error));
  };

  const deleteEvent = (id) => {
    api
      .delete(`/api/event/delete/${id}/`)
      .then((res) => {
        if (res.status === 204) {
           getEvents();
        }
        else alert("Error deleting event");
      })
      .catch((error) => alert(error));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingEvent) {
      updateEvent();
    } else {
      createEvent();
    }
  };

  const createEvent = () => {
    const eventData = {
      title,
      description,
      location,
      event_date: eventDate ? new Date(eventDate).toISOString() : null,
    };
    api
      .post("/api/event/", eventData)
      .then((res) => {
        if (res.status === 201) {
            handleClose();
            getEvents();
        }
        else alert("Error creating event");
      })
      .catch((error) => alert(error));
  };

  const updateEvent = () => {
    const eventData = {
      title,
      description,
      location,
      event_date: eventDate ? new Date(eventDate).toISOString() : null,
    };
    api
      .patch(`/api/event/update/${editingEvent.id}/`, eventData)
      .then((res) => {
        if (res.status === 200) {
            handleClose();
            getEvents();
            setSnackbarOpen(true);
        }
        else alert("Error updating event");
      })
      .catch((error) => alert(error));
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'eventi':
        return (
          <>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" gutterBottom>
                    {hasPermission('events.view_all') ? 'Tutti gli Eventi' : 'I Tuoi Eventi'}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {events.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary" gutterBottom>Non ci sono eventi da visualizzare.</Typography>
                      {hasPermission('events.create') && (
                        <Button variant="outlined" sx={{ mt: 2, textTransform: 'none' }} onClick={handleOpen}>
                          Crea il tuo primo evento
                        </Button>
                      )}
                    </Box>
                  ) : (
                    <Grid container spacing={3}>
                      {events.map((event) => (
                        <Grid item xs={12} sm={6} lg={4} key={event.id}>
                          <Event
                            event={event}
                            onDelete={deleteEvent}
                            onEdit={handleEditOpen}
                            onView={handleViewOpen}
                            canDelete={hasPermission('events.delete_all') || (hasPermission('events.delete_own') && event.organizer === user?.id)}
                            canEdit={hasPermission('events.edit_all') || (hasPermission('events.edit_own') && event.organizer === user?.id)}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </>
        );
      case 'utenti':
        return <UsersManagement userPermissions={user?.all_permissions} />;
      case 'ruoli':
        return <RolesManagement userPermissions={user?.all_permissions} />;
      default:
        return <Typography variant="h4">Sezione non trovata</Typography>;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6">Caricamento Dashboard...</Typography>
      </Box>
    );
  }

  const getSectionTitle = () => {
    switch (currentSection) {
      case 'eventi': return "Dashboard Eventi";
      case 'utenti': return "Gestione Utenti";
      case 'ruoli': return "Gestione Ruoli e Permessi";
      default: return "";
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 2, md: 4 }, mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 4,
          gap: 2
        }}
      >
        <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
          {getSectionTitle()}
        </Typography>
        {currentSection === 'eventi' && hasPermission('events.create') && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            sx={{
              textTransform: 'none',
              px: 4,
              borderRadius: 2,
              boxShadow: 2
            }}
          >
            Crea Evento
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4} lg={3}>
          <Sidebar
            currentSection={currentSection}
            onSectionChange={setCurrentSection}
            userPermissions={user?.all_permissions}
          />
        </Grid>
        <Grid item xs={12} md={8} lg={9}>
          {renderSection()}
        </Grid>
      </Grid>

      {/* Dialog Creazione/Modifica Evento */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingEvent ? "Modifica Evento" : "Crea Nuovo Evento"}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Titolo Evento"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="description"
              label="Descrizione"
              name="description"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="location"
              label="Luogo"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="event_date"
              label="Data e Ora Evento"
              name="event_date"
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: editingEvent ? '#ffb74d' : 'primary.main',
                '&:hover': {
                  backgroundColor: editingEvent ? '#ffa726' : 'primary.dark',
                },
                textTransform: 'none'
              }}
            >
              {editingEvent ? "Salva Modifiche" : "Crea Evento"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Dialog Visualizzazione Evento */}
      <Dialog open={viewDialogOpen} onClose={handleViewClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Dettagli Evento
          <IconButton onClick={handleViewClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {viewingEvent && (
            <Box>
              <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
                {viewingEvent.title}
              </Typography>
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap', mt: 2 }}>
                {viewingEvent.description}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Luogo</Typography>
                  <Typography variant="body2" fontWeight="medium">{viewingEvent.location}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Data e Ora Evento</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {viewingEvent.event_date
                      ? new Date(viewingEvent.event_date).toLocaleString("it-IT", {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : "Non impostata"}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          Evento modificato con successo!
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Dashboard;
