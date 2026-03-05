import React, { useRef, useState } from 'react';
import {
    Box, Typography, Grid, Avatar, Tooltip, InputAdornment, Button
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import { AppTextField } from '../../components/form';
import api from '../../api';

interface PersonalInfoProps {
    profile: any;
    setProfile: React.Dispatch<React.SetStateAction<any>>;
    setMessage: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error'; text: string; }>>;
    setOpenSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PersonalInfo({ profile, setProfile, setMessage, setOpenSnackbar }: PersonalInfoProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const { avatar, email, ...updateData } = profile;
        api.patch('/api/user/profile/', updateData).then(() => {
            setMessage({ type: 'success', text: 'Profilo aggiornato con successo!' });
            setOpenSnackbar(true);
        }).catch(() => {
            setMessage({ type: 'error', text: "Errore durante l'aggiornamento." });
            setOpenSnackbar(true);
        }).finally(() => setSaving(false));
    };

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            setMessage({ type: 'error', text: "Immagine troppo grande. Max 2MB." });
            setOpenSnackbar(true);
            return;
        }
        const formData = new FormData();
        formData.append('avatar', file);
        api.patch('/api/user/profile/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => {
            setProfile({ ...profile, avatar: res.data.avatar });
            setMessage({ type: 'success', text: 'Immagine aggiornata!' });
            setOpenSnackbar(true);
        }).catch(() => {
            setMessage({ type: 'error', text: "Errore caricamento immagine." });
            setOpenSnackbar(true);
        });
    };

    return (
        <Box component="form" onSubmit={handleUpdate} noValidate>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 5 }}>Informazioni Personali</Typography>
            <Grid container spacing={5}>
                <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Tooltip title="Clicca per cambiare">
                        <Box
                            onMouseEnter={() => setIsHoveringAvatar(true)}
                            onMouseLeave={() => setIsHoveringAvatar(false)}
                            onClick={handleAvatarClick}
                            sx={{
                                position: 'relative', cursor: 'pointer', width: 180, height: 180,
                                borderRadius: '50%', border: '6px solid', borderColor: 'divider',
                                boxShadow: 4, overflow: 'hidden', mb: 2, bgcolor: 'primary.light'
                            }}
                        >
                            <Avatar src={profile.avatar || undefined} sx={{ width: '100%', height: '100%', bgcolor: 'transparent', fontSize: 60 }}>
                                {!profile.avatar && (profile.first_name ? profile.first_name[0] : profile.username?.[0])}
                            </Avatar>
                            <Box sx={{
                                position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                opacity: isHoveringAvatar ? 1 : 0, transition: 'opacity 0.3s', color: 'white'
                            }}>
                                <EditIcon sx={{ fontSize: 40, mb: 0.5 }} />
                                <Typography variant="caption" fontWeight="bold">CAMBIA</Typography>
                            </Box>
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                        </Box>
                    </Tooltip>
                    <Typography variant="body2" color="text.secondary">Max 2MB</Typography>
                </Grid>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <AppTextField fullWidth label="Nome" value={profile.first_name || ''} onChange={(e: any) => setProfile({ ...profile, first_name: e.target.value })}
                                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action" fontSize="small" /></InputAdornment> }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <AppTextField fullWidth label="Cognome" value={profile.last_name || ''} onChange={(e: any) => setProfile({ ...profile, last_name: e.target.value })}
                                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action" fontSize="small" /></InputAdornment> }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <AppTextField fullWidth label="Username" value={profile.username || ''} onChange={(e: any) => setProfile({ ...profile, username: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <AppTextField fullWidth label="Email" disabled value={profile.email || ''} helperText="Non modificabile"
                                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="disabled" fontSize="small" /></InputAdornment> }} />
                        </Grid>
                        <Grid size={12}>
                            <AppTextField fullWidth label="Telefono" value={profile.phone_number || ''} onChange={(e: any) => setProfile({ ...profile, phone_number: e.target.value })}
                                InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon color="action" fontSize="small" /></InputAdornment> }} />
                        </Grid>
                        <Grid size={12}>
                            <AppTextField fullWidth multiline minRows={1} maxRows={10} label="Bio" value={profile.bio || ''} onChange={(e: any) => setProfile({ ...profile, bio: e.target.value })} placeholder="Raccontaci di te..."
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
}
