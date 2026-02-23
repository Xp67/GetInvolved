import { useState, useEffect } from "react";
import api from "../api";
import Event from "../components/Event";
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
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getEvents();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
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

  const createEvent = (e) => {
    e.preventDefault();
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
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Dashboard Eventi
        </Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Crea Evento
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Lista Eventi */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              I Tuoi Eventi
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {events.length === 0 ? (
              <Typography color="text.secondary">Non hai ancora creato nessun evento.</Typography>
            ) : (
              <Grid container spacing={2}>
                {events.map((event) => (
                  <Grid item xs={12} key={event.id}>
                    <Event event={event} onDelete={deleteEvent} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
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
          <Box component="form" onSubmit={createEvent} noValidate>
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
              Crea Evento
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default Dashboard;
