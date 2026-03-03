import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN } from '../constants';
import EventIcon from '@mui/icons-material/Event';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TaskIcon from '@mui/icons-material/Task';

function LandingPage() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        setIsLoggedIn(!!token);
    }, []);

    const services = [
        {
            title: 'Vendita Ticket',
            description: 'Gestisci la vendita dei biglietti per i tuoi eventi in modo semplice e sicuro.',
            icon: <EventIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        },
        {
            title: 'Project Management',
            description: 'Sistema integrato con task, to-do list e diagrammi di Gantt responsive.',
            icon: <TaskIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        },
        {
            title: 'Area Personale',
            description: 'Un pannello di controllo dedicato per gestire tutte le tue attività e il tuo profilo.',
            icon: <AccountCircleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        }
    ];

    return (
        <Box>
            {/* Hero Section */}
            <Box
                sx={{
                    background: (theme) =>
                        `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    py: { xs: 8, md: 12 },
                    textAlign: 'center',
                    borderRadius: { xs: '0 0 30px 30px', md: '0 0 50px 50px' },
                    mb: 8,
                }}
            >
                <Container maxWidth="md">
                    <Typography
                        variant="h2"
                        component="h1"
                        gutterBottom
                        fontWeight="bold"
                        sx={{ fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' } }}
                    >
                        Benvenuto su GetInvolved
                    </Typography>
                    <Typography
                        variant="h5"
                        paragraph
                        sx={{
                            mb: 4,
                            opacity: 0.9,
                            fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                        }}
                    >
                        La piattaforma all-in-one per i tuoi eventi e la gestione dei tuoi progetti.
                    </Typography>
                    <Stack direction="row" spacing={2} justifyContent="center">
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => isLoggedIn ? navigate('/dashboard') : navigate('/login')}
                            sx={{
                                fontWeight: 'bold',
                                textTransform: 'none',
                                bgcolor: 'white',
                                color: 'primary.main',
                                px: 4,
                                py: 1.5,
                                borderRadius: 3,
                                '&:hover': {
                                    bgcolor: 'grey.100',
                                },
                            }}
                        >
                            Inizia ora
                        </Button>
                    </Stack>
                </Container>
            </Box>

            {/* Services Section */}
            <Container maxWidth="lg" sx={{ mb: 8 }}>
                <Typography variant="h4" component="h2" textAlign="center" gutterBottom fontWeight="bold">
                    I Nostri Servizi
                </Typography>
                <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
                    Scopri tutto quello che puoi fare con la nostra piattaforma
                </Typography>

                <Grid container spacing={4}>
                    {services.map((service, index) => (
                        <Grid size={{ xs: 12, md: 4 }} key={index}>
                            <Card
                                sx={{
                                    height: '100%',
                                    width: '60%',
                                    maxWidth: '400px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.3s ease-in-out',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 3,
                                    bgcolor: 'background.paper',
                                    '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 }
                                }}
                                elevation={0}
                            >
                                <CardContent sx={{ textAlign: 'center', flexGrow: 1, pt: 4 }}>
                                    <Box sx={{ mb: 2 }}>
                                        {service.icon}
                                    </Box>
                                    <Typography gutterBottom variant="h5" component="div" fontWeight="bold">
                                        {service.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {service.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Footer */}
            <Box sx={{ bgcolor: 'action.hover', py: 4, borderTop: '1px solid', borderColor: 'divider' }}>
                <Container maxWidth="lg">
                    <Typography variant="body2" color="text.secondary" align="center">
                        © {new Date().getFullYear()} GetInvolved. Tutti i diritti riservati.
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
}

export default LandingPage;
