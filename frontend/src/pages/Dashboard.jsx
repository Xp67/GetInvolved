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
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function Dashboard() {
  const [currentSection, setCurrentSection] = useState('eventi');
  const [user, setUser] = useState(null);

  // Event state
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [open, setOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

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
    }
  };

  const hasPermission = (perm) => {
    return user?.all_permissions?.includes(perm);
  };

  const handleOpen = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setTitle(event.title);
      setDescription(event.description);
      setLocation(event.location);
    } else {
      setEditingEvent(null);
      setTitle("");
      setDescription("");
      setLocation("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingEvent(null);
    setTitle("");
    setDescription("");
    setLocation("");
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

  const handleSubmitEvent = (e) => {
    e.preventDefault();
    const data = { title, description, location };
    if (editingEvent) {
      api
        .patch(`/api/event/${editingEvent.id}/`, data)
        .then((res) => {
          if (res.status === 200) {
              handleClose();
              getEvents();
          }
          else alert("Error updating event");
        })
        .catch((error) => alert(error));
    } else {
      api
        .post("/api/event/", { title, description, location })
        .then((res) => {
          if (res.status === 201) {
              handleClose();
              getEvents();
          }
          else alert("Error creating event");
        })
        .catch((error) => alert(error));
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'eventi':
        return (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" fontWeight="bold">
                Dashboard Eventi
              </Typography>
              {hasPermission('events.create') && (
                <Button variant="contained" color="primary" onClick={handleOpen}>
                  Crea Evento
                </Button>
              )}
            </Box>

            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" gutterBottom>
                    {hasPermission('events.view_all') ? 'Tutti gli Eventi' : 'I Tuoi Eventi'}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {events.length === 0 ? (
                    <Typography color="text.secondary">Non ci sono eventi da visualizzare.</Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {events.map((event) => (
                        <Grid item xs={12} key={event.id}>
                          <Event
                            event={event}
                            onDelete={deleteEvent}
                            onEdit={() => handleOpen(event)}
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

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3} lg={2}>
          <Sidebar
            currentSection={currentSection}
            onSectionChange={setCurrentSection}
            userPermissions={user?.all_permissions}
          />
        </Grid>
        <Grid item xs={12} md={9} lg={10}>
          {renderSection()}
        </Grid>
      </Grid>

      {/* Dialog Creazione/Modifica Evento */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingEvent ? 'Modifica Evento' : 'Crea Nuovo Evento'}
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
          <Box component="form" onSubmit={handleSubmitEvent} noValidate>
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {editingEvent ? 'Salva Modifiche' : 'Crea Evento'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default Dashboard;
