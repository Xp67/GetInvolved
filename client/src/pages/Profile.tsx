import { useState, useEffect, useRef } from 'react';
import api from '../api';
import {
    Box, Container, Typography, TextField, Button, Grid, Paper, Avatar, Stack,
    IconButton, Tooltip, InputAdornment, Divider, Snackbar, Alert, Dialog, DialogTitle,
    DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Pagination, List, ListItemButton, ListItemIcon, ListItemText, Drawer,
    useTheme, useMediaQuery, CircularProgress, Chip, Card, CardContent,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';
import SyncIcon from '@mui/icons-material/Sync';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MenuIcon from '@mui/icons-material/Menu';
import LinkIcon from '@mui/icons-material/Link';
import TicketCard from '../components/TicketCard';

function Profile() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [profile, setProfile] = useState({
        username: '', email: '', first_name: '', last_name: '', phone_number: '', bio: '',
        avatar: null as string | null, affiliate_code: '', affiliated_to_username: null as string | null, affiliation_date: null as string | null,
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: 'success' as 'success' | 'error', text: '' });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [activeSection, setActiveSection] = useState('personal_info');
    const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Affiliates
    const [affiliates, setAffiliates] = useState<any[]>([]);
    const [affiliatesLoading, setAffiliatesLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [openAffiliateDialog, setOpenAffiliateDialog] = useState(false);
    const [newAffiliateCode, setNewAffiliateCode] = useState('');
    const [affiliateError, setAffiliateError] = useState('');
    const [openEditCodeDialog, setOpenEditCodeDialog] = useState(false);
    const [editedAffiliateCode, setEditedAffiliateCode] = useState('');

    // Tickets
    const [myTickets, setMyTickets] = useState<any[]>([]);
    const [ticketsLoading, setTicketsLoading] = useState(false);

    useEffect(() => { getProfile(); }, []);
    useEffect(() => { if (activeSection === 'affiliated_users') getAffiliates(); }, [activeSection, page, searchQuery]);
    useEffect(() => { if (activeSection === 'my_tickets') getMyTickets(); }, [activeSection]);

    const getProfile = () => {
        api.get('/api/user/profile/').then(res => {
            const d = res.data;
            setProfile({
                username: d.username || '', email: d.email || '', first_name: d.first_name || '',
                last_name: d.last_name || '', phone_number: d.phone_number || '', bio: d.bio || '',
                avatar: d.avatar || null, affiliate_code: d.affiliate_code || '',
                affiliated_to_username: d.affiliated_to_username || null, affiliation_date: d.affiliation_date || null,
            });
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    const getAffiliates = () => {
        setAffiliatesLoading(true);
        api.get(`/api/user/affiliates/?page=${page}&search=${searchQuery}`).then(res => {
            if (res.data.results) { setAffiliates(res.data.results); setTotalPages(Math.ceil(res.data.count / 20)); }
            else { setAffiliates(res.data); setTotalPages(1); }
        }).catch(console.error).finally(() => setAffiliatesLoading(false));
    };

    const getMyTickets = () => {
        setTicketsLoading(true);
        api.get('/api/tickets/my/').then(res => {
            setMyTickets(Array.isArray(res.data) ? res.data : []);
        }).catch(console.error).finally(() => setTicketsLoading(false));
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const { avatar, email, ...updateData } = profile;
        api.patch('/api/user/profile/', updateData).then(() => {
            setMessage({ type: 'success', text: 'Profilo aggiornato con successo!' }); setOpenSnackbar(true);
        }).catch(() => {
            setMessage({ type: 'error', text: "Errore durante l'aggiornamento." }); setOpenSnackbar(true);
        }).finally(() => setSaving(false));
    };

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { setMessage({ type: 'error', text: "Immagine troppo grande. Max 2MB." }); setOpenSnackbar(true); return; }
        const formData = new FormData();
        formData.append('avatar', file);
        api.patch('/api/user/profile/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => {
            setProfile({ ...profile, avatar: res.data.avatar });
            setMessage({ type: 'success', text: 'Immagine aggiornata!' }); setOpenSnackbar(true);
        }).catch(() => { setMessage({ type: 'error', text: "Errore caricamento immagine." }); setOpenSnackbar(true); });
    };

    const handleUpdateAffiliation = () => {
        setAffiliateError('');
        api.patch('/api/user/profile/', { affiliated_to_code: newAffiliateCode.toUpperCase() }).then(res => {
            setProfile({ ...profile, affiliated_to_username: res.data.affiliated_to_username, affiliation_date: res.data.affiliation_date });
            setOpenAffiliateDialog(false);
            setMessage({ type: 'success', text: 'Affiliazione aggiornata!' }); setOpenSnackbar(true);
        }).catch(err => {
            const msg = err.response?.data?.affiliated_to_code || 'Codice non valido.';
            setAffiliateError(Array.isArray(msg) ? msg[0] : msg);
        });
    };

    const handleUpdateOwnCode = () => {
        api.patch('/api/user/profile/', { affiliate_code: editedAffiliateCode.toUpperCase() }).then(res => {
            setProfile({ ...profile, affiliate_code: res.data.affiliate_code });
            setOpenEditCodeDialog(false);
            setMessage({ type: 'success', text: 'Codice aggiornato!' }); setOpenSnackbar(true);
        }).catch(err => {
            const msg = err.response?.data?.affiliate_code || 'Errore aggiornamento.';
            setAffiliateError(Array.isArray(msg) ? msg[0] : msg);
        });
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><CircularProgress /></Box>;

    const renderSidebar = () => (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 4, px: 2 }}>Il Mio Profilo</Typography>
            <List component="nav" sx={{ '& .MuiListItemButton-root': { borderRadius: 2, mb: 1 } }}>
                {[
                    { key: 'personal_info', label: 'Informazioni Personali', icon: <PersonIcon /> },
                    { key: 'affiliated_users', label: 'Affiliazioni', icon: <PeopleIcon /> },
                    { key: 'my_tickets', label: 'I Miei Biglietti', icon: <ConfirmationNumberIcon /> },
                ].map(item => (
                    <ListItemButton key={item.key} selected={activeSection === item.key}
                        onClick={() => { setActiveSection(item.key); setDrawerOpen(false); }}
                        sx={{ '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.main', '& .MuiListItemIcon-root': { color: 'primary.main' } } }}>
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: activeSection === item.key ? 'bold' : 'medium' }} />
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );

    const renderPersonalInfo = () => (
        <Box component="form" onSubmit={handleUpdate} noValidate>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 5 }}>Informazioni Personali</Typography>
            <Grid container spacing={5}>
                <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Tooltip title="Clicca per cambiare">
                        <Box onMouseEnter={() => setIsHoveringAvatar(true)} onMouseLeave={() => setIsHoveringAvatar(false)} onClick={handleAvatarClick}
                            sx={{ position: 'relative', cursor: 'pointer', width: 180, height: 180, borderRadius: '50%', border: '6px solid', borderColor: 'divider', boxShadow: 4, overflow: 'hidden', mb: 2, bgcolor: 'primary.light' }}>
                            <Avatar src={profile.avatar || undefined} sx={{ width: '100%', height: '100%', bgcolor: 'transparent', fontSize: 60 }}>
                                {!profile.avatar && (profile.first_name ? profile.first_name[0] : profile.username[0])}
                            </Avatar>
                            <Box sx={{
                                position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                opacity: isHoveringAvatar ? 1 : 0, transition: 'opacity 0.3s', color: 'white'
                            }}>
                                <EditIcon sx={{ fontSize: 40, mb: 0.5 }} /><Typography variant="caption" fontWeight="bold">CAMBIA</Typography>
                            </Box>
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                        </Box>
                    </Tooltip>
                    <Typography variant="body2" color="text.secondary">Max 2MB</Typography>
                </Grid>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Nome" value={profile.first_name} onChange={e => setProfile({ ...profile, first_name: e.target.value })}
                                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action" fontSize="small" /></InputAdornment> }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Cognome" value={profile.last_name} onChange={e => setProfile({ ...profile, last_name: e.target.value })}
                                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action" fontSize="small" /></InputAdornment> }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Username" value={profile.username} onChange={e => setProfile({ ...profile, username: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Email" disabled value={profile.email} helperText="Non modificabile"
                                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="disabled" fontSize="small" /></InputAdornment> }} />
                        </Grid>
                        <Grid size={12}>
                            <TextField fullWidth label="Telefono" value={profile.phone_number} onChange={e => setProfile({ ...profile, phone_number: e.target.value })}
                                InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon color="action" fontSize="small" /></InputAdornment> }} />
                        </Grid>
                        <Grid size={12}>
                            <TextField fullWidth multiline rows={4} label="Bio" value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} placeholder="Raccontaci di te..."
                                InputProps={{ startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}><InfoIcon color="action" fontSize="small" /></InputAdornment> }} />
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="submit" variant="contained" color="warning" size="large" disabled={saving} startIcon={saving ? null : <SaveIcon />}
                            sx={{ px: 6, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}>
                            {saving ? 'Salvataggio...' : 'Salva Modifiche'}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );

    const renderAffiliations = () => (
        <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 5 }}>Affiliazioni</Typography>
            <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper', height: '100%' }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Il tuo Codice</Typography>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Typography variant="h3" fontWeight="900" color="primary.main" sx={{ letterSpacing: 2 }}>{profile.affiliate_code}</Typography>
                            <Tooltip title="Copia Codice"><IconButton onClick={() => { navigator.clipboard.writeText(profile.affiliate_code); setMessage({ type: 'success', text: 'Codice Copiato!' }); setOpenSnackbar(true); }}><ContentCopyIcon /></IconButton></Tooltip>
                            <Tooltip title="Personalizza"><IconButton onClick={() => { setEditedAffiliateCode(profile.affiliate_code); setAffiliateError(''); setOpenEditCodeDialog(true); }}><EditIcon /></IconButton></Tooltip>
                        </Stack>
                        <Button
                            variant="outlined"
                            startIcon={<LinkIcon />}
                            sx={{ mt: 2, borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                            onClick={() => {
                                const link = `${window.location.origin}/register?ref=${profile.affiliate_code}`;
                                navigator.clipboard.writeText(link);
                                setMessage({ type: 'success', text: 'Link di Invito Copiato!' });
                                setOpenSnackbar(true);
                            }}
                        >
                            Copia Link Invito
                        </Button>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper', height: '100%' }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Affiliato a</Typography>
                        {profile.affiliated_to_username ? (
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Typography variant="h4" fontWeight="bold">{profile.affiliated_to_username}</Typography>
                                <Tooltip title="Cambia"><IconButton onClick={() => { setNewAffiliateCode(''); setAffiliateError(''); setOpenAffiliateDialog(true); }} color="warning"><SyncIcon fontSize="large" /></IconButton></Tooltip>
                            </Stack>
                        ) : (
                            <Button variant="contained" color="warning" size="large" onClick={() => { setNewAffiliateCode(''); setAffiliateError(''); setOpenAffiliateDialog(true); }}
                                sx={{ px: 4, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}>Inserisci Codice PR</Button>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" fontWeight="bold">I tuoi Affiliati</Typography>
                <TextField placeholder="Cerca..." size="small" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} sx={{ width: 280 }} />
            </Box>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Utente</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Data Affiliazione</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {affiliatesLoading ? (
                            <TableRow><TableCell colSpan={2} align="center" sx={{ py: 6 }}>Caricamento...</TableCell></TableRow>
                        ) : affiliates.length > 0 ? (
                            affiliates.map((a: any) => (
                                <TableRow key={a.id} hover>
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar src={a.avatar} sx={{ width: 36, height: 36, bgcolor: 'primary.light' }}>{a.username[0].toUpperCase()}</Avatar>
                                            <Typography fontWeight="600">{a.username}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="right" sx={{ color: 'text.secondary' }}>
                                        {a.affiliation_date ? new Date(a.affiliation_date).toLocaleDateString('it-IT') : '-'}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={2} align="center" sx={{ py: 8 }}>
                                <PeopleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1, opacity: 0.5 }} />
                                <Typography color="text.secondary">Nessun affiliato trovato.</Typography>
                            </TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            {totalPages > 1 && <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}><Pagination count={totalPages} page={page} onChange={(_e, v) => setPage(v)} color="primary" /></Box>}
        </Box>
    );

    const renderMyTickets = () => (
        <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 5 }}>I Miei Biglietti</Typography>
            {ticketsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
            ) : myTickets.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <ConfirmationNumberIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary">Non hai ancora acquistato biglietti.</Typography>
                    <Typography variant="body2" color="text.secondary">Esplora gli eventi e acquista il tuo primo biglietto!</Typography>
                </Box>
            ) : (
                <Grid container spacing={2}>
                    {myTickets.map((ticket: any) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }} key={ticket.id}>
                            <TicketCard ticket={ticket} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default', position: 'relative' }}>
            {isMobile && (
                <IconButton onClick={() => setDrawerOpen(true)}
                    sx={{ position: 'fixed', top: 76, left: 16, bgcolor: 'primary.main', color: 'primary.contrastText', boxShadow: 3, zIndex: 1000, '&:hover': { bgcolor: 'primary.dark' } }}>
                    <MenuIcon fontSize="small" />
                </IconButton>
            )}
            <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} sx={{ '& .MuiDrawer-paper': { width: 300 } }}>
                {renderSidebar()}
            </Drawer>
            <Box sx={{
                width: 300, minWidth: 300, flexShrink: 0, bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider',
                display: { xs: 'none', md: 'block' }, position: 'sticky', top: 0, height: 'calc(100vh - 64px)', overflowY: 'auto'
            }}>
                {renderSidebar()}
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 4, md: 6 }, pt: { xs: 10, sm: 4, md: 6 }, overflowY: 'auto' }}>
                <Box sx={{ maxWidth: 1100, width: '100%' }}>
                    {activeSection === 'personal_info' && renderPersonalInfo()}
                    {activeSection === 'affiliated_users' && renderAffiliations()}
                    {activeSection === 'my_tickets' && renderMyTickets()}
                </Box>
            </Box>

            {/* Affiliate Dialog */}
            <Dialog open={openAffiliateDialog} onClose={() => setOpenAffiliateDialog(false)} fullWidth maxWidth="xs">
                <DialogTitle fontWeight="bold">Inserisci Codice PR</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Inserisci il codice affiliato dell'utente a cui affiliarti.</Typography>
                    <TextField autoFocus fullWidth label="Codice" value={newAffiliateCode}
                        onChange={e => { setNewAffiliateCode(e.target.value.toUpperCase()); setAffiliateError(''); }}
                        error={!!affiliateError} helperText={affiliateError}
                        inputProps={{ style: { textTransform: 'uppercase', letterSpacing: 1 } }} />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenAffiliateDialog(false)} sx={{ textTransform: 'none' }}>Annulla</Button>
                    <Button onClick={handleUpdateAffiliation} variant="contained" color="warning" disabled={!newAffiliateCode} sx={{ textTransform: 'none', fontWeight: 'bold' }}>Conferma</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Code Dialog */}
            <Dialog open={openEditCodeDialog} onClose={() => setOpenEditCodeDialog(false)} fullWidth maxWidth="xs">
                <DialogTitle fontWeight="bold">Personalizza Codice</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Solo lettere e numeri, max 15 caratteri.</Typography>
                    <TextField autoFocus fullWidth label="Nuovo Codice" value={editedAffiliateCode}
                        onChange={e => { const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); if (v.length <= 15) { setEditedAffiliateCode(v); setAffiliateError(''); } }}
                        error={!!affiliateError} helperText={affiliateError}
                        inputProps={{ style: { textTransform: 'uppercase', letterSpacing: 1 } }} />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenEditCodeDialog(false)} sx={{ textTransform: 'none' }}>Annulla</Button>
                    <Button onClick={handleUpdateOwnCode} variant="contained" color="warning" disabled={!editedAffiliateCode || editedAffiliateCode === profile.affiliate_code} sx={{ textTransform: 'none', fontWeight: 'bold' }}>Salva</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={() => setOpenSnackbar(false)} severity={message.type} variant="filled" sx={{ width: '100%' }}>{message.text}</Alert>
            </Snackbar>
        </Box>
    );
}

export default Profile;
