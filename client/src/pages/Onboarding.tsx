import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import AddressAutocomplete from '../components/AddressAutocomplete';
import {
    Box, Container, Paper, Typography, Button, Stack,
    Stepper, Step, StepLabel, Chip, Fade, CircularProgress, Grid,
} from '@mui/material';
import { AppTextField } from '../components/form';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import CelebrationIcon from '@mui/icons-material/Celebration';

const steps = ['Nickname', 'Dove vivi?', 'Musica', 'Fine'];

const musicGenres: string[] = [];

// Coppie nome+cognome casuali — modifica qui la lista a piacere
const SAMPLE_PEOPLE = [
    { name: 'Lara', surname: 'Ghirardi' },
    { name: 'Mirea', surname: 'Elia' },
    { name: 'Matteo', surname: 'Cafà' },
    { name: 'Giovanni', surname: 'Parisi' },
    { name: 'Marco', surname: 'Elefanti' },
    { name: 'Giulia', surname: 'Tessaro' },
    { name: 'Samuele', surname: 'Risalvato' },
    { name: 'Sofia', surname: 'Castelli' },
    { name: 'Brenda', surname: 'Palazzo' },
    { name: 'Moreno', surname: 'Gallazzi' },
    { name: 'Mattia', surname: 'Maciariello' },
    { name: 'Alice', surname: 'Bubbo' },
    { name: 'Anwar', surname: 'Giani' },
    { name: 'Simone', surname: 'Marocco' },
    { name: 'Matteo', surname: 'Caprì' },
    { name: 'Davide', surname: 'Cislaghi' },
    { name: 'Chiara', surname: 'D Alio' }
];
const pickPerson = () => SAMPLE_PEOPLE[Math.floor(Math.random() * SAMPLE_PEOPLE.length)];

interface OnboardingProps {
    embedded?: boolean;
    onComplete?: () => void;
}

