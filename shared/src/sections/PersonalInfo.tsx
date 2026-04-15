import React, { useRef, useState } from 'react';
import {
    Box, Typography, Grid, Avatar, Tooltip, InputAdornment, Button,
    useTheme, useMediaQuery,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import { AppTextField } from '../components/form';
import api from '../apiClient';

interface PersonalInfoProps {
    profile: any;
    setProfile: (p: any) => void;
    setMessage: (m: { type: 'success' | 'error'; text: string }) => void;
    setOpenSnackbar: (v: boolean) => void;
    isMobile?: boolean;
    [key: string]: any;
}

export default function PersonalInfo({
    profile,
    setProfile,
    setMessage,
    setOpenSnackbar,
    isMobile: isMobileProp,
}: PersonalInfoProps) {
    const theme = useTheme();
    const isMobileDetected = useMediaQuery(theme.breakpoints.down('md'));
    const isMobile = isMobileProp ?? isMobileDetected;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleAvatarClick = () => { fileInputRef.current?.click(); };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            setMessage({ type: 'error', text: "L'immagine è troppo grande. Massimo 2MB." });
            setOpenSnackbar(true);
            return;
        }
        const formData = new FormData();
        formData.append('avatar', file);
        api.patch('/api/user/profile/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
            .then((res: any) => {
                setProfile({ ...profile, avatar: res.data.avatar });
                setMessage({ type: 'success', text: 'Immagine del profilo aggiornata!' });
                setOpenSnackbar(true);
            })
            .catch(() => {
                setMessage({ type: 'error', text: "Errore durante il caricamento dell'immagine." });
                setOpenSnackbar(true);
            });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const { avatar, email, ...updateData } = profile;
        api.patch('/api/user/profile/', updateData)
            .then(() => {
                setMessage({ type: 'success', text: 'Profilo aggiornato con successo!' });
                setOpenSnackbar(true);
            })
            .catch(() => {
                setMessage({ type: 'error', text: "Errore durante l'aggiornamento." });
                setOpenSnackbar(true);
            })
            .finally(() => setSaving(false));
    };

    return (
        <Box component="form" onSubmit={handleUpdate} noValidate sx={{ width: '100%', textAlign: isMobile ? 'center' : 'left' }}>
            <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom fontWeight="bold" sx={{ mb: isMobile ? 4 : 6 }}>
                Informazioni Personali
            </Typography>
            <Grid container spacing={isMobile ? 4 : 6} justifyContent={isMobile ? 'center' : 'flex-start'}>
                <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Tooltip title="Clicca per cambiare immagine" placement="top">
                        <Box
                            onMouseEnter={() => setIsHoveringAvatar(true)}
                            onMouseLeave={() => setIsHoveringAvatar(false)}
                            onClick={handleAvatarClick}
                            sx={{
                                position: 'relative', cursor: 'pointer',
                                width: isMobile ? 160 : 220, height: isMobile ? 160 : 220,
                                borderRadius: '50%', border: '8px solid', borderColor: 'divider',
                                boxShadow: 4, overflow: 'hidden', mb: 2, bgcolor: 'primary.light',
                            }}
                        >
                            <Avatar
                                src={profile.avatar || undefined}
                                sx={{ width: '100%', height: '100%', bgcolor: 'transparent', fontSize: isMobile ? 60 : 80 }}
                            >
                                {!profile.avatar && (profile.first_name ? profile.first_name[0] : profile.username?.[0])}
                            </Avatar>
                            <Box sx={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                bgcolor: 'rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                opacity: isHoveringAvatar ? 1 : 0, transition: 'opacity 0.3s ease', zIndex: 2, color: 'white',
                            }}>
                                <EditIcon sx={{ fontSize: 48, mb: 0.5 }} />
                                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>CAMBIA</Typography>
                            </Box>
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                        </Box>
                    </Tooltip>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        JPG, PNG o GIF. Massimo 2MB.
                    </Typography>
                </Grid>

                <Grid size={{ xs: 12, lg: 8 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <AppTextField
                                fullWidth label="Nome" value={profile.first_name || ''}
                                onChange={(e: any) => setProfile({ ...profile, first_name: e.target.value })}
                                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action" fontSize="small" /></InputAdornment> }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <AppTextField
                                fullWidth label="Cognome" value={profile.last_name || ''}
                                onChange={(e: any) => setProfile({ ...profile, last_name: e.target.value })}
                                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action" fontSize="small" /></InputAdornment> }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <AppTextField
                                fullWidth label="Username" value={profile.username || ''}
                                onChange={(e: any) => setProfile({ ...profile, username: e.target.value })}
                                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action" fontSize="small" /></InputAdornment> }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <AppTextField
                                fullWidth label="Email" disabled value={profile.email || ''}
                                helperText="L'email non può essere modificata."
                                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="disabled" fontSize="small" /></InputAdornment> }}
                            />
                        </Grid>
                        <Grid size={12}>
                            <AppTextField
                                fullWidth label="Numero di Telefono" value={profile.phone_number || ''}
                                onChange={(e: any) => setProfile({ ...profile, phone_number: e.target.value })}
                                InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon color="action" fontSize="small" /></InputAdornment> }}
                            />
                        </Grid>
                        <Grid size={12}>
                            <AppTextField
                                fullWidth multiline minRows={1} maxRows={10} label="Bio" value={profile.bio || ''}
                                onChange={(e: any) => setProfile({ ...profile, bio: e.target.value })}
                                placeholder="Raccontaci qualcosa di te..."
                                InputProps={{ startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}><InfoIcon color="action" fontSize="small" /></InputAdornment> }}
                            />
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: isMobile ? 'center' : 'flex-end' }}>
                        <Button
                            type="submit" variant="contained" color="warning" size="large"
                            fullWidth={isMobile} disabled={saving} startIcon={saving ? null : <SaveIcon />}
                            sx={{ px: isMobile ? 4 : 6, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 'bold', fontSize: '1rem' }}
                        >
                            {saving ? 'Salvataggio...' : 'Salva Modifiche'}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
