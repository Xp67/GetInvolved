import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Paper, Stack, Tooltip, IconButton, Button,
    TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Avatar, Pagination, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import LinkIcon from '@mui/icons-material/Link';
import SyncIcon from '@mui/icons-material/Sync';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import InputAdornment from '@mui/material/InputAdornment';
import { AppTextField } from '../../components/form';
import api from '../../api';

interface AffiliationsProps {
    profile: any;
    setProfile: React.Dispatch<React.SetStateAction<any>>;
    setMessage: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error'; text: string; }>>;
    setOpenSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Affiliations({ profile, setProfile, setMessage, setOpenSnackbar }: AffiliationsProps) {
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

    useEffect(() => {
        getAffiliates();
    }, [page, searchQuery]);

    const getAffiliates = () => {
        setAffiliatesLoading(true);
        api.get(`/api/user/affiliates/?page=${page}&search=${searchQuery}`).then((res: any) => {
            if (res.data.results) {
                setAffiliates(res.data.results);
                setTotalPages(Math.ceil(res.data.count / 20));
            } else {
                setAffiliates(res.data);
                setTotalPages(1);
            }
        }).catch(console.error).finally(() => setAffiliatesLoading(false));
    };

    const handleUpdateAffiliation = () => {
        setAffiliateError('');
        api.patch('/api/user/profile/', { affiliated_to_code: newAffiliateCode.toUpperCase() }).then(res => {
            setProfile({ ...profile, affiliated_to_username: res.data.affiliated_to_username, affiliation_date: res.data.affiliation_date });
            setOpenAffiliateDialog(false);
            setMessage({ type: 'success', text: 'Affiliazione aggiornata!' });
            setOpenSnackbar(true);
        }).catch(err => {
            const msg = err.response?.data?.affiliated_to_code || 'Codice non valido.';
            setAffiliateError(Array.isArray(msg) ? msg[0] : msg);
        });
    };

    const handleUpdateOwnCode = () => {
        api.patch('/api/user/profile/', { affiliate_code: editedAffiliateCode.toUpperCase() }).then(res => {
            setProfile({ ...profile, affiliate_code: res.data.affiliate_code });
            setOpenEditCodeDialog(false);
            setMessage({ type: 'success', text: 'Codice aggiornato!' });
            setOpenSnackbar(true);
        }).catch(err => {
            const msg = err.response?.data?.affiliate_code || 'Errore aggiornamento.';
            setAffiliateError(Array.isArray(msg) ? msg[0] : msg);
        });
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 5 }}>Affiliazioni</Typography>
            <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper', height: '100%' }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Il tuo Codice</Typography>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Typography variant="h3" fontWeight="900" color="primary.main" sx={{ letterSpacing: 2 }}>{profile.affiliate_code}</Typography>
                            <Tooltip title="Copia Codice">
                                <IconButton onClick={() => { navigator.clipboard.writeText(profile.affiliate_code); setMessage({ type: 'success', text: 'Codice Copiato!' }); setOpenSnackbar(true); }}>
                                    <ContentCopyIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Personalizza">
                                <IconButton onClick={() => { setEditedAffiliateCode(profile.affiliate_code); setAffiliateError(''); setOpenEditCodeDialog(true); }}>
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
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
                                <Tooltip title="Cambia">
                                    <IconButton onClick={() => { setNewAffiliateCode(''); setAffiliateError(''); setOpenAffiliateDialog(true); }} color="warning">
                                        <SyncIcon fontSize="large" />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        ) : (
                            <Button variant="contained" color="warning" size="large" onClick={() => { setNewAffiliateCode(''); setAffiliateError(''); setOpenAffiliateDialog(true); }}
                                sx={{ px: 4, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}>Inserisci Codice PR</Button>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Ricerca e Tabella Affiliati */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" fontWeight="bold">I tuoi Affiliati</Typography>
                <AppTextField placeholder="Cerca..." size="small" value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)}
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

            {/* Dialogs */}
            <Dialog open={openAffiliateDialog} onClose={() => setOpenAffiliateDialog(false)} fullWidth maxWidth="xs">
                <DialogTitle fontWeight="bold">Inserisci Codice PR</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Inserisci il codice affiliato dell'utente a cui affiliarti.</Typography>
                    <AppTextField autoFocus fullWidth label="Codice" value={newAffiliateCode}
                        onChange={(e: any) => { setNewAffiliateCode(e.target.value.toUpperCase()); setAffiliateError(''); }}
                        error={!!affiliateError} helperText={affiliateError}
                        inputProps={{ style: { textTransform: 'uppercase', letterSpacing: 1 } }} />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenAffiliateDialog(false)} sx={{ textTransform: 'none' }}>Annulla</Button>
                    <Button onClick={handleUpdateAffiliation} variant="contained" color="warning" disabled={!newAffiliateCode} sx={{ textTransform: 'none', fontWeight: 'bold' }}>Conferma</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openEditCodeDialog} onClose={() => setOpenEditCodeDialog(false)} fullWidth maxWidth="xs">
                <DialogTitle fontWeight="bold">Personalizza Codice</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Solo lettere e numeri, max 15 caratteri.</Typography>
                    <AppTextField autoFocus fullWidth label="Nuovo Codice" value={editedAffiliateCode}
                        onChange={(e: any) => { const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); if (v.length <= 15) { setEditedAffiliateCode(v); setAffiliateError(''); } }}
                        error={!!affiliateError} helperText={affiliateError}
                        inputProps={{ style: { textTransform: 'uppercase', letterSpacing: 1 } }} />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenEditCodeDialog(false)} sx={{ textTransform: 'none' }}>Annulla</Button>
                    <Button onClick={handleUpdateOwnCode} variant="contained" color="warning" disabled={!editedAffiliateCode || editedAffiliateCode === profile.affiliate_code} sx={{ textTransform: 'none', fontWeight: 'bold' }}>Salva</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
