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
  Divider
} from "@mui/material";

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    getEvents();
  }, []);

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
           // alert("Event deleted");
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
            // alert("Event created");
            setTitle("");
            setDescription("");
            setLocation("");
            getEvents();
        }
        else alert("Error creating event");
      })
      .catch((error) => alert(error));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard Eventi
      </Typography>

      <Grid container spacing={4}>
        {/* Lista Eventi */}
        <Grid item xs={12} md={8}>
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

        {/* Form Creazione */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Crea Nuovo Evento
            </Typography>
            <Divider sx={{ mb: 2 }} />
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
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;
