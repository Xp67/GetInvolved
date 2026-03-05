import { useState } from "react";
import {
    Box, Typography, Grid, Paper, Tooltip, IconButton, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Pagination,
    Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { AppTextField } from "../../components/form/AppTextField";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import SyncIcon from '@mui/icons-material/Sync';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import InputAdornment from '@mui/material/InputAdornment';
import api from "../../api";

export default function Affiliations({
    profile, setProfile, setMessage, setOpenSnackbar, affiliates, affiliatesLoading,
    searchQuery, setSearchQuery, page, setPage, totalPages, isMobile
}: any) {
    const [openAffiliateDialog, setOpenAffiliateDialog] = useState(false);
    const [newAffiliateCode, setNewAffiliateCode] = useState("");
    const [affiliateError, setAffiliateError] = useState("");
    const [openEditCodeDialog, setOpenEditCodeDialog] = useState(false);
    const [editedAffiliateCode, setEditedAffiliateCode] = useState("");

    const handleUpdateAffiliation = () => {
        setAffiliateError("");
        api.patch("/api/user/profile/", { affiliated_to_code: newAffiliateCode.toUpperCase() }).then((res: any) => {
            setProfile({ ...profile, affiliated_to_username: res.data.affiliated_to_username, affiliation_date: res.data.affiliation_date });
            setOpenAffiliateDialog(false);
            setMessage({ type: "success", text: "Affiliazione aggiornata con successo!" }); setOpenSnackbar(true);
        }).catch((error: any) => {
            const errorMsg = error.response?.data?.affiliated_to_code || "Codice non valido.";
            setAffiliateError(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
        });
    };

    const handleUpdateOwnCode = () => {
        api.patch("/api/user/profile/", { affiliate_code: editedAffiliateCode.toUpperCase() }).then((res: any) => {
            setProfile({ ...profile, affiliate_code: res.data.affiliate_code });
            setOpenEditCodeDialog(false);
            setMessage({ type: "success", text: "Codice affiliato aggiornato!" }); setOpenSnackbar(true);
        }).catch((error: any) => {
            const errorMsg = error.response?.data?.affiliate_code || "Errore durante l'aggiornamento.";
            setAffiliateError(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
        });
    };

    return (
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
                <AppTextField placeholder="Cerca per username..." size="small" value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)}
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

            {/* Dialogs */}
            <Dialog open={openAffiliateDialog} onClose={() => setOpenAffiliateDialog(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 'bold' }}>Inserisci Codice PR</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Inserisci il codice affiliato dell'utente a cui desideri affiliarti.</Typography>
                    <AppTextField autoFocus fullWidth label="Codice Affiliato" value={newAffiliateCode}
                        onChange={(e: any) => { setNewAffiliateCode(e.target.value.toUpperCase()); setAffiliateError(""); }}
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
                    <AppTextField autoFocus fullWidth label="Nuovo Codice" value={editedAffiliateCode}
                        onChange={(e: any) => { const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); if (val.length <= 15) { setEditedAffiliateCode(val); setAffiliateError(""); } }}
                        error={!!affiliateError} helperText={affiliateError}
                        inputProps={{ style: { textTransform: 'uppercase', letterSpacing: 1 } }} />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenEditCodeDialog(false)} sx={{ color: 'text.secondary', textTransform: 'none' }}>Annulla</Button>
                    <Button onClick={handleUpdateOwnCode} variant="contained" color="warning" disabled={!editedAffiliateCode || editedAffiliateCode === profile.affiliate_code}
                        sx={{ fontWeight: 'bold', textTransform: 'none' }}>Salva</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}
