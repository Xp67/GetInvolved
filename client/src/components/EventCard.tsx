import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Card, CardContent, CardMedia, CardActionArea,
    Chip, Stack,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const resolveImg = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url}`;
};

export interface EventCardItem {
    id: number;
    title: string;
    description: string;
    location: string;
    date: string;
    start_time: string | null;
    organizer_name: string;
    hero_image?: string | null;
    poster_image?: string | null;
    background_color?: string;
    ticket_categories?: { price: string }[];
}

const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
};

const getMinPrice = (cats?: { price: string }[]) => {
    if (!cats || cats.length === 0) return null;
    const prices = cats.map(c => parseFloat(c.price));
    const min = Math.min(...prices);
    return min === 0 ? 'GRATIS' : `Da ${min.toFixed(0)}€`;
};

interface EventCardProps {
    event: EventCardItem;
}

function EventCard({ event }: EventCardProps) {
    const navigate = useNavigate();
    const priceLabel = getMinPrice(event.ticket_categories);
    const heroUrl = resolveImg(event.hero_image);
    const posterUrl = resolveImg(event.poster_image);
    const eventBg = event.background_color || undefined;

    // We use the poster image if available, otherwise hero, otherwise gradient.
    const displayImgUrl = posterUrl || heroUrl || undefined;
    const eventBgColor = eventBg || '#2e7d32'; // using a greenish fallback to match the reference style vibe

    const dateObj = new Date(event.date + 'T00:00:00');
    const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const dayNum = dateObj.getDate().toString();

    // Parse location to get Street and Country (usually the last part of full address)
    const locationParts = event.location.split(',');
    const street = locationParts[0].trim();
    const country = locationParts.length > 1 ? locationParts[locationParts.length - 1].trim() : '';
    const displayLocation = country ? `${street}, ${country}` : street;

    return (
        <Card
            sx={{
                width: { xs: 280, sm: 320 },
                flexShrink: 0,
                scrollSnapAlign: 'start',
                borderRadius: '24px', // The outer card is very rounded in the reference
                border: 'none', // No outer border in the reference, relies on card shadow/background
                bgcolor: 'background.paper',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'scale(1.02)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' },
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                position: 'relative',
            }}
            elevation={0}
        >
            <CardActionArea
                onClick={() => navigate(`/event/${event.id}`)}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    alignItems: 'stretch',
                    justifyContent: 'flex-start',
                    '&:hover .MuiCardActionArea-focusHighlight': {
                        opacity: 0,
                    }
                }}
            >
                {/* Image Section - highly rounded on the bottom as well */}
                <Box
                    sx={{
                        width: '100%',
                        aspectRatio: '1 / 0.85', // roughly matching the reference image squarish proportions
                        backgroundImage: displayImgUrl ? `url(${displayImgUrl})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        background: displayImgUrl
                            ? undefined
                            : `linear-gradient(135deg, ${eventBgColor} 0%, rgba(0,0,0,0.8) 100%)`,
                        borderBottomLeftRadius: '24px',
                        borderBottomRightRadius: '24px',
                        position: 'relative',
                        zIndex: 1,
                    }}
                />

                {/* Info Section */}
                <Box sx={{
                    display: 'flex',
                    width: '100%',
                    p: 2.5,
                    pt: 2,
                    alignItems: 'center'
                }}>

                    {/* Left: Date Pillar */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pr: 2,
                        minWidth: '60px',
                    }}>
                        <Typography
                            variant="button"
                            sx={{
                                color: 'text.secondary',
                                fontWeight: 600,
                                lineHeight: 1,
                                letterSpacing: 1,
                                mb: 0.5
                            }}
                        >
                            {monthStr}
                        </Typography>
                        <Typography
                            variant="h4"
                            sx={{
                                color: '#1b3b24', // matched the dark green from the reference
                                fontWeight: 800,
                                lineHeight: 1
                            }}
                        >
                            {dayNum}
                        </Typography>
                    </Box>

                    {/* Vertical Divider */}
                    <Box sx={{
                        width: '1px',
                        height: '40px',
                        bgcolor: 'divider',
                        mx: 1
                    }} />

                    {/* Right: Details Stack */}
                    <Box sx={{
                        flex: 1,
                        pl: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                    }}>
                        {/* Location */}
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5, color: 'text.secondary' }}>
                            <LocationOnIcon sx={{ fontSize: 14 }} />
                            <Typography variant="caption" sx={{ fontWeight: 500 }} noWrap>
                                {displayLocation}
                            </Typography>
                        </Stack>

                        {/* Title */}
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 800,
                                color: '#1b3b24', // matched dark green reference
                                lineHeight: 1.2,
                                mb: 0.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}
                        >
                            {event.title}
                        </Typography>

                        {/* Price Subtitle */}
                        {priceLabel && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                                {/* simple tag icon polygon */}
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                                </svg>
                                Starts from {priceLabel.replace('Da ', '')}
                            </Typography>
                        )}
                    </Box>

                </Box>
            </CardActionArea>
        </Card>
    );
}

export default EventCard;
