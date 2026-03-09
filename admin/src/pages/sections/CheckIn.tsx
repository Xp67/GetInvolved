import React from "react";
import {
    Typography, Button, Box, Grid, Paper, List, ListItem, ListItemText, Chip, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { eventEditStyles as styles } from '../EventEdit.styles';

interface CheckInProps {
    attendees: any[];
    scannerOpen: boolean;
    startScanner: () => void;
    stopScanner: () => void;
    validateTicket: (codeOrId: string | number, isCode?: boolean) => void;
}

export default function CheckIn({
    attendees, scannerOpen, startScanner, stopScanner, validateTicket
}: CheckInProps) {
    return (
        <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">Validazione Ingressi</Typography>
            <Grid container spacing={4} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, md: 5 }}>
                    <Button fullWidth variant="contained" color="secondary" startIcon={<QrCodeScannerIcon />} onClick={startScanner}
                        sx={styles.scannerButton}>
                        Avvia Scanner QR
                    </Button>
                    <Paper variant="outlined" sx={styles.scannerPaper}>
                        <Typography variant="body2" color="text.secondary">Utilizza la fotocamera per scansionare i biglietti dei partecipanti all'ingresso.</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Partecipanti ({attendees.length})</Typography>
                    <List sx={styles.attendeesList}>
                        {attendees.map((t: any) => (
                            <ListItem key={t.id} divider secondaryAction={
                                !t.is_checked_in ? (
                                    <Button size="small" variant="outlined" onClick={() => validateTicket(t.id, false)} sx={styles.validateButton}>Valida</Button>
                                ) : (
                                    <Chip size="small" label="Validato" color="success" icon={<CheckCircleIcon />} />
                                )
                            }>
                                <ListItemText primary={t.owner_name} secondary={`${t.category_name} - ${t.owner_email}`} />
                            </ListItem>
                        ))}
                        {attendees.length === 0 && <ListItem><ListItemText secondary="Nessun partecipante al momento" /></ListItem>}
                    </List>
                </Grid>
            </Grid>

            {/* Scanner Dialog */}
            <Dialog open={scannerOpen} onClose={stopScanner} fullWidth maxWidth="xs">
                <DialogTitle>Scansiona Biglietto</DialogTitle>
                <DialogContent><Box id="reader" sx={{ width: '100%' }}></Box></DialogContent>
                <DialogActions><Button onClick={stopScanner} sx={styles.cancelButton}>Chiudi</Button></DialogActions>
            </Dialog>
        </Box>
    );
}
