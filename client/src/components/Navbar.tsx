import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ACCESS_TOKEN } from '../constants';
import {
    AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer,
    List, ListItemButton, ListItemText, Stack, Avatar, useTheme, useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ColorModeIconDropdown from '../../contexts/theme/ColorModeIconDropdown';

function Navbar() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');

    useEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        setIsLoggedIn(!!token);
        // Try to decode username from token
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUsername(payload.username || '');
            } catch { setUsername(''); }
        }
    }, [location]);

    const handleLogout = () => {
        localStorage.clear();
        setIsLoggedIn(false);
        navigate('/');
    };

    const navLinks = [
        { label: 'Home', path: '/' },
        ...(isLoggedIn
            ? [{ label: 'Profilo', path: '/profile' }]
            : []),
    ];

    return (
        <>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    backdropFilter: 'blur(20px)',
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        onClick={() => navigate('/')}
                        sx={{
                            cursor: 'pointer',
                            background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.light})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: '1.4rem',
                            letterSpacing: -0.5,
                        }}
                    >
                        GetInvolved
                    </Typography>

                    {isMobile ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <ColorModeIconDropdown />
                            <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: 'text.primary' }}>
                                <MenuIcon />
                            </IconButton>
                        </Stack>
                    ) : (
                        <Stack direction="row" spacing={2} alignItems="center">
                            {navLinks.map((link) => (
                                <Button
                                    key={link.path}
                                    onClick={() => navigate(link.path)}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: location.pathname === link.path ? 'bold' : 'normal',
                                        color: location.pathname === link.path ? 'primary.main' : 'text.secondary',
                                        '&:hover': { color: 'primary.main' },
                                    }}
                                >
                                    {link.label}
                                </Button>
                            ))}
                            <ColorModeIconDropdown />
                            {isLoggedIn ? (
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Avatar
                                        onClick={() => navigate('/profile')}
                                        sx={{
                                            width: 34, height: 34, bgcolor: 'primary.main', cursor: 'pointer', fontSize: '0.9rem',
                                            '&:hover': { boxShadow: 3 },
                                        }}
                                    >
                                        {username ? username[0].toUpperCase() : 'U'}
                                    </Avatar>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handleLogout}
                                        sx={{ textTransform: 'none', borderRadius: 2 }}
                                    >
                                        Esci
                                    </Button>
                                </Stack>
                            ) : (
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => navigate('/login')}
                                        sx={{ textTransform: 'none', borderRadius: 2 }}
                                    >
                                        Accedi
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => navigate('/register')}
                                        sx={{ textTransform: 'none', borderRadius: 2 }}
                                    >
                                        Registrati
                                    </Button>
                                </Stack>
                            )}
                        </Stack>
                    )}
                </Toolbar>
            </AppBar>

            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box sx={{ width: 280, pt: 2 }}>
                    <List>
                        {navLinks.map((link) => (
                            <ListItemButton
                                key={link.path}
                                onClick={() => { navigate(link.path); setDrawerOpen(false); }}
                                selected={location.pathname === link.path}
                            >
                                <ListItemText primary={link.label} />
                            </ListItemButton>
                        ))}
                        {isLoggedIn ? (
                            <ListItemButton onClick={() => { handleLogout(); setDrawerOpen(false); }}>
                                <ListItemText primary="Esci" sx={{ color: 'error.main' }} />
                            </ListItemButton>
                        ) : (
                            <>
                                <ListItemButton onClick={() => { navigate('/login'); setDrawerOpen(false); }}>
                                    <ListItemText primary="Accedi" />
                                </ListItemButton>
                                <ListItemButton onClick={() => { navigate('/register'); setDrawerOpen(false); }}>
                                    <ListItemText primary="Registrati" />
                                </ListItemButton>
                            </>
                        )}
                    </List>
                </Box>
            </Drawer>
        </>
    );
}

export default Navbar;
