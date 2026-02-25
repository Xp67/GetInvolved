import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Container,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { ACCESS_TOKEN } from '../constants';
import api from '../api';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem(ACCESS_TOKEN);
    setIsLoggedIn(!!token);
    if (token) {
      fetchUsername();
    }
  }, [location]);

  const fetchUsername = async () => {
    try {
      const res = await api.get("/api/user/profile/");
      setUsername(res.data.username);
    } catch (error) {
      console.error("Error fetching username", error);
      // If unauthorized, the interceptor should handle it,
      // but here we just ensure we don't show a broken username
    }
  };

  const navItems = [
    { label: 'Home', path: '/' },
    ...(isLoggedIn ? [
      { label: 'Dashboard', path: '/dashboard' },
      ...(isMobile ? [] : [{ label: 'Profilo', path: '/profile' }]),
      { label: 'Esci', path: '/logout', color: 'error.main' }
    ] : [
      { label: 'Inizia ora', path: '/login' }
    ])
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  return (
    <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'white', color: 'text.primary' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer', color: 'primary.main' }}
            onClick={() => navigate('/')}
          >
            GetInvolved
          </Typography>

          {/* Desktop Menu */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button color="inherit" onClick={() => navigate('/')}>Home</Button>

              {!isLoggedIn ? (
                <>
                  <Button color="inherit" onClick={() => navigate('/login')} sx={{ textTransform: 'none' }}>Inizia ora</Button>
                </>
              ) : (
                <>
                  <Button color="inherit" onClick={() => navigate('/dashboard')}>Dashboard</Button>

                  <Button
                    onClick={() => navigate('/profile')}
                    color="inherit"
                    sx={{ textTransform: 'none', display: 'flex', alignItems: 'center', ml: 2, px: 1 }}
                  >
                    <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main', fontSize: '1rem' }}>
                      {username ? username[0].toUpperCase() : <AccountCircle />}
                    </Avatar>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {username}
                    </Typography>
                  </Button>

                  <IconButton
                    onClick={() => navigate('/logout')}
                    sx={{ color: 'error.main', ml: 1 }}
                    aria-label="logout"
                  >
                    <LogoutIcon />
                  </IconButton>
                </>
              )}
            </Box>
          )}

          {/* Mobile Burger Icon */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Mobile Drawer */}
          <Drawer
            anchor="top"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { width: '100%', pt: 4, pb: 4 }
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              {isLoggedIn && (
                <Box
                  onClick={() => handleNavigate('/profile')}
                  sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                >
                  <Avatar sx={{ width: 64, height: 64, mb: 1, bgcolor: 'primary.main', fontSize: '2rem' }}>
                    {username ? username[0].toUpperCase() : <AccountCircle />}
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    {username}
                  </Typography>
                </Box>
              )}

              <List sx={{ width: '100%' }}>
                {navItems.map((item) => (
                  <ListItem key={item.label} disablePadding sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ListItemButton
                      onClick={() => handleNavigate(item.path)}
                      sx={{ textAlign: 'center', py: 2 }}
                    >
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          variant: 'h6',
                          fontWeight: 'medium',
                          color: item.color || 'text.primary'
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Drawer>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
