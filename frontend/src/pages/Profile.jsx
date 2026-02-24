import { useState, useEffect, useRef } from "react";
import api from "../api";
import {
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Divider,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  IconButton,
  Tooltip,
  InputAdornment
} from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';

function Profile() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    bio: "",
    avatar: null,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "success", text: "" });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [activeSection, setActiveSection] = useState("personal_info");
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = () => {
    api
      .get("/api/user/profile/")
      .then((res) => {
        const data = res.data;
        setProfile({
          username: data.username || "",
          email: data.email || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone_number: data.phone_number || "",
          bio: data.bio || "",
          avatar: data.avatar || null,
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    setSaving(true);
    // Exclude avatar (file) and email (read-only) from the patch payload
    const { avatar, email, ...updateData } = profile;
    api
      .patch("/api/user/profile/", updateData)
      .then((res) => {
        setMessage({ type: "success", text: "Profilo aggiornato con successo!" });
        setOpenSnackbar(true);
      })
      .catch((error) => {
        setMessage({ type: "error", text: "Errore durante l'aggiornamento." });
        setOpenSnackbar(true);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Limit to 2MB
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "L'immagine è troppo grande. Massimo 2MB." });
      setOpenSnackbar(true);
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    api
      .patch("/api/user/profile/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        setProfile({ ...profile, avatar: res.data.avatar });
        setMessage({ type: "success", text: "Immagine del profilo aggiornata!" });
        setOpenSnackbar(true);
      })
      .catch((error) => {
        console.error(error);
        setMessage({ type: "error", text: "Errore durante il caricamento dell'immagine." });
        setOpenSnackbar(true);
      });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (loading) return <Typography sx={{ p: 4 }}>Caricamento...</Typography>;

  const renderPersonalInfo = () => (
    <Box component="form" onSubmit={handleUpdate} noValidate sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 6, color: 'text.primary' }}>
        Informazioni Personali
      </Typography>

      <Grid container spacing={6}>
        {/* Avatar Section */}
        <Grid item xs={12} lg={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Tooltip title="Clicca per cambiare immagine" placement="top">
            <Box
              onMouseEnter={() => setIsHoveringAvatar(true)}
              onMouseLeave={() => setIsHoveringAvatar(false)}
              onClick={handleAvatarClick}
              sx={{
                position: 'relative',
                cursor: 'pointer',
                width: 220,
                height: 220,
                mb: 2,
              }}
            >
              <Avatar
                src={profile.avatar}
                sx={{
                  width: '100%',
                  height: '100%',
                  border: '8px solid #fff',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                  bgcolor: 'primary.light',
                  fontSize: 80
                }}
              >
                {!profile.avatar && (profile.first_name ? profile.first_name[0] : profile.username[0])}
              </Avatar>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  bgcolor: 'rgba(0,0,0,0.4)',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isHoveringAvatar ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  zIndex: 2,
                  color: 'white'
                }}
              >
                <EditIcon sx={{ fontSize: 48, mb: 0.5 }} />
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>CAMBIA</Typography>
              </Box>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Box>
          </Tooltip>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            JPG, PNG o GIF. Massimo 2MB.
          </Typography>
        </Grid>

        {/* Fields Section */}
        <Grid item xs={12} lg={8}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome"
                variant="outlined"
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cognome"
                variant="outlined"
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                disabled
                variant="outlined"
                value={profile.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="disabled" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                helperText="L'email non può essere modificata."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Numero di Telefono"
                variant="outlined"
                value={profile.phone_number}
                onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Bio"
                variant="outlined"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <InfoIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                placeholder="Raccontaci qualcosa di te..."
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={saving}
              startIcon={saving ? null : <SaveIcon />}
              sx={{
                px: 6,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '1rem',
                bgcolor: '#ffb74d',
                '&:hover': {
                  bgcolor: '#ffa726',
                  boxShadow: '0 6px 20px rgba(255, 183, 77, 0.3)'
                },
                boxShadow: '0 4px 14px 0 rgba(255, 183, 77, 0.39)',
              }}
            >
              {saving ? 'Salvataggio...' : 'Salva Modifiche'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  const renderAffiliatedUsers = () => (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
        Utenti Affiliati
      </Typography>
      <Box sx={{ p: 10, border: '2px dashed', borderColor: 'divider', borderRadius: 4, textAlign: 'center' }}>
        <PeopleIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Questa sezione sarà disponibile a breve.
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Stiamo lavorando per darti la migliore esperienza possibile.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)', bgcolor: '#f9fafb' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 300,
          bgcolor: 'white',
          borderRight: '1px solid',
          borderColor: 'divider',
          display: { xs: 'none', md: 'block' },
          position: 'sticky',
          top: 0,
          height: 'calc(100vh - 64px)',
          overflowY: 'auto'
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 4, px: 2 }}>
            Impostazioni
          </Typography>
          <List component="nav" sx={{ '& .MuiListItemButton-root': { borderRadius: 2, mb: 1, px: 2 } }}>
            <ListItemButton
              selected={activeSection === "personal_info"}
              onClick={() => setActiveSection("personal_info")}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.lighter',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': { color: 'primary.main' }
                }
              }}
            >
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Informazioni Personali" primaryTypographyProps={{ fontWeight: activeSection === "personal_info" ? 'bold' : 'medium' }} />
            </ListItemButton>

            <ListItemButton
              selected={activeSection === "affiliated_users"}
              onClick={() => setActiveSection("affiliated_users")}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.lighter',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': { color: 'primary.main' }
                }
              }}
            >
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Utenti Affiliati" primaryTypographyProps={{ fontWeight: activeSection === "affiliated_users" ? 'bold' : 'medium' }} />
            </ListItemButton>
          </List>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 3, md: 8 },
          overflowY: 'auto',
          maxWidth: '1200px'
        }}
      >
        {activeSection === "personal_info" ? renderPersonalInfo() : renderAffiliatedUsers()}
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={message.type} variant="filled" sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Profile;