function Onboarding({ embedded = false, onComplete }: OnboardingProps = {}) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';
    const [activeStep, setActiveStep] = useState(0);
    const [nickname, setNickname] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [samplePerson] = useState(pickPerson);
    const [location, setLocation] = useState('');
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect countdown on last step — skip when embedded
    useEffect(() => {
        if (activeStep === 3 && !embedded) {
            const timer = setTimeout(() => navigate(redirectTo), 3000);
            return () => clearTimeout(timer);
        }
    }, [activeStep, navigate, redirectTo, embedded]);

    const toggleGenre = (genre: string) => {
        setSelectedGenres((prev) =>
            prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
        );
    };

    const handleComplete = async () => {
        setLoading(true);
        setError('');
        try {
            await api.patch('/api/user/onboarding/', {
                nickname: nickname || undefined,
                first_name: firstName || undefined,
                last_name: lastName || undefined,
                location: location || undefined,
                music_preferences: selectedGenres.length > 0 ? selectedGenres : [],
            });
            setActiveStep(3);
            if (embedded && onComplete) onComplete();
        } catch {
            setError('Errore durante il salvataggio. Riprova.');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (activeStep === 2) {
            handleComplete();
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const canSkip = activeStep === 1 || activeStep === 2;

    const stepIcons = [
        <PersonOutlineIcon key="person" />,
        <LocationOnIcon key="location" />,
        <MusicNoteIcon key="music" />,
        <CelebrationIcon key="celebration" />,
    ];

    return (
        <Box
            sx={{
                minHeight: embedded ? 'auto' : '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: embedded
                    ? 'transparent'
                    : (t) =>
                        `linear-gradient(135deg, ${t.palette.background.default} 0%, ${t.palette.primary.dark}22 50%, ${t.palette.background.default} 100%)`,
                py: embedded ? 0 : 4,
            }}
        >
            <Container maxWidth="sm">
                <Fade in timeout={600}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, md: 5 },
                            borderRadius: 4,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            backdropFilter: 'blur(20px)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 4,
                                background: (t) =>
                                    `linear-gradient(90deg, ${t.palette.primary.main}, ${t.palette.primary.light})`,
                            },
                        }}
                    >
                        {/* Header */}
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Typography
                                variant="h4"
                                fontWeight="bold"
                                sx={{
                                    background: (t) =>
                                        `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.light})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 1,
                                }}
                            >
                                Benvenuto su GetInvolved!
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Configura il tuo profilo in pochi passi
                            </Typography>
                        </Box>

                        {/* Stepper */}
                        {activeStep < 3 && (
                            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                                {steps.map((label, index) => (
                                    <Step key={label}>
                                        <StepLabel
                                            icon={
                                                index < activeStep ? (
                                                    <CheckCircleOutlineIcon color="primary" />
                                                ) : (
                                                    stepIcons[index]
                                                )
                                            }
                                        >
                                            {label}
                                        </StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        )}

                        {/* Step Content */}
                        <Box sx={{ minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            {/* Step 0: Nickname */}
                            {activeStep === 0 && (
                                <Fade in timeout={400}>
                                    <Stack spacing={3} alignItems="center">
                                        <Box
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.main',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mb: 1,
                                            }}
                                        >
                                            <PersonOutlineIcon sx={{ fontSize: 40, color: 'white' }} />
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold" textAlign="center">
                                            Raccontaci di te
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" textAlign="center">
                                            Scegli un nickname e inserisci il tuo nome (opzionale)
                                        </Typography>
                                        <Box sx={{ width: '100%', maxWidth: 400 }}>
                                            <Stack spacing={2}>
                                                <AppTextField
                                                    fullWidth
                                                    label="Nickname"
                                                    placeholder="Il tuo nickname..."
                                                    value={nickname}
                                                    onChange={(e) => setNickname(e.target.value)}
                                                    autoFocus
                                                />
                                                <Grid container spacing={2}>
                                                    <Grid size={6}>
                                                        <AppTextField
                                                            fullWidth
                                                            label="Nome"
                                                            placeholder={samplePerson.name}
                                                            value={firstName}
                                                            onChange={(e) => setFirstName(e.target.value)}
                                                        />
                                                    </Grid>
                                                    <Grid size={6}>
                                                        <AppTextField
                                                            fullWidth
                                                            label="Cognome"
                                                            placeholder={samplePerson.surname}
                                                            value={lastName}
                                                            onChange={(e) => setLastName(e.target.value)}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Stack>
                                        </Box>
                                    </Stack>
                                </Fade>
                            )}

                            {/* Step 1: Location */}
                            {activeStep === 1 && (
                                <Fade in timeout={400}>
                                    <Stack spacing={3} alignItems="center">
                                        <Box
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.main',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mb: 1,
                                            }}
                                        >
                                            <LocationOnIcon sx={{ fontSize: 40, color: 'white' }} />
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold" textAlign="center">
                                            Dove vivi?
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" textAlign="center">
                                            Ci aiuterà a consigliarti eventi vicino a te
                                        </Typography>
                                        <Box sx={{ width: '100%', maxWidth: 400 }}>
                                            <AddressAutocomplete
                                                value={location}
                                                onChange={setLocation}
                                                label="La tua città"
                                                placeholder="Cerca la tua città o indirizzo..."
                                            />
                                        </Box>
                                    </Stack>
                                </Fade>
                            )}

                            {/* Step 2: Music Preferences */}
                            {activeStep === 2 && (
                                <Fade in timeout={400}>
                                    <Stack spacing={3} alignItems="center">
                                        <Box
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.main',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mb: 1,
                                            }}
                                        >
                                            <MusicNoteIcon sx={{ fontSize: 40, color: 'white' }} />
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold" textAlign="center">
                                            Che tipo di musica ti piace?
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" textAlign="center">
                                            Seleziona i generi che preferisci (puoi saltare questo passaggio)
                                        </Typography>
                                        {musicGenres.length > 0 ? (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: 1,
                                                    justifyContent: 'center',
                                                    maxWidth: 450,
                                                }}
                                            >
                                                {musicGenres.map((genre) => (
                                                    <Chip
                                                        key={genre}
                                                        label={genre}
                                                        onClick={() => toggleGenre(genre)}
                                                        color={selectedGenres.includes(genre) ? 'primary' : 'default'}
                                                        variant={selectedGenres.includes(genre) ? 'filled' : 'outlined'}
                                                        sx={{
                                                            fontWeight: selectedGenres.includes(genre) ? 'bold' : 'normal',
                                                            transition: 'all 0.2s ease',
                                                            '&:hover': {
                                                                transform: 'scale(1.05)',
                                                            },
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        ) : (
                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: 3,
                                                    borderRadius: 3,
                                                    borderStyle: 'dashed',
                                                    textAlign: 'center',
                                                    maxWidth: 400,
                                                    width: '100%',
                                                }}
                                            >
                                                <MusicNoteIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    I generi musicali saranno disponibili presto!
                                                </Typography>
                                                <Typography variant="caption" color="text.disabled">
                                                    Puoi saltare questo passaggio per ora
                                                </Typography>
                                            </Paper>
                                        )}
                                    </Stack>
                                </Fade>
                            )}

                            {/* Step 3: Thank You */}
                            {activeStep === 3 && (
                                <Fade in timeout={600}>
                                    <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
                                        <Box
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                borderRadius: '50%',
                                                background: (t) =>
                                                    `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.light})`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                animation: 'pulse 2s ease-in-out infinite',
                                                '@keyframes pulse': {
                                                    '0%': { transform: 'scale(1)' },
                                                    '50%': { transform: 'scale(1.08)' },
                                                    '100%': { transform: 'scale(1)' },
                                                },
                                            }}
                                        >
                                            <CelebrationIcon sx={{ fontSize: 50, color: 'white' }} />
                                        </Box>
                                        <Typography variant="h5" fontWeight="bold" textAlign="center">
                                            Benvenuto{firstName ? `, ${firstName}` : nickname ? `, ${nickname}` : ''}! 🎉
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" textAlign="center">
                                            Il tuo profilo è stato configurato con successo.
                                        </Typography>
                                        {embedded ? (
                                            <Button
                                                variant="outlined"
                                                onClick={() => {
                                                    setActiveStep(0);
                                                    setNickname('');
                                                    setFirstName('');
                                                    setLastName('');
                                                    setLocation('');
                                                    setSelectedGenres([]);
                                                }}
                                                sx={{ mt: 1, textTransform: 'none', borderRadius: 2 }}
                                            >
                                                Ricomincia
                                            </Button>
                                        ) : (
                                            <>
                                                <Typography variant="body2" color="text.disabled" textAlign="center">
                                                    Verrai reindirizzato alla home tra pochi secondi...
                                                </Typography>
                                                <CircularProgress size={24} sx={{ mt: 1 }} />
                                            </>
                                        )}
                                    </Stack>
                                </Fade>
                            )}
                        </Box>

                        {/* Error message */}
                        {error && (
                            <Typography color="error" variant="body2" textAlign="center" sx={{ mt: 2 }}>
                                {error}
                            </Typography>
                        )}

                        {/* Navigation buttons */}
                        {activeStep < 3 && (
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                sx={{ mt: 4 }}
                            >
                                <Button
                                    onClick={handleBack}
                                    disabled={activeStep === 0}
                                    sx={{ textTransform: 'none', visibility: activeStep === 0 ? 'hidden' : 'visible' }}
                                >
                                    Indietro
                                </Button>

                                <Stack direction="row" spacing={1}>
                                    {canSkip && (
                                        <Button
                                            onClick={activeStep === 2 ? handleComplete : handleNext}
                                            sx={{ textTransform: 'none', color: 'text.secondary' }}
                                        >
                                            Salta
                                        </Button>
                                    )}
                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                        disabled={loading}
                                        sx={{
                                            textTransform: 'none',
                                            borderRadius: 2,
                                            px: 4,
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {loading ? (
                                            <CircularProgress size={22} color="inherit" />
                                        ) : activeStep === 2 ? (
                                            'Completa'
                                        ) : (
                                            'Avanti'
                                        )}
                                    </Button>
                                </Stack>
                            </Stack>
                        )}
                    </Paper>
                </Fade>
            </Container>
        </Box>
    );
}

export default Onboarding;
