import { useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, Tooltip, Stack, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import CloseIcon from '@mui/icons-material/Close';
import api from '../api';

interface TicketCardProps {
    ticket: any;
    compact?: boolean; // If true, simpler UI for sidebars
}

function TicketCard({ ticket, compact = false }: TicketCardProps) {
    const [appleWalletOpen, setAppleWalletOpen] = useState(false);
    const [abuseOpen, setAbuseOpen] = useState(false);

    const handleDownloadPDF = async () => {
        try {
            const res = await api.get(`/api/tickets/${ticket.id}/download/pdf/`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Ticket_${ticket.ticket_code || ticket.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error("Errore download PDF", error);
            alert("Impossibile scaricare il PDF.");
        }
    };

    const handleGoogleWallet = async () => {
        try {
            const res = await api.get(`/api/tickets/${ticket.id}/download/google/`);
            if (res.data.url) {
                window.open(res.data.url, '_blank');
            }
        } catch (error) {
            console.error("Errore Google Wallet", error);
            alert("Impossibile generare il link per Google Wallet.");
        }
    };

    return (
        <Card variant="outlined" sx={{ borderRadius: compact ? 2 : 3, transition: 'all 0.2s', '&:hover': { boxShadow: 4 }, bgcolor: 'background.paper', borderColor: 'divider' }}>
            <CardContent sx={{ p: compact ? 2 : 3, '&:last-child': { pb: compact ? 2 : 3 } }}>
                {!compact && (
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                        {ticket.event_title || 'Evento'}
                    </Typography>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: compact ? 0 : 1 }}>
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                            {ticket.category_name || 'Biglietto'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {compact ? 'Acquistato il ' : ''}{ticket.purchase_date ? new Date(ticket.purchase_date).toLocaleDateString('it-IT') : 'Data sconosciuta'}
                        </Typography>
                    </Box>
                    <Chip size="small" label={ticket.is_checked_in ? "✓ Validato" : "Valido"} color={ticket.is_checked_in ? "default" : "success"} variant={compact ? "outlined" : "filled"} />
                </Box>

                {!compact && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                        Codice: <strong>{ticket.ticket_code?.substring(0, 12)}...</strong>
                    </Typography>
                )}

                <Divider sx={{ my: 1.5 }} />

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="Scarica PDF">
                        <IconButton size="small" color="primary" onClick={handleDownloadPDF} sx={{ bgcolor: 'primary.50' }}>
                            <PictureAsPdfIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Aggiungi a Google Wallet">
                        <IconButton size="small" onClick={handleGoogleWallet} sx={{ bgcolor: '#f1f3f4', color: '#1f1f1f' }}>
                            <GoogleIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Aggiungi a Apple Wallet">
                        <IconButton size="small" onClick={() => setAppleWalletOpen(true)} sx={{ bgcolor: '#f1f3f4', color: '#1f1f1f' }}>
                            <AppleIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </CardContent>

            {/* Apple Wallet Error Dialog */}
            <Dialog open={appleWalletOpen} onClose={() => setAppleWalletOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="div">
                        Errore di sistema
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={() => setAppleWalletOpen(false)}
                        sx={{ color: (theme) => theme.palette.grey[500] }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Typography gutterBottom variant="h6" align="center" color="error" sx={{ mt: 2, mb: 4 }}>
                        Comprati un telefono decente, sfigato.
                    </Typography>
                    <Box display="flex" justifyContent="center">
                        <Button variant="outlined" color="warning" onClick={() => {
                            setAppleWalletOpen(false);
                            setAbuseOpen(true);
                        }}>
                            Reclama un abuso
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Abuse Error Dialog */}
            <Dialog open={abuseOpen} onClose={() => setAbuseOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="div">
                        Reclamo Rifiutato
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={() => setAbuseOpen(false)}
                        sx={{ color: (theme) => theme.palette.grey[500] }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Typography gutterBottom variant="h6" align="center" sx={{ mt: 2, mb: 4 }}>
                        l'ho creato io il sistema e ti aspettavi che ti lasciassi lamentare? babbuino
                    </Typography>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

export default TicketCard;
