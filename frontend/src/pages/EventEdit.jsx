import React, { useState, useEffect } from "react";
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
  Grid
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function EventEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchEvent();
  }, [id]);

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
      const event = res.data;
      setTitle(event.title);
      setDescription(event.description);
      setLocation(event.location);
      setEventDate(formatDateTimeForInput(event.event_date));
    } catch (error) {
      console.error("Error fetching event", error);
      setSnackbar({ open: true, message: "Errore nel caricamento dell'evento", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const eventData = {
      title,
      description,
      location,
      event_date: eventDate ? new Date(eventDate).toISOString() : null,
    };

    try {
      const res = await api.patch(`/api/event/update/${id}/`, eventData);
      if (res.status === 200) {
        setSnackbar({ open: true, message: "Evento aggiornato con successo!", severity: "success" });
        setTimeout(() => {
          navigate(`/dashboard/eventi/${id}`);
        }, 1500);
      }
    } catch (error) {
      console.error("Error updating event", error);
      setSnackbar({ open: true, message: "Errore durante l'aggiornamento", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2, bgcolor: 'background.paper', boxShadow: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">Modifica Evento</Typography>
      </Box>

      <Paper sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="title"
                label="Titolo Evento"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="location"
                label="Luogo"
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
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
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                <Button
                  onClick={() => navigate(-1)}
                  variant="outlined"
                  sx={{ textTransform: 'none', px: 4 }}
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  sx={{
                    px: 4,
                    backgroundColor: '#ffb74d',
                    '&:hover': {
                      backgroundColor: '#ffa726',
                    },
                    textTransform: 'none'
                  }}
                >
                  {saving ? <CircularProgress size={24} color="inherit" /> : "Salva Modifiche"}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>

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

export default EventEdit;
