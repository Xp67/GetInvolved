import { useState, useEffect } from "react";
import api from "../api";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Avatar,
  Divider,
  Alert
} from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function Profile() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = () => {
    api
      .get("/api/user/profile/")
      .then((res) => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    api
      .patch("/api/user/profile/", profile)
      .then((res) => {
        setMessage({ type: "success", text: "Profilo aggiornato con successo!" });
      })
      .catch((error) => {
        setMessage({ type: "error", text: "Errore durante l'aggiornamento." });
      });
  };

  if (loading) return <Typography>Caricamento...</Typography>;

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Avatar sx={{ m: '0 auto 20px', bgcolor: 'primary.main', width: 80, height: 80 }}>
          <AccountCircleIcon sx={{ fontSize: 60 }} />
        </Avatar>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Il Tuo Profilo
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Gestisci le tue informazioni personali
        </Typography>

        <Divider sx={{ mb: 4 }} />

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <Box component="form" onSubmit={handleUpdate} noValidate>
          <TextField
            margin="normal"
            fullWidth
            label="Username"
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Email"
            disabled
            value={profile.email}
            helperText="L'email non può essere modificata."
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 4, mb: 2 }}
          >
            Salva Modifiche
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Profile;
