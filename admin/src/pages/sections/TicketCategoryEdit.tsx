import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Grid, Card, CardContent, Divider,
    Stack, IconButton, Alert, Snackbar, MenuItem
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { AppTextField, AppDateField, AppSelectField } from '../../components/form/index';
import api from '../../api';
import { eventEditStyles as styles } from '../EventEdit.styles';

interface TicketCategoryEditProps {
    event: any;
    category?: any; // null if creating a new one
    onBack: () => void;
    onSaveSuccess: () => void;
}

export default function TicketCategoryEdit({ event, category, onBack, onSaveSuccess }: TicketCategoryEditProps) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [totalQty, setTotalQty] = useState('');
    const [description, setDescription] = useState('');

    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');

    const [bgType, setBgType] = useState('solid');
    const [bgColor, setBgColor] = useState('#FFFFFF');
    const [bgColor2, setBgColor2] = useState('#FFFFFF');

    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>('');

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (category) {
            setName(category.name || '');
            setPrice(category.price || '');
            setTotalQty(category.total_quantity || '');
            setDescription(category.description || '');
            setStartDate(category.sale_start_date || '');
            setStartTime(category.sale_start_time ? category.sale_start_time.substring(0, 5) : '');
            setEndDate(category.sale_end_date || '');
            setEndTime(category.sale_end_time ? category.sale_end_time.substring(0, 5) : '');
            setBgType(category.card_bg_type || 'solid');
            setBgColor(category.card_bg_color || '#FFFFFF');
            setBgColor2(category.card_bg_color2 || '#FFFFFF');
            if (category.logo) setLogoPreview(category.logo);
        }
    }, [category]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogo(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        setErrorMsg('');
        if (!name || price === '' || totalQty === '') {
            setErrorMsg('Nome, Prezzo e Quantità sono obbligatori.');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('event', event.id.toString());
            formData.append('name', name);
            formData.append('price', price);
            formData.append('total_quantity', totalQty);
            formData.append('description', description);

            if (startDate) formData.append('sale_start_date', startDate);
            // Default time to 00:00 if date is provided but no time
            if (startDate && !startTime) formData.append('sale_start_time', '00:00');
            else if (startTime) formData.append('sale_start_time', startTime);

            if (endDate) formData.append('sale_end_date', endDate);
            if (endDate && !endTime) formData.append('sale_end_time', '00:00');
            else if (endTime) formData.append('sale_end_time', endTime);

            formData.append('card_bg_type', bgType);
            formData.append('card_bg_color', bgColor);
            formData.append('card_bg_color2', bgColor2);

            if (logo) formData.append('logo', logo);

            if (category) {
                await api.patch(`/api/tickets/categories/${category.id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await api.post('/api/tickets/categories/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            onSaveSuccess();
        } catch (err: any) {
            setErrorMsg(err.response?.data?.detail || "Errore durante il salvataggio.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Box sx={{ ...styles.ticketsHeader, mb: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <IconButton onClick={onBack} size="small" sx={styles.backButton}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" fontWeight="bold">
                        {category ? "Modifica Biglietto" : "Nuovo Biglietto"}
                    </Typography>
                </Stack>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={styles.submitButton}
                >
                    Salva
                </Button>
            </Box>

            {errorMsg && (
                <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>
            )}

            <Grid container spacing={4}>
                {/* Left Column - Main Info */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Card variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>Dettagli Principali</Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12 }}>
                                    <AppTextField
                                        label="Nome Biglietto"
                                        value={name}
                                        onChange={(e: any) => setName(e.target.value)}
                                        required
                                        fullWidth
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <AppTextField
                                        label="Prezzo (€)"
                                        type="number"
                                        value={price}
                                        onChange={(e: any) => setPrice(e.target.value)}
                                        required
                                        fullWidth
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <AppTextField
                                        label="Quantità Totale"
                                        type="number"
                                        value={totalQty}
                                        onChange={(e: any) => setTotalQty(e.target.value)}
                                        required
                                        fullWidth
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <AppTextField
                                        label="Descrizione (opzionale)"
                                        multiline
                                        rows={3}
                                        value={description}
                                        onChange={(e: any) => setDescription(e.target.value)}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>Date di Vendita</Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Imposta un periodo in cui il biglietto può essere acquistato. Se lasciato vuoto, sarà sempre disponibile (finché l'evento è attivo).
                            </Typography>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <AppDateField
                                        label="Data Inizio"
                                        value={startDate}
                                        onChange={(e: any) => setStartDate(e.target.value)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <AppTextField
                                        label="Ora Inizio"
                                        type="time"
                                        InputLabelProps={{ shrink: true }}
                                        value={startTime}
                                        onChange={(e: any) => setStartTime(e.target.value)}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <AppDateField
                                        label="Data Fine"
                                        value={endDate}
                                        onChange={(e: any) => setEndDate(e.target.value)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <AppTextField
                                        label="Ora Fine"
                                        type="time"
                                        InputLabelProps={{ shrink: true }}
                                        value={endTime}
                                        onChange={(e: any) => setEndTime(e.target.value)}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Column - Aesthetics */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>Estetica della Card</Typography>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" gutterBottom>Logo sul Biglietto</Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Button variant="outlined" component="label" size="small">
                                        Carica Logo
                                        <input type="file" hidden accept="image/*" onChange={handleLogoChange} />
                                    </Button>
                                    {(logoPreview) && (
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <img src={logoPreview} alt="Logo" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 4, border: '1px solid #ddd' }} />
                                            <IconButton size="small" color="error" onClick={() => { setLogo(null); setLogoPreview(''); }}><DeleteIcon /></IconButton>
                                        </Box>
                                    )}
                                </Stack>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <AppSelectField
                                label="Sfondo della Card"
                                value={bgType}
                                onChange={(e: any) => setBgType(e.target.value as string)}
                            >
                                <MenuItem value="solid">Tinta Unita</MenuItem>
                                <MenuItem value="gradient">Sfumato (Gradiente)</MenuItem>
                            </AppSelectField>

                            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                <Box flex={1}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>{bgType === 'gradient' ? 'Colore 1' : 'Colore'}</Typography>
                                    <input
                                        type="color"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        style={{ width: '100%', height: 40, cursor: 'pointer', border: 'none', borderRadius: 4 }}
                                    />
                                </Box>
                                {bgType === 'gradient' && (
                                    <Box flex={1}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>Colore 2</Typography>
                                        <input
                                            type="color"
                                            value={bgColor2}
                                            onChange={(e) => setBgColor2(e.target.value)}
                                            style={{ width: '100%', height: 40, cursor: 'pointer', border: 'none', borderRadius: 4 }}
                                        />
                                    </Box>
                                )}
                            </Stack>

                            <Box sx={{ mt: 4 }}>
                                <Typography variant="subtitle2" gutterBottom>Anteprima Sfondo (indicativa)</Typography>
                                <Box sx={{
                                    height: 100,
                                    borderRadius: 3,
                                    border: '1px solid #ddd',
                                    background: bgType === 'gradient' ? `linear-gradient(135deg, ${bgColor}, ${bgColor2})` : bgColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: 2,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {logoPreview && (
                                        <img src={logoPreview} alt="Logo" style={{ position: 'absolute', top: 8, left: 8, width: 32, height: 32, objectFit: 'contain' }} />
                                    )}
                                    <Typography fontWeight="bold" sx={{ color: '#000', mixBlendMode: 'overlay', fontSize: '1.2rem', opacity: 0.8 }}>
                                        {name || 'Nome Biglietto'}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
