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
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Drawer,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';
import SyncIcon from '@mui/icons-material/Sync';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MenuIcon from '@mui/icons-material/Menu';

function Profile() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    bio: "",
    avatar: null,
    affiliate_code: "",
    affiliated_to_username: null,
    affiliation_date: null,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "success", text: "" });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [activeSection, setActiveSection] = useState("personal_info");
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Affiliate section states
  const [affiliates, setAffiliates] = useState([]);
  const [affiliatesLoading, setAffiliatesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openAffiliateDialog, setOpenAffiliateDialog] = useState(false);
  const [newAffiliateCode, setNewAffiliateCode] = useState("");
  const [affiliateError, setAffiliateError] = useState("");
  const [openEditCodeDialog, setOpenEditCodeDialog] = useState(false);
  const [editedAffiliateCode, setEditedAffiliateCode] = useState("");

  useEffect(() => {
    getProfile();
  }, []);

  useEffect(() => {
    if (activeSection === "affiliated_users") {
      getAffiliates();
    }
  }, [activeSection, page, searchQuery]);

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
          affiliate_code: data.affiliate_code || "",
          affiliated_to_username: data.affiliated_to_username || null,
          affiliation_date: data.affiliation_date || null,
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  const getAffiliates = () => {
    setAffiliatesLoading(true);
    api
      .get(`/api/user/affiliates/?page=${page}&search=${searchQuery}`)
      .then((res) => {
        // DRF might return paginated results or a simple list
        if (res.data.results) {
          setAffiliates(res.data.results);
          setTotalPages(Math.ceil(res.data.count / 20));
        } else {
          setAffiliates(res.data);
          setTotalPages(1);
        }
      })
      .catch((error) => console.error(error))
      .finally(() => setAffiliatesLoading(false));
  };

  const handleUpdateAffiliation = () => {
    setAffiliateError("");
    api
      .patch("/api/user/profile/", { affiliated_to_code: newAffiliateCode.toUpperCase() })
      .then((res) => {
        setProfile({
          ...profile,
          affiliated_to_username: res.data.affiliated_to_username,
          affiliation_date: res.data.affiliation_date
        });
        setOpenAffiliateDialog(false);
        setMessage({ type: "success", text: "Affiliazione aggiornata con successo!" });
        setOpenSnackbar(true);
      })
      .catch((error) => {
        const errorMsg = error.response?.data?.affiliated_to_code || "Codice non valido.";
        setAffiliateError(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
      });
  };

  const handleUpdateOwnCode = () => {
    api
      .patch("/api/user/profile/", { affiliate_code: editedAffiliateCode.toUpperCase() })
      .then((res) => {
        setProfile({ ...profile, affiliate_code: res.data.affiliate_code });
        setOpenEditCodeDialog(false);
        setMessage({ type: "success", text: "Codice affiliato aggiornato!" });
        setOpenSnackbar(true);
      })
      .catch((error) => {
        const errorMsg = error.response?.data?.affiliate_code || "Errore durante l'aggiornamento.";
        setAffiliateError(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
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

  const renderSidebarContent = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 4, px: 2 }}>
        Impostazioni
      </Typography>
      <List component="nav" sx={{ '& .MuiListItemButton-root': { borderRadius: 2, mb: 1, px: 2 } }}>
        <ListItemButton
          selected={activeSection === "personal_info"}
          onClick={() => {
            setActiveSection("personal_info");
            setDrawerOpen(false);
          }}
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
          onClick={() => {
            setActiveSection("affiliated_users");
            setDrawerOpen(false);
          }}
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
  );

  const renderPersonalInfo = () => (
    <Box component="form" onSubmit={handleUpdate} noValidate sx={{ width: '100%', textAlign: isMobile ? 'center' : 'left' }}>
      <Typography variant={isMobile ? "h5" : "h4"} gutterBottom fontWeight="bold" sx={{ mb: isMobile ? 4 : 6, color: 'text.primary' }}>
        Informazioni Personali
      </Typography>

      <Grid container spacing={isMobile ? 4 : 6} justifyContent={isMobile ? "center" : "flex-start"}>
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
                width: isMobile ? 160 : 220,
                height: isMobile ? 160 : 220,
                borderRadius: '50%',
                border: isMobile ? '4px solid #fff' : '8px solid #fff',
                boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                overflow: 'hidden',
                mb: 2,
                bgcolor: 'primary.light',
              }}
            >
              <Avatar
                src={profile.avatar}
                sx={{
                  width: '100%',
                  height: '100%',
                  bgcolor: 'transparent',
                  fontSize: isMobile ? 60 : 80
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
          <Grid container spacing={3} justifyContent={isMobile ? "center" : "flex-start"}>
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

          <Box sx={{ mt: 4, display: 'flex', justifyContent: isMobile ? 'center' : 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth={isMobile}
              disabled={saving}
              startIcon={saving ? null : <SaveIcon />}
              sx={{
                px: isMobile ? 4 : 6,
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
    <Box sx={{ width: '100%' }}>
      <Typography variant={isMobile ? "h5" : "h4"} gutterBottom fontWeight="bold" sx={{ mb: isMobile ? 4 : 6 }}>
        Utenti Affiliati
      </Typography>

      <Grid container spacing={isMobile ? 2 : 4} sx={{ mb: isMobile ? 4 : 8 }} alignItems="stretch">
        {/* Top Left: My Affiliate Code */}
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Paper elevation={0} sx={{ p: isMobile ? 3 : 4, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'white', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: isMobile ? 'center' : 'left' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
              Il tuo Codice Affiliato
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', gap: isMobile ? 1 : 2, flexWrap: 'wrap' }}>
              <Typography variant={isMobile ? "h4" : "h3"} fontWeight="900" sx={{ color: 'primary.main', letterSpacing: isMobile ? 1 : 2 }}>
                {profile.affiliate_code}
              </Typography>
              <Tooltip title="Copia">
                <IconButton onClick={() => {
                  navigator.clipboard.writeText(profile.affiliate_code);
                  setMessage({ type: "success", text: "Codice copiato!" });
                  setOpenSnackbar(true);
                }}>
                  <ContentCopyIcon color="action" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Personalizza">
                <IconButton onClick={() => {
                  setEditedAffiliateCode(profile.affiliate_code);
                  setAffiliateError("");
                  setOpenEditCodeDialog(true);
                }}>
                  <EditIcon color="action" />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>

        {/* Top Right: Affiliated To */}
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Paper elevation={0} sx={{ p: isMobile ? 3 : 4, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'white', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: isMobile ? 'center' : 'left' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: isMobile ? 1 : 2, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
              Affiliato a
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'space-between' }}>
              {profile.affiliated_to_username ? (
                <>
                  <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
                    {profile.affiliated_to_username}
                  </Typography>
                  <Tooltip title="Cambia Affiliazione">
                    <IconButton
                      onClick={() => {
                        setNewAffiliateCode("");
                        setAffiliateError("");
                        setOpenAffiliateDialog(true);
                      }}
                      sx={{
                        bgcolor: 'rgba(255, 183, 77, 0.1)',
                        color: '#ffb74d',
                        '&:hover': { bgcolor: 'rgba(255, 183, 77, 0.2)' }
                      }}
                    >
                      <SyncIcon fontSize="large" />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => {
                    setNewAffiliateCode("");
                    setAffiliateError("");
                    setOpenAffiliateDialog(true);
                  }}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    bgcolor: '#ffb74d',
                    '&:hover': { bgcolor: '#ffa726' },
                    boxShadow: '0 4px 14px 0 rgba(255, 183, 77, 0.39)',
                  }}
                >
                  Codice PR
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Affiliates List */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 2 }}>
        <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">
          I tuoi Affiliati
        </Typography>
        <TextField
          placeholder="Cerca per username..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: '100%', sm: 300 }, bgcolor: 'white' }}
        />
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflowX: 'auto' }}>
        <Table sx={{ minWidth: isMobile ? 350 : 500 }}>
          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Utente</TableCell>
              <TableCell sx={{ fontWeight: 'bold', py: 2 }} align="right">Data Affiliazione</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {affiliatesLoading ? (
              <TableRow><TableCell colSpan={2} align="center" sx={{ py: 8 }}>Caricamento...</TableCell></TableRow>
            ) : affiliates.length > 0 ? (
              affiliates.map((affiliate) => (
                <TableRow key={affiliate.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={affiliate.avatar} sx={{ width: 40, height: 40, bgcolor: 'primary.light' }}>
                        {affiliate.username[0].toUpperCase()}
                      </Avatar>
                      <Typography variant="body1" fontWeight="600">
                        {affiliate.username}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 2, color: 'text.secondary' }}>
                    {affiliate.affiliation_date ? new Date(affiliate.affiliation_date).toLocaleString('it-IT', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 10 }}>
                  <PeopleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                  <Typography variant="body1" color="text.secondary">
                    Nessun affiliato trovato.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, v) => setPage(v)}
            color="primary"
            sx={{
              '& .Mui-selected': { bgcolor: '#ffb74d !important', color: 'white' }
            }}
          />
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)', bgcolor: '#f9fafb', position: 'relative' }}>
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

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 300, boxSizing: 'border-box' }
        }}
      >
        {renderSidebarContent()}
      </Drawer>

      {/* Desktop Sidebar */}
      <Box
        sx={{
          width: 300,
          minWidth: 300,
          flexShrink: 0,
          bgcolor: 'white',
          borderRight: '1px solid',
          borderColor: 'divider',
          display: { xs: 'none', md: 'block' },
          position: 'sticky',
          top: 0,
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
          zIndex: 10
        }}
      >
        {renderSidebarContent()}
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 8 },
          pt: { xs: 10, sm: 3, md: 8 },
          overflowY: 'auto',
        }}
      >
        <Box sx={{ maxWidth: '1200px', width: '100%' }}>
          {activeSection === "personal_info" ? renderPersonalInfo() : renderAffiliatedUsers()}
        </Box>
      </Box>

      {/* Dialog for setting/changing affiliation */}
      <Dialog open={openAffiliateDialog} onClose={() => setOpenAffiliateDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Inserisci Codice PR</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Inserisci il codice affiliato dell'utente a cui desideri affiliarti.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Codice Affiliato"
            value={newAffiliateCode}
            onChange={(e) => {
              setNewAffiliateCode(e.target.value.toUpperCase());
              setAffiliateError("");
            }}
            error={!!affiliateError}
            helperText={affiliateError}
            inputProps={{ style: { textTransform: 'uppercase', letterSpacing: 1 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenAffiliateDialog(false)} sx={{ color: 'text.secondary' }}>Annulla</Button>
          <Button
            onClick={handleUpdateAffiliation}
            variant="contained"
            disabled={!newAffiliateCode}
            sx={{ bgcolor: '#ffb74d', '&:hover': { bgcolor: '#ffa726' }, fontWeight: 'bold' }}
          >
            Conferma
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for editing own affiliate code */}
      <Dialog open={openEditCodeDialog} onClose={() => setOpenEditCodeDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Personalizza il tuo Codice</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Il codice deve essere univoco e può contenere solo lettere e numeri (max 15 caratteri).
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Nuovo Codice"
            value={editedAffiliateCode}
            onChange={(e) => {
              const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
              if (val.length <= 15) {
                setEditedAffiliateCode(val);
                setAffiliateError("");
              }
            }}
            error={!!affiliateError}
            helperText={affiliateError}
            inputProps={{ style: { textTransform: 'uppercase', letterSpacing: 1 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenEditCodeDialog(false)} sx={{ color: 'text.secondary' }}>Annulla</Button>
          <Button
            onClick={handleUpdateOwnCode}
            variant="contained"
            disabled={!editedAffiliateCode || editedAffiliateCode === profile.affiliate_code}
            sx={{ bgcolor: '#ffb74d', '&:hover': { bgcolor: '#ffa726' }, fontWeight: 'bold' }}
          >
            Salva
          </Button>
        </DialogActions>
      </Dialog>

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
