import React from "react";
import {
    Typography, Button, Box, Stack, Grid, MenuItem, Chip
} from "@mui/material";
import PublishIcon from '@mui/icons-material/Publish';
import ArchiveIcon from '@mui/icons-material/Archive';
import { AppTextField, AppDateField, AppSelectField } from '../../components/form/index';
import AddressAutocomplete, { LocationData } from "../../components/AddressAutocomplete";
import { eventEditStyles as styles } from '../EventEdit.styles';

interface GeneralInfoProps {
    event: any;
    user: any;
    title: string;
    setTitle: (val: string) => void;
    description: string;
    setDescription: (val: string) => void;
    location: string;
    setLocation: (val: string) => void;
    latitude: number | null;
    longitude: number | null;
    countryCode: string;
    handleLocationSelect: (data: LocationData) => void;
    eventDate: string;
    setEventDate: (val: string) => void;
    startTime: string;
    setStartTime: (val: string) => void;
    endTime: string;
    setEndTime: (val: string) => void;
    backgroundColor: string;
    setBackgroundColor: (val: string) => void;
    ticketClauses: string;
    setTicketClauses: (val: string) => void;
    posterImage: File | null;
    setPosterImage: (val: File | null) => void;
    heroImage: File | null;
    setHeroImage: (val: File | null) => void;
    organizerLogo: File | null;
    setOrganizerLogo: (val: File | null) => void;
    handleEventSubmit: (e: React.FormEvent) => void;
    saving: boolean;
    handlePublish: () => void;
    handleArchive: () => void;
    handleForceStatus: (newStatus: string) => void;
}

