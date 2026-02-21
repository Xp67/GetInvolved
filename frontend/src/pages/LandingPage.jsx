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
import EventIcon from '@mui/icons-material/Event';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TaskIcon from '@mui/icons-material/Task';
import { ACCESS_TOKEN } from '../constants';

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
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center',
          borderRadius: '0 0 50px 50px',
          mb: 6
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Benvenuto su GetInvolved
          </Typography>
          <Typography variant="h5" paragraph sx={{ mb: 4, opacity: 0.9 }}>
            La piattaforma all-in-one per i tuoi eventi e la gestione dei tuoi progetti.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            {!isLoggedIn ? (
              <>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{ fontWeight: 'bold' }}
                >
                  Inizia Ora
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  onClick={() => navigate('/login')}
                >
                  Accedi
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate('/dashboard')}
                sx={{ fontWeight: 'bold' }}
              >
                Vai alla Dashboard
              </Button>
            )}
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
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: '0.3s',
                  '&:hover': { transform: 'translateY(-10px)', boxShadow: 6 }
                }}
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
      <Box sx={{ bgcolor: 'grey.100', py: 4, borderTop: '1px solid', borderColor: 'divider' }}>
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
