import { useState, useEffect, useRef } from "react";
import api from "../api";
import AppSidebar from "../components/Sidebar";
import type { SidebarItem } from "../components/Sidebar";
import {
    Typography, TextField, Button, Box, Avatar, Alert, Grid,
    Snackbar, IconButton, Tooltip, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Pagination, Drawer,
    useTheme, useMediaQuery, CircularProgress,
} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
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
        username: "", email: "", first_name: "", last_name: "", phone_number: "", bio: "",
        avatar: null as string | null, affiliate_code: "", affiliated_to_username: null as string | null, affiliation_date: null as string | null,
        organizer_profile: null as any,
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: "success" as "success" | "error", text: "" });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [activeSection, setActiveSection] = useState("personal_info");
    const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [affiliates, setAffiliates] = useState<any[]>([]);
    const [affiliatesLoading, setAffiliatesLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [openAffiliateDialog, setOpenAffiliateDialog] = useState(false);
    const [newAffiliateCode, setNewAffiliateCode] = useState("");
    const [affiliateError, setAffiliateError] = useState("");
    const [openEditCodeDialog, setOpenEditCodeDialog] = useState(false);
    const [editedAffiliateCode, setEditedAffiliateCode] = useState("");

    useEffect(() => { getProfile(); }, []);
    useEffect(() => { if (activeSection === "affiliated_users") getAffiliates(); }, [activeSection, page, searchQuery]);

    const getProfile = () => {
        api.get("/api/user/profile/").then((res) => {
            const data = res.data;
            setProfile({
                username: data.username || "", email: data.email || "", first_name: data.first_name || "",
                last_name: data.last_name || "", phone_number: data.phone_number || "", bio: data.bio || "",
                avatar: data.avatar || null, affiliate_code: data.affiliate_code || "",
                affiliated_to_username: data.affiliated_to_username || null, affiliation_date: data.affiliation_date || null,
                organizer_profile: data.organizer_profile || null,
            });
            setLoading(false);
        }).catch((error) => { console.error(error); setLoading(false); });
    };

    const getAffiliates = () => {
        setAffiliatesLoading(true);
        api.get(`/api/user/affiliates/?page=${page}&search=${searchQuery}`).then((res) => {
            if (res.data.results) { setAffiliates(res.data.results); setTotalPages(Math.ceil(res.data.count / 20)); }
            else { setAffiliates(res.data); setTotalPages(1); }
        }).catch((error) => console.error(error)).finally(() => setAffiliatesLoading(false));
    };

    const handleUpdateAffiliation = () => {
        setAffiliateError("");
        api.patch("/api/user/profile/", { affiliated_to_code: newAffiliateCode.toUpperCase() }).then((res) => {
            setProfile({ ...profile, affiliated_to_username: res.data.affiliated_to_username, affiliation_date: res.data.affiliation_date });
            setOpenAffiliateDialog(false);
            setMessage({ type: "success", text: "Affiliazione aggiornata con successo!" }); setOpenSnackbar(true);
        }).catch((error) => {
            const errorMsg = error.response?.data?.affiliated_to_code || "Codice non valido.";
            setAffiliateError(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
        });
    };

    const handleUpdateOwnCode = () => {
        api.patch("/api/user/profile/", { affiliate_code: editedAffiliateCode.toUpperCase() }).then((res) => {
            setProfile({ ...profile, affiliate_code: res.data.affiliate_code });
            setOpenEditCodeDialog(false);
            setMessage({ type: "success", text: "Codice affiliato aggiornato!" }); setOpenSnackbar(true);
        }).catch((error) => {
            const errorMsg = error.response?.data?.affiliate_code || "Errore durante l'aggiornamento.";
            setAffiliateError(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const { avatar, email, ...updateData } = profile;
        api.patch("/api/user/profile/", updateData).then(() => {
            setMessage({ type: "success", text: "Profilo aggiornato con successo!" }); setOpenSnackbar(true);
        }).catch(() => {
            setMessage({ type: "error", text: "Errore durante l'aggiornamento." }); setOpenSnackbar(true);
        }).finally(() => setSaving(false));
    };

    const handleAvatarClick = () => { fileInputRef.current?.click(); };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            setMessage({ type: "error", text: "L'immagine è troppo grande. Massimo 2MB." }); setOpenSnackbar(true); return;
        }
        const formData = new FormData();
        formData.append("avatar", file);
        api.patch("/api/user/profile/", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((res) => {
            setProfile({ ...profile, avatar: res.data.avatar });
            setMessage({ type: "success", text: "Immagine del profilo aggiornata!" }); setOpenSnackbar(true);
        }).catch(() => {
            setMessage({ type: "error", text: "Errore durante il caricamento dell'immagine." }); setOpenSnackbar(true);
        });
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><CircularProgress /></Box>;

    const sidebarItems: SidebarItem[] = [
        { id: 'personal_info', label: 'Informazioni Personali', icon: <PersonIcon /> },
        { id: 'affiliated_users', label: 'Utenti Affiliati', icon: <PeopleIcon /> },
        { id: 'organizer_data', label: 'Dati Organizzatore', icon: <BusinessIcon /> },
    ];

    const handleSidebarChange = (section: string) => {
        setActiveSection(section);
        setDrawerOpen(false);
    };

    const org = profile.organizer_profile;

    const renderOrganizerData = () => (
        <Box sx={{ width: '100%' }}>
            <Typography variant={isMobile ? "h5" : "h4"} gutterBottom fontWeight="bold" sx={{ mb: isMobile ? 4 : 6 }}>Dati Organizzatore</Typography>
            {!org || !org.admin_onboarding_completed ? (
                <Paper elevation={0} sx={{ p: 6, border: '1px solid', borderColor: 'divider', borderRadius: 3, textAlign: 'center' }}>
                    <BusinessIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>Onboarding non completato</Typography>
                    <Typography variant="body2" color="text.disabled">Completa l'onboarding per visualizzare i tuoi dati organizzatore.</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
                                {org.is_company ? 'Dati Aziendali' : 'Dati Personali'}
                            </Typography>
                            {org.is_company ? (
                                <Grid container spacing={2}>
                                    <Grid size={12}>
                                        <TextField fullWidth label="Ragione Sociale" value={org.company_name || ''} InputProps={{ readOnly: true }} />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField fullWidth label="Partita IVA" value={org.vat_number || ''} InputProps={{ readOnly: true }} />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField fullWidth label="Sede Aziendale" value={org.company_address || ''} InputProps={{ readOnly: true }} multiline />
                                    </Grid>
                                </Grid>
                            ) : (
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField fullWidth label="Nome" value={org.first_name_org || ''} InputProps={{ readOnly: true }} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField fullWidth label="Cognome" value={org.last_name_org || ''} InputProps={{ readOnly: true }} />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField fullWidth label="Codice Fiscale" value={org.fiscal_code || ''} InputProps={{ readOnly: true }} />
                                    </Grid>
                                </Grid>
                            )}
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Dipendenti</Typography>
                            <Typography variant="h4" fontWeight="bold" color="primary.main">{org.employee_count || '—'}</Typography>
                            <Typography variant="body2" color="text.secondary">dipendenti</Typography>
                        </Paper>
                        <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Tipologia Eventi</Typography>
                            {org.event_types && org.event_types.length > 0 ? (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {org.event_types.map((type: string) => (
                                        <Paper key={type} variant="outlined" sx={{ px: 2, py: 1, borderRadius: 2, fontWeight: 500 }}>{type}</Paper>
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.disabled">Nessuna tipologia selezionata</Typography>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Box>
    );

    const renderPersonalInfo = () => (
        <Box component="form" onSubmit={handleUpdate} noValidate sx={{ width: '100%', textAlign: isMobile ? 'center' : 'left' }}>
            <Typography variant={isMobile ? "h5" : "h4"} gutterBottom fontWeight="bold" sx={{ mb: isMobile ? 4 : 6 }}>Informazioni Personali</Typography>
            <Grid container spacing={isMobile ? 4 : 6} justifyContent={isMobile ? "center" : "flex-start"}>
                <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Tooltip title="Clicca per cambiare immagine" placement="top">
                        <Box onMouseEnter={() => setIsHoveringAvatar(true)} onMouseLeave={() => setIsHoveringAvatar(false)} onClick={handleAvatarClick}
                            sx={{
                                position: 'relative', cursor: 'pointer', width: isMobile ? 160 : 220, height: isMobile ? 160 : 220, borderRadius: '50%',
                                border: '8px solid', borderColor: 'divider', boxShadow: 4, overflow: 'hidden', mb: 2, bgcolor: 'primary.light',
                            }}>
                            <Avatar src={profile.avatar || undefined} sx={{ width: '100%', height: '100%', bgcolor: 'transparent', fontSize: isMobile ? 60 : 80 }}>
                                {!profile.avatar && (profile.first_name ? profile.first_name[0] : profile.username[0])}
                            </Avatar>
                            <Box sx={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', bgcolor: 'rgba(0,0,0,0.4)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                opacity: isHoveringAvatar ? 1 : 0, transition: 'opacity 0.3s ease', zIndex: 2, color: 'white'
                            }}>
                                <EditIcon sx={{ fontSize: 48, mb: 0.5 }} /><Typography variant="caption" sx={{ fontWeight: 'bold' }}>CAMBIA</Typography>
                            </Box>
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                        </Box>
                    </Tooltip>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>JPG, PNG o GIF. Massimo 2MB.</Typography>
                </Grid>

                <Grid size={{ xs: 12, lg: 8 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Nome" value={profile.first_name} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action" fontSize="small" /></InputAdornment> }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Cognome" value={profile.last_name} onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action" fontSize="small" /></InputAdornment> }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Username" value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action" fontSize="small" /></InputAdornment> }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Email" disabled value={profile.email} helperText="L'email non può essere modificata."
                                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="disabled" fontSize="small" /></InputAdornment> }} />
                        </Grid>
                        <Grid size={12}>
                            <TextField fullWidth label="Numero di Telefono" value={profile.phone_number} onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                                InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon color="action" fontSize="small" /></InputAdornment> }} />
                        </Grid>
                        <Grid size={12}>
                            <TextField fullWidth multiline rows={4} label="Bio" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                placeholder="Raccontaci qualcosa di te..."
                                InputProps={{ startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}><InfoIcon color="action" fontSize="small" /></InputAdornment> }} />
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: isMobile ? 'center' : 'flex-end' }}>
                        <Button type="submit" variant="contained" color="warning" size="large" fullWidth={isMobile} disabled={saving} startIcon={saving ? null : <SaveIcon />}
                            sx={{ px: isMobile ? 4 : 6, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 'bold', fontSize: '1rem' }}>
                            {saving ? 'Salvataggio...' : 'Salva Modifiche'}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );

    const renderAffiliatedUsers = () => (
        <Box sx={{ width: '100%' }}>
            <Typography variant={isMobile ? "h5" : "h4"} gutterBottom fontWeight="bold" sx={{ mb: isMobile ? 4 : 6 }}>Utenti Affiliati</Typography>
            <Grid container spacing={isMobile ? 2 : 4} sx={{ mb: isMobile ? 4 : 8 }} alignItems="stretch">
                <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
                    <Paper elevation={0} sx={{ p: isMobile ? 3 : 4, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Il tuo Codice Affiliato</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 2, flexWrap: 'wrap' }}>
                            <Typography variant={isMobile ? "h4" : "h3"} fontWeight="900" sx={{ color: 'primary.main', letterSpacing: isMobile ? 1 : 2 }}>{profile.affiliate_code}</Typography>
                            <Tooltip title="Copia">
                                <IconButton onClick={() => { navigator.clipboard.writeText(profile.affiliate_code); setMessage({ type: "success", text: "Codice copiato!" }); setOpenSnackbar(true); }}>
                                    <ContentCopyIcon color="action" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Personalizza">
                                <IconButton onClick={() => { setEditedAffiliateCode(profile.affiliate_code); setAffiliateError(""); setOpenEditCodeDialog(true); }}>
                                    <EditIcon color="action" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
                    <Paper elevation={0} sx={{ p: isMobile ? 3 : 4, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: isMobile ? 1 : 2, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Affiliato a</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'space-between' }}>
                            {profile.affiliated_to_username ? (
                                <>
                                    <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">{profile.affiliated_to_username}</Typography>
                                    <Tooltip title="Cambia Affiliazione">
                                        <IconButton onClick={() => { setNewAffiliateCode(""); setAffiliateError(""); setOpenAffiliateDialog(true); }} color="warning">
                                            <SyncIcon fontSize="large" />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            ) : (
                                <Button variant="contained" color="warning" size="large" onClick={() => { setNewAffiliateCode(""); setAffiliateError(""); setOpenAffiliateDialog(true); }}
                                    sx={{ px: 4, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 'bold', fontSize: '1rem' }}>
                                    Codice PR
                                </Button>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Box sx={{ mb: 4, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 2 }}>
                <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">I tuoi Affiliati</Typography>
                <TextField placeholder="Cerca per username..." size="small" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment> }}
                    sx={{ width: { xs: '100%', sm: 300 } }} />
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Table sx={{ minWidth: isMobile ? 350 : 500 }}>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Utente</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', py: 2 }} align="right">Data Affiliazione</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {affiliatesLoading ? (
                            <TableRow><TableCell colSpan={2} align="center" sx={{ py: 8 }}>Caricamento...</TableCell></TableRow>
                        ) : affiliates.length > 0 ? (
                            affiliates.map((affiliate: any) => (
                                <TableRow key={affiliate.id} hover>
                                    <TableCell sx={{ py: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar src={affiliate.avatar} sx={{ width: 40, height: 40, bgcolor: 'primary.light' }}>{affiliate.username[0].toUpperCase()}</Avatar>
                                            <Typography variant="body1" fontWeight="600">{affiliate.username}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right" sx={{ py: 2, color: 'text.secondary' }}>
                                        {affiliate.affiliation_date ? new Date(affiliate.affiliation_date).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={2} align="center" sx={{ py: 10 }}>
                                    <PeopleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                                    <Typography variant="body1" color="text.secondary">Nessun affiliato trovato.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {totalPages > 1 && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Pagination count={totalPages} page={page} onChange={(_e, v) => setPage(v)} color="primary" />
                </Box>
            )}
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default', position: 'relative' }}>
            {isMobile && (
                <IconButton onClick={() => setDrawerOpen(true)}
                    sx={{ position: 'fixed', top: 76, left: 16, bgcolor: 'primary.main', color: 'primary.contrastText', boxShadow: 3, zIndex: 1000, '&:hover': { bgcolor: 'primary.dark' }, width: 40, height: 40 }}>
                    <MenuIcon fontSize="small" />
                </IconButton>
            )}

            <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}
                sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 300 } }}>
                <AppSidebar title="Impostazioni" items={sidebarItems} activeItem={activeSection} onItemChange={handleSidebarChange} />
            </Drawer>

            <Box sx={{
                width: 300, minWidth: 300, flexShrink: 0, bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider',
                display: { xs: 'none', md: 'block' }, position: 'sticky', top: 0, height: 'calc(100vh - 64px)', overflowY: 'auto', zIndex: 10
            }}>
                <AppSidebar title="Impostazioni" items={sidebarItems} activeItem={activeSection} onItemChange={setActiveSection} />
            </Box>

            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 8 }, pt: { xs: 10, sm: 3, md: 8 }, overflowY: 'auto' }}>
                <Box sx={{ maxWidth: '1200px', width: '100%' }}>
                    {activeSection === "personal_info" && renderPersonalInfo()}
                    {activeSection === "affiliated_users" && renderAffiliatedUsers()}
                    {activeSection === "organizer_data" && renderOrganizerData()}
                </Box>
            </Box>

            <Dialog open={openAffiliateDialog} onClose={() => setOpenAffiliateDialog(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 'bold' }}>Inserisci Codice PR</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Inserisci il codice affiliato dell'utente a cui desideri affiliarti.</Typography>
                    <TextField autoFocus fullWidth label="Codice Affiliato" value={newAffiliateCode}
                        onChange={(e) => { setNewAffiliateCode(e.target.value.toUpperCase()); setAffiliateError(""); }}
                        error={!!affiliateError} helperText={affiliateError}
                        inputProps={{ style: { textTransform: 'uppercase', letterSpacing: 1 } }} />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenAffiliateDialog(false)} sx={{ color: 'text.secondary', textTransform: 'none' }}>Annulla</Button>
                    <Button onClick={handleUpdateAffiliation} variant="contained" color="warning" disabled={!newAffiliateCode} sx={{ fontWeight: 'bold', textTransform: 'none' }}>Conferma</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openEditCodeDialog} onClose={() => setOpenEditCodeDialog(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 'bold' }}>Personalizza il tuo Codice</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Il codice deve essere univoco e può contenere solo lettere e numeri (max 15 caratteri).</Typography>
                    <TextField autoFocus fullWidth label="Nuovo Codice" value={editedAffiliateCode}
                        onChange={(e) => { const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); if (val.length <= 15) { setEditedAffiliateCode(val); setAffiliateError(""); } }}
                        error={!!affiliateError} helperText={affiliateError}
                        inputProps={{ style: { textTransform: 'uppercase', letterSpacing: 1 } }} />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenEditCodeDialog(false)} sx={{ color: 'text.secondary', textTransform: 'none' }}>Annulla</Button>
                    <Button onClick={handleUpdateOwnCode} variant="contained" color="warning" disabled={!editedAffiliateCode || editedAffiliateCode === profile.affiliate_code}
                        sx={{ fontWeight: 'bold', textTransform: 'none' }}>Salva</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={() => setOpenSnackbar(false)} severity={message.type} variant="filled" sx={{ width: '100%' }}>{message.text}</Alert>
            </Snackbar>
        </Box>
    );
}

export default Profile;
