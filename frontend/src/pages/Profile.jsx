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
  Alert,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar
} from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';

function Profile() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    bio: "",
    avatar_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "success", text: "" });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [activeSection, setActiveSection] = useState("personal_info");

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = () => {
    api
      .get("/api/user/profile/")
      .then((res) => {
        // Ensure null fields are treated as empty strings for controlled components
        const data = res.data;
        const sanitizedProfile = {
          username: data.username || "",
          email: data.email || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone_number: data.phone_number || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
        };
        setProfile(sanitizedProfile);
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
        setOpenSnackbar(true);
      })
      .catch((error) => {
        setMessage({ type: "error", text: "Errore durante l'aggiornamento." });
        setOpenSnackbar(true);
      });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (loading) return <Typography sx={{ p: 4 }}>Caricamento...</Typography>;

  const renderPersonalInfo = () => (
    <Box component="form" onSubmit={handleUpdate} noValidate>
      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
        Informazioni Personali
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} display="flex" justifyContent="center" sx={{ mb: 2 }}>
          <Avatar
            src={profile.avatar_url}
            sx={{ width: 100, height: 100, bgcolor: 'primary.main' }}
          >
            {!profile.avatar_url && <AccountCircleIcon sx={{ fontSize: 80 }} />}
          </Avatar>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nome"
            value={profile.first_name}
            onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Cognome"
            value={profile.last_name}
            onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Username"
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            disabled
            value={profile.email}
            helperText="L'email non può essere modificata."
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Numero di Telefono"
            value={profile.phone_number}
            onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="URL Foto Profilo"
            value={profile.avatar_url}
            onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
            placeholder="https://esempio.com/foto.jpg"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Bio"
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          />
        </Grid>
      </Grid>
      <Button
        type="submit"
        variant="contained"
        sx={{ mt: 4, px: 4, textTransform: 'none' }}
      >
        Salva Modifiche
      </Button>
    </Box>
  );

  const renderAffiliatedUsers = () => (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Utenti Affiliati
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        Questa sezione sarà disponibile a breve.
      </Typography>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ borderRadius: 2 }}>
            <List component="nav">
              <ListItem disablePadding>
                <ListItemButton
                  selected={activeSection === "personal_info"}
                  onClick={() => setActiveSection("personal_info")}
                >
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="Informazioni Personali" />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton
                  selected={activeSection === "affiliated_users"}
                  onClick={() => setActiveSection("affiliated_users")}
                >
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Utenti Affiliati" />
                </ListItemButton>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Content Area */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 4, borderRadius: 2, minHeight: '400px' }}>
            {activeSection === "personal_info" ? renderPersonalInfo() : renderAffiliatedUsers()}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={message.type} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Profile;