export default function GeneralInfo({
    event, user, title, setTitle, description, setDescription,
    location, setLocation, latitude, longitude, countryCode, handleLocationSelect,
    eventDate, setEventDate, startTime, setStartTime, endTime, setEndTime,
    backgroundColor, setBackgroundColor, ticketClauses, setTicketClauses,
    posterImage, setPosterImage, heroImage, setHeroImage, organizerLogo, setOrganizerLogo,
    handleEventSubmit, saving, handlePublish, handleArchive, handleForceStatus
}: GeneralInfoProps) {
    const isLocked = event?.status === 'CONCLUDED' || event?.status === 'ARCHIVED';

    return (
        <Box component="form" onSubmit={handleEventSubmit} sx={styles.formContainer}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" sx={styles.sectionTitle}>Informazioni Generali</Typography>
                {event && (
                    <Chip
                        label={{
                            DRAFT: 'Bozza', PUBLISHED: 'Pubblicato', TO_BE_REFUNDED: 'Da Rimborsare',
                            CONCLUDED: 'Concluso', ARCHIVED: 'Archiviato'
                        }[event.status as 'DRAFT' | 'PUBLISHED' | 'TO_BE_REFUNDED' | 'CONCLUDED' | 'ARCHIVED'] || event.status}
                        color={{
                            DRAFT: 'default' as const, PUBLISHED: 'success' as const, TO_BE_REFUNDED: 'warning' as const,
                            CONCLUDED: 'info' as const, ARCHIVED: 'secondary' as const
                        }[event.status as 'DRAFT' | 'PUBLISHED' | 'TO_BE_REFUNDED' | 'CONCLUDED' | 'ARCHIVED'] || 'default' as const}
                        sx={styles.statusChip}
                    />
                )}
            </Box>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Stack spacing={4}>
                        <AppTextField id="event-title-input" required fullWidth label="Titolo Evento" value={title} onChange={(e: any) => setTitle(e.target.value)} disabled={isLocked} />
                        <AppTextField id="event-description-input" required fullWidth label="Descrizione" multiline minRows={1} maxRows={10} value={description} onChange={(e: any) => setDescription(e.target.value)} disabled={isLocked} />
                    </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                    <Stack spacing={4}>
                        <AddressAutocomplete
                            value={location}
                            onChange={setLocation}
                            onLocationSelect={handleLocationSelect}
                            label="Luogo"
                            placeholder="Cerca un luogo o indirizzo..."
                            disabled={isLocked}
                        />
                        <AppDateField id="event-date-input" required fullWidth label="Data Evento" type="date" value={eventDate} onChange={(e: any) => setEventDate(e.target.value)} disabled={isLocked} />
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <AppDateField id="event-start-time-input" fullWidth label="Ora Inizio" type="time" value={startTime} onChange={(e: any) => setStartTime(e.target.value)} disabled={isLocked} />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <AppDateField id="event-end-time-input" fullWidth label="Ora Fine" type="time" value={endTime} onChange={(e: any) => setEndTime(e.target.value)} disabled={isLocked} />
                            </Grid>
                        </Grid>
                    </Stack>
                </Grid>
            </Grid>

            {/* Images & Styling Section */}
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Immagini e Stile</Typography>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Stack spacing={1}>
                        <Typography variant="body2" fontWeight="bold">Manifesto (Poster)</Typography>
                        {event?.poster_image && <img src={event.poster_image} alt="poster" style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8 }} />}
                        <Button variant="outlined" component="label" size="small" sx={{ textTransform: 'none' }} disabled={isLocked}>
                            {posterImage ? posterImage.name : 'Carica Poster'}
                            <input type="file" hidden accept="image/*" onChange={(e) => setPosterImage(e.target.files?.[0] || null)} />
                        </Button>
                    </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Stack spacing={1}>
                        <Typography variant="body2" fontWeight="bold">Hero Evento</Typography>
                        {event?.hero_image && <img src={event.hero_image} alt="hero" style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8 }} />}
                        <Button variant="outlined" component="label" size="small" sx={{ textTransform: 'none' }} disabled={isLocked}>
                            {heroImage ? heroImage.name : 'Carica Hero'}
                            <input type="file" hidden accept="image/*" onChange={(e) => setHeroImage(e.target.files?.[0] || null)} />
                        </Button>
                    </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Stack spacing={1}>
                        <Typography variant="body2" fontWeight="bold">Logo Organizzatore</Typography>
                        {event?.organizer_logo && <img src={event.organizer_logo} alt="logo" style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'contain', borderRadius: 8 }} />}
                        <Button variant="outlined" component="label" size="small" sx={{ textTransform: 'none' }} disabled={isLocked}>
                            {organizerLogo ? organizerLogo.name : 'Carica Logo'}
                            <input type="file" hidden accept="image/*" onChange={(e) => setOrganizerLogo(e.target.files?.[0] || null)} />
                        </Button>
                    </Stack>
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack spacing={1}>
                        <Typography variant="body2" fontWeight="bold">Colore di sfondo</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} disabled={isLocked} style={{ width: 48, height: 36, border: 'none', cursor: 'pointer', borderRadius: 4 }} />
                            <Typography variant="body2" color="text.secondary">{backgroundColor}</Typography>
                        </Box>
                    </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>Google Wallet Class ID</Typography>
                    <Typography variant="body2" color="text.secondary">{event?.google_wallet_class_id || 'Verrà generato al salvataggio'}</Typography>
                </Grid>
            </Grid>

            {/* Ticket Clauses */}
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Clausole Biglietto</Typography>
            <AppTextField id="ticket-clauses-input" fullWidth label="Clausole del Biglietto" multiline minRows={2} maxRows={6} value={ticketClauses} onChange={(e: any) => setTicketClauses(e.target.value)} disabled={isLocked} />

            <Box sx={styles.actionBar}>
                {!isLocked && (
                    <Button type="submit" variant="contained" disabled={saving} sx={styles.saveButton}>
                        {saving ? "Salvataggio..." : "Salva Modifiche"}
                    </Button>
                )}
                {event?.status === 'DRAFT' && (
                    <Button variant="contained" color="success" startIcon={<PublishIcon />} onClick={handlePublish} sx={styles.actionButton}>
                        Pubblica Evento
                    </Button>
                )}
                {event?.status === 'CONCLUDED' && (
                    <Button variant="contained" color="secondary" startIcon={<ArchiveIcon />} onClick={handleArchive} sx={styles.actionButton}>
                        Archivia Evento
                    </Button>
                )}
                {user?.all_permissions?.includes('events.override_status') && (
                    <AppSelectField
                        id="admin-status-select"
                        labelId="admin-status-label"
                        label="Cambio Stato Admin"
                        value={event?.status || ''}
                        onChange={(e: any) => handleForceStatus(e.target.value as string)}
                        sx={styles.forceStatusControl}
                    >
                        <MenuItem value="DRAFT">Bozza</MenuItem>
                        <MenuItem value="PUBLISHED">Pubblicato</MenuItem>
                        <MenuItem value="TO_BE_REFUNDED">Da Rimborsare</MenuItem>
                        <MenuItem value="CONCLUDED">Concluso</MenuItem>
                        <MenuItem value="ARCHIVED">Archiviato</MenuItem>
                    </AppSelectField>
                )}
            </Box>
        </Box>
    );
}
