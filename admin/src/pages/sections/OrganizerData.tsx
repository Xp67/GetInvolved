import { Box, Typography, Grid, Paper } from "@mui/material";
import { AppTextField } from "../../components/form/AppTextField";
import BusinessIcon from '@mui/icons-material/Business';

export default function OrganizerData({ profile, isMobile }: any) {
    const org = profile.organizer_profile;

    return (
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
                                        <AppTextField fullWidth label="Ragione Sociale" value={org.company_name || ''} InputProps={{ readOnly: true }} />
                                    </Grid>
                                    <Grid size={12}>
                                        <AppTextField fullWidth label="Partita IVA" value={org.vat_number || ''} InputProps={{ readOnly: true }} />
                                    </Grid>
                                    <Grid size={12}>
                                        <AppTextField fullWidth label="Sede Aziendale" value={org.company_address || ''} InputProps={{ readOnly: true }} multiline />
                                    </Grid>
                                </Grid>
                            ) : (
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <AppTextField fullWidth label="Nome" value={org.first_name_org || ''} InputProps={{ readOnly: true }} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <AppTextField fullWidth label="Cognome" value={org.last_name_org || ''} InputProps={{ readOnly: true }} />
                                    </Grid>
                                    <Grid size={12}>
                                        <AppTextField fullWidth label="Codice Fiscale" value={org.fiscal_code || ''} InputProps={{ readOnly: true }} />
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
}
