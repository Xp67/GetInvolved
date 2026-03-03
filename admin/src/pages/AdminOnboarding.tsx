import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import AddressAutocomplete from '../components/AddressAutocomplete';
import {
    Box, Container, Paper, Typography, TextField, Button, Stack,
    Stepper, Step, StepLabel, Chip, Fade, CircularProgress,
    ToggleButtonGroup, ToggleButton, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import EventIcon from '@mui/icons-material/Event';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const steps = ['Nickname', 'Tipo', 'Dati', 'Dipendenti', 'Eventi', 'Fine'];

const eventTypes: string[] = [];
// Placeholder — popolare in futuro, es.:
// const eventTypes = ['Concerti', 'Festival', 'Workshop', 'Conferenze', 'Fiere', 'Eventi Sportivi', 'Team Building'];

const employeeRanges = ['1-5', '6-20', '21-50', '50+'];

function AdminOnboarding() {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Data
    const [nickname, setNickname] = useState('');
    const [isCompany, setIsCompany] = useState(true);

    // Company
    const [companyName, setCompanyName] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [vatNumber, setVatNumber] = useState('');

    // Individual
    const [firstNameOrg, setFirstNameOrg] = useState('');
    const [lastNameOrg, setLastNameOrg] = useState('');
    const [fiscalCode, setFiscalCode] = useState('');

    // Common
    const [employeeCount, setEmployeeCount] = useState('');
    const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);

    // Redirect on last step
    useEffect(() => {
        if (activeStep === 5) {
            const timer = setTimeout(() => navigate('/dashboard'), 3000);
            return () => clearTimeout(timer);
        }
    }, [activeStep, navigate]);

    const toggleEventType = (type: string) => {
        setSelectedEventTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
    };

    const handleComplete = async () => {
        setLoading(true);
        setError('');
        try {
            await api.patch('/api/user/admin-onboarding/', {
                nickname: nickname || undefined,
                is_company: isCompany,
                company_name: companyName || undefined,
                company_address: companyAddress || undefined,
                vat_number: vatNumber || undefined,
                first_name_org: firstNameOrg || undefined,
                last_name_org: lastNameOrg || undefined,
                fiscal_code: fiscalCode || undefined,
                employee_count: employeeCount || undefined,
                event_types: selectedEventTypes,
            });
            setActiveStep(5);
        } catch {
            setError('Errore durante il salvataggio. Riprova.');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (activeStep === 4) {
            handleComplete();
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => setActiveStep((prev) => prev - 1);

    const canSkip = activeStep === 4; // Only event types is skippable

    const stepIcons = [
        <PersonOutlineIcon key="person" />,
        <BusinessIcon key="business" />,
        <PersonIcon key="data" />,
        <GroupsIcon key="groups" />,
        <EventIcon key="event" />,
        <CelebrationIcon key="celebrate" />,
    ];

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: (t) =>
                    `linear-gradient(135deg, ${t.palette.background.default} 0%, ${t.palette.primary.dark}22 50%, ${t.palette.background.default} 100%)`,
                py: 4,
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
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0, left: 0, right: 0, height: 4,
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
                                    background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.light})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 1,
                                }}
                            >
                                Benvenuto Organizzatore!
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Configura il tuo profilo organizzatore
                            </Typography>
                        </Box>

                        {/* Stepper */}
                        {activeStep < 5 && (
                            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                                {steps.map((label, index) => (
                                    <Step key={label}>
                                        <StepLabel
                                            icon={index < activeStep ? <CheckCircleOutlineIcon color="primary" /> : stepIcons[index]}
                                        >
                                            {label}
                                        </StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        )}

                        {/* Step Content */}
                        <Box sx={{ minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            {/* Step 0: Nickname */}
                            {activeStep === 0 && (
                                <Fade in timeout={400}>
                                    <Stack spacing={3} alignItems="center">
                                        <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <PersonOutlineIcon sx={{ fontSize: 40, color: 'white' }} />
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold" textAlign="center">
                                            Come vuoi essere chiamato?
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" textAlign="center">
                                            Scegli un nickname per il tuo profilo organizzatore
                                        </Typography>
                                        <TextField fullWidth label="Nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} autoFocus sx={{ maxWidth: 400 }} />
                                    </Stack>
                                </Fade>
                            )}

                            {/* Step 1: Company or Individual */}
                            {activeStep === 1 && (
                                <Fade in timeout={400}>
                                    <Stack spacing={3} alignItems="center">
                                        <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <BusinessIcon sx={{ fontSize: 40, color: 'white' }} />
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold" textAlign="center">
                                            Che tipo di organizzatore sei?
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" textAlign="center">
                                            Seleziona se operi come azienda o persona fisica
                                        </Typography>
                                        <ToggleButtonGroup
                                            exclusive
                                            value={isCompany ? 'company' : 'individual'}
                                            onChange={(_e, val) => { if (val !== null) setIsCompany(val === 'company'); }}
                                            sx={{ gap: 2 }}
                                        >
                                            <ToggleButton
                                                value="company"
                                                sx={{
                                                    px: 4, py: 2, borderRadius: '12px !important',
                                                    textTransform: 'none', fontWeight: 'bold',
                                                    border: '2px solid',
                                                    borderColor: isCompany ? 'primary.main' : 'divider',
                                                    '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } },
                                                }}
                                            >
                                                <BusinessIcon sx={{ mr: 1 }} />
                                                Azienda
                                            </ToggleButton>
                                            <ToggleButton
                                                value="individual"
                                                sx={{
                                                    px: 4, py: 2, borderRadius: '12px !important',
                                                    textTransform: 'none', fontWeight: 'bold',
                                                    border: '2px solid',
                                                    borderColor: !isCompany ? 'primary.main' : 'divider',
                                                    '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } },
                                                }}
                                            >
                                                <PersonIcon sx={{ mr: 1 }} />
                                                Persona Fisica
                                            </ToggleButton>
                                        </ToggleButtonGroup>
                                    </Stack>
                                </Fade>
                            )}

                            {/* Step 2: Data */}
                            {activeStep === 2 && (
                                <Fade in timeout={400}>
                                    <Stack spacing={3} alignItems="center">
                                        <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {isCompany
                                                ? <BusinessIcon sx={{ fontSize: 40, color: 'white' }} />
                                                : <PersonIcon sx={{ fontSize: 40, color: 'white' }} />}
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold" textAlign="center">
                                            {isCompany ? 'Dati aziendali' : 'Dati personali'}
                                        </Typography>
                                        {isCompany ? (
                                            <Stack spacing={2.5} sx={{ width: '100%', maxWidth: 400 }}>
                                                <TextField fullWidth label="Ragione Sociale" value={companyName} onChange={(e) => setCompanyName(e.target.value)} autoFocus />
                                                <TextField fullWidth label="Partita IVA" value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} />
                                                <AddressAutocomplete
                                                    value={companyAddress}
                                                    onChange={setCompanyAddress}
                                                    label="Sede Aziendale"
                                                    placeholder="Cerca la sede dell'azienda..."
                                                />
                                            </Stack>
                                        ) : (
                                            <Stack spacing={2.5} sx={{ width: '100%', maxWidth: 400 }}>
                                                <TextField fullWidth label="Nome" value={firstNameOrg} onChange={(e) => setFirstNameOrg(e.target.value)} autoFocus />
                                                <TextField fullWidth label="Cognome" value={lastNameOrg} onChange={(e) => setLastNameOrg(e.target.value)} />
                                                <TextField fullWidth label="Codice Fiscale" value={fiscalCode} onChange={(e) => setFiscalCode(e.target.value)} />
                                            </Stack>
                                        )}
                                    </Stack>
                                </Fade>
                            )}

                            {/* Step 3: Employees */}
                            {activeStep === 3 && (
                                <Fade in timeout={400}>
                                    <Stack spacing={3} alignItems="center">
                                        <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <GroupsIcon sx={{ fontSize: 40, color: 'white' }} />
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold" textAlign="center">
                                            Quanti dipendenti avete?
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" textAlign="center">
                                            Seleziona il range che meglio descrive la tua organizzazione
                                        </Typography>
                                        <FormControl sx={{ width: '100%', maxWidth: 400 }}>
                                            <InputLabel>Numero dipendenti</InputLabel>
                                            <Select
                                                value={employeeCount}
                                                label="Numero dipendenti"
                                                onChange={(e) => setEmployeeCount(e.target.value)}
                                            >
                                                {employeeRanges.map((range) => (
                                                    <MenuItem key={range} value={range}>{range} dipendenti</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Stack>
                                </Fade>
                            )}

                            {/* Step 4: Event Types */}
                            {activeStep === 4 && (
                                <Fade in timeout={400}>
                                    <Stack spacing={3} alignItems="center">
                                        <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <EventIcon sx={{ fontSize: 40, color: 'white' }} />
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold" textAlign="center">
                                            Che tipo di eventi organizzi?
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" textAlign="center">
                                            Seleziona le tipologie di eventi (puoi saltare questo passaggio)
                                        </Typography>
                                        {eventTypes.length > 0 ? (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', maxWidth: 450 }}>
                                                {eventTypes.map((type) => (
                                                    <Chip
                                                        key={type}
                                                        label={type}
                                                        onClick={() => toggleEventType(type)}
                                                        color={selectedEventTypes.includes(type) ? 'primary' : 'default'}
                                                        variant={selectedEventTypes.includes(type) ? 'filled' : 'outlined'}
                                                        sx={{
                                                            fontWeight: selectedEventTypes.includes(type) ? 'bold' : 'normal',
                                                            transition: 'all 0.2s ease',
                                                            '&:hover': { transform: 'scale(1.05)' },
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        ) : (
                                            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderStyle: 'dashed', textAlign: 'center', maxWidth: 400, width: '100%' }}>
                                                <EventIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Le tipologie di eventi saranno disponibili presto!
                                                </Typography>
                                                <Typography variant="caption" color="text.disabled">
                                                    Puoi saltare questo passaggio per ora
                                                </Typography>
                                            </Paper>
                                        )}
                                    </Stack>
                                </Fade>
                            )}

                            {/* Step 5: Thank You */}
                            {activeStep === 5 && (
                                <Fade in timeout={600}>
                                    <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
                                        <Box
                                            sx={{
                                                width: 100, height: 100, borderRadius: '50%',
                                                background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.light})`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                animation: 'pulse 2s ease-in-out infinite',
                                                '@keyframes pulse': { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.08)' }, '100%': { transform: 'scale(1)' } },
                                            }}
                                        >
                                            <CelebrationIcon sx={{ fontSize: 50, color: 'white' }} />
                                        </Box>
                                        <Typography variant="h5" fontWeight="bold" textAlign="center">
                                            Grazie, {nickname || 'organizzatore'}! 🎉
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" textAlign="center">
                                            Il tuo profilo organizzatore è stato configurato con successo.
                                        </Typography>
                                        <Typography variant="body2" color="text.disabled" textAlign="center">
                                            Verrai reindirizzato alla dashboard tra pochi secondi...
                                        </Typography>
                                        <CircularProgress size={24} sx={{ mt: 1 }} />
                                    </Stack>
                                </Fade>
                            )}
                        </Box>

                        {/* Error */}
                        {error && <Typography color="error" variant="body2" textAlign="center" sx={{ mt: 2 }}>{error}</Typography>}

                        {/* Navigation */}
                        {activeStep < 5 && (
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 4 }}>
                                <Button onClick={handleBack} disabled={activeStep === 0}
                                    sx={{ textTransform: 'none', visibility: activeStep === 0 ? 'hidden' : 'visible' }}>
                                    Indietro
                                </Button>
                                <Stack direction="row" spacing={1}>
                                    {canSkip && (
                                        <Button onClick={handleComplete} sx={{ textTransform: 'none', color: 'text.secondary' }}>
                                            Salta
                                        </Button>
                                    )}
                                    <Button variant="contained" onClick={handleNext} disabled={loading}
                                        sx={{ textTransform: 'none', borderRadius: 2, px: 4, fontWeight: 'bold' }}>
                                        {loading ? <CircularProgress size={22} color="inherit" />
                                            : activeStep === 4 ? 'Completa' : 'Avanti'}
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

export default AdminOnboarding;
