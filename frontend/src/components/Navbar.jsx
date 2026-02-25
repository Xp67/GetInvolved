import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Container,
  Avatar
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { ACCESS_TOKEN } from '../constants';
import api from '../api';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

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
      // If unauthorized or token is lost, we should clear the state
      localStorage.clear();
      setIsLoggedIn(false);
      setUsername("");
    }
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

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              color="inherit"
              onClick={() => navigate('/')}
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              Home
            </Button>

            {!isLoggedIn ? (
              <>
                <Button
                  color="inherit"
                  onClick={() => navigate('/login')}
                  sx={{ textTransform: 'none', fontWeight: 'bold' }}
                >
                  ACCEDI
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  onClick={() => navigate('/dashboard')}
                  sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}
                >
                  Dashboard
                </Button>

                <Button
                  onClick={() => navigate('/profile')}
                  color="inherit"
                  sx={{
                    textTransform: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    ml: { xs: 1, sm: 2 },
                    px: 1
                  }}
                >
                  <Avatar
                    sx={{
                      width: { xs: 24, sm: 32 },
                      height: { xs: 24, sm: 32 },
                      mr: { xs: 0.5, sm: 1 },
                      bgcolor: 'primary.main',
                      fontSize: { xs: '0.8rem', sm: '1rem' }
                    }}
                  >
                    {username ? username[0].toUpperCase() : <AccountCircle />}
                  </Avatar>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 500,
                      display: { xs: 'none', md: 'block' }
                    }}
                  >
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
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
