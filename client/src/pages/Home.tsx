import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
    Box, Typography, Container, Skeleton, IconButton, Stack, useTheme, useMediaQuery, Button,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ExploreIcon from '@mui/icons-material/Explore';
import EventCard from '../components/EventCard';
import type { EventCardItem } from '../components/EventCard';



function EventRow({ title, events, loading }: { title: string; events: EventCardItem[]; loading: boolean }) {
    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const amount = direction === 'left' ? -340 : 340;
            scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <Box sx={{ mb: 5 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, px: { xs: 2, md: 6 } }}>{title}</Typography>
                <Stack direction="row" spacing={2} sx={{ px: { xs: 2, md: 6 }, overflow: 'hidden' }}>
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} variant="rounded" width={300} height={280} sx={{ borderRadius: 3, flexShrink: 0 }} />
                    ))}
                </Stack>
            </Box>
        );
    }

    if (events.length === 0) return null;

    return (
        <Box sx={{ mb: 5, position: 'relative' }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, px: { xs: 2, md: 6 } }}>
                {title}
            </Typography>

            {/* Scroll arrows */}
            {!isMobile && events.length > 3 && (
                <>
                    <IconButton
                        onClick={() => scroll('left')}
                        sx={{
                            position: 'absolute', left: 8, top: '55%', zIndex: 2,
                            bgcolor: 'background.paper', boxShadow: 3, border: '1px solid', borderColor: 'divider',
                            '&:hover': { bgcolor: 'action.hover' },
                        }}
                    >
                        <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        onClick={() => scroll('right')}
                        sx={{
                            position: 'absolute', right: 8, top: '55%', zIndex: 2,
                            bgcolor: 'background.paper', boxShadow: 3, border: '1px solid', borderColor: 'divider',
                            '&:hover': { bgcolor: 'action.hover' },
                        }}
                    >
                        <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                </>
            )}

            <Box
                ref={scrollRef}
                sx={{
                    display: 'flex',
                    gap: 2.5,
                    overflowX: 'auto',
                    px: { xs: 2, md: 6 },
                    pb: 2,
                    scrollSnapType: 'x mandatory',
                    '&::-webkit-scrollbar': { height: 6 },
                    '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 },
                }}
            >
                {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </Box>
        </Box>
    );
}

function Home() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [events, setEvents] = useState<EventCardItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/event/public/')
            .then(res => setEvents(res.data))
            .catch(() => {
                // fallback: try the normal events endpoint
                api.get('/api/event/')
                    .then(res => setEvents(res.data))
                    .catch(console.error);
            })
            .finally(() => setLoading(false));
    }, []);

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const upcoming = events
        .filter(e => e.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date));

    const past = events
        .filter(e => e.date < today)
        .sort((a, b) => b.date.localeCompare(a.date));

    const free = events.filter(e =>
        e.ticket_categories?.some(c => parseFloat(c.price) === 0)
    );

    return (
        <Box>
            {/* Hero Section */}
            <Box
                sx={{
                    position: 'relative',
                    background: (t) =>
                        `linear-gradient(160deg, ${t.palette.primary.dark} 0%, ${t.palette.background.default} 55%, ${t.palette.primary.light} 100%)`,
                    py: { xs: 8, md: 14 },
                    px: { xs: 3, md: 6 },
                    overflow: 'hidden',
                }}
            >
                {/* Decorative circles */}
                <Box sx={{
                    position: 'absolute', top: -80, right: -80, width: 300, height: 300,
                    borderRadius: '50%', bgcolor: 'primary.main', opacity: 0.08,
                }} />
                <Box sx={{
                    position: 'absolute', bottom: -60, left: -40, width: 200, height: 200,
                    borderRadius: '50%', bgcolor: 'primary.light', opacity: 0.1,
                }} />

                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        <ExploreIcon sx={{ fontSize: 56, color: 'primary.main' }} />
                    </Box>
                    <Typography
                        variant="h2"
                        fontWeight="bold"
                        sx={{
                            mb: 2,
                            fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' },
                            background: (t) => `linear-gradient(135deg, ${t.palette.text.primary} 30%, ${t.palette.primary.main} 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Scopri eventi straordinari
                    </Typography>
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ mb: 5, maxWidth: 600, mx: 'auto', lineHeight: 1.6, fontSize: { xs: '1rem', md: '1.2rem' } }}
                    >
                        Trova esperienze uniche vicino a te. Concerti, festival, workshop e molto altro — tutto in un solo posto.
                    </Typography>
                    <Stack direction="row" spacing={2} justifyContent="center">
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => {
                                const el = document.getElementById('events-section');
                                el?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            sx={{
                                textTransform: 'none', px: 5, py: 1.5, borderRadius: 3, fontWeight: 'bold', fontSize: '1rem',
                                boxShadow: 4,
                            }}
                        >
                            Esplora Eventi
                        </Button>
                    </Stack>
                </Container>
            </Box>

            {/* Events Rows - Netflix style */}
            <Box id="events-section" sx={{ py: 6 }}>
                <EventRow title="🔥 Prossimi Eventi" events={upcoming} loading={loading} />
                <EventRow title="🎉 Eventi Gratuiti" events={free} loading={loading} />
                <EventRow title="📁 Eventi Passati" events={past} loading={loading} />

                {!loading && events.length === 0 && (
                    <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
                        <ExploreIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 3, opacity: 0.5 }} />
                        <Typography variant="h5" color="text.secondary" gutterBottom>
                            Nessun evento al momento
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Torna presto per scoprire nuovi eventi!
                        </Typography>
                    </Container>
                )}
            </Box>

            {/* Footer */}
            <Box sx={{ bgcolor: 'action.hover', py: 4, borderTop: '1px solid', borderColor: 'divider' }}>
                <Container maxWidth="lg">
                    <Stack spacing={1.5} alignItems="center">
                        <Button
                            variant="text"
                            href={
                                window.location.hostname === 'localhost'
                                    ? `${window.location.protocol}//localhost:3000`
                                    : `${window.location.protocol}//admin.${window.location.hostname}`
                            }
                            sx={{
                                textTransform: 'none',
                                fontWeight: 'bold',
                                fontSize: '0.95rem',
                                color: 'primary.main',
                                '&:hover': { textDecoration: 'underline' },
                            }}
                        >
                            Sei un organizzatore?
                        </Button>
                        <Typography variant="body2" color="text.secondary" align="center">
                            © {new Date().getFullYear()} GetInvolved. Tutti i diritti riservati.
                        </Typography>
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
}

export default Home;
