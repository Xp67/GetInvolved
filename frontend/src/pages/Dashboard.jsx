import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Event from "../components/Event";
import Sidebar from "../components/Sidebar";
import RolesManagement from "../components/RolesManagement";
import UsersManagement from "../components/UsersManagement";
import { hasPermission as checkPerm } from "../utils/permissionUtils";
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
  Alert,
  useTheme,
  useMediaQuery,
  Drawer
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";

function Dashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
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
    return checkPerm(user, perm);
  };

  const handleOpen = () => {
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
    navigate(`/dashboard/eventi/${event.id}/edit`);
  };

  const handleViewOpen = (event) => {
    navigate(`/dashboard/eventi/${event.id}`);
  };

  const handleClose = () => {
    setOpen(false);
    setTitle("");
    setDescription("");
    setLocation("");
    setEventDate("");
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
    createEvent();
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

  const handleSectionChange = (section) => {
    setCurrentSection(section);
    setDrawerOpen(false);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: isMobile ? 10 : 4, mb: 4 }}>
      {/* Burger Menu Button (Mobile) */}
      {isMobile && (
        <IconButton
          onClick={() => setDrawerOpen(true)}
          sx={{
            position: 'fixed',
            top: 76,
            left: 16,
            bgcolor: 'primary.main',
            color: 'white',
            boxShadow: 3,
            zIndex: 1000,
            '&:hover': { bgcolor: 'primary.dark' },
            width: 40,
            height: 40
          }}
        >
          <MenuIcon fontSize="small" />
        </IconButton>
      )}

      {/* Mobile Sidebar Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 280, boxSizing: 'border-box', pt: 2 }
        }}
      >
        <Sidebar
          currentSection={currentSection}
          onSectionChange={handleSectionChange}
          user={user}
        />
      </Drawer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
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
        {!isMobile && (
          <Grid item xs={12} md={4} lg={3}>
            <Sidebar
              currentSection={currentSection}
              onSectionChange={setCurrentSection}
              user={user}
            />
          </Grid>
        )}
        <Grid item xs={12} md={isMobile ? 12 : 8} lg={isMobile ? 12 : 9}>
          {renderSection()}
        </Grid>
      </Grid>

      {/* Dialog Creazione Evento */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Crea Nuovo Evento
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
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                textTransform: 'none'
              }}
            >
              Crea Evento
            </Button>
          </Box>
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
