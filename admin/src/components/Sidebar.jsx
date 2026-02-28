import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import { canAccessSection } from '../utils/permissionUtils';

function Sidebar({ currentSection, onSectionChange, user }) {
  const menuItems = [
    {
      id: 'eventi',
      label: 'Eventi',
      icon: <EventIcon />,
      show: canAccessSection(user, 'eventi')
    },
    {
      id: 'utenti',
      label: 'Utenti',
      icon: <PeopleIcon />,
      show: canAccessSection(user, 'utenti')
    },
    {
      id: 'ruoli',
      label: 'Ruoli e permessi',
      icon: <SecurityIcon />,
      show: canAccessSection(user, 'ruoli')
    },
  ];

  return (
    <Paper sx={{ width: '100%', maxWidth: 280, height: 'calc(100vh - 100px)', position: 'sticky', top: 20, borderRadius: 2 }} elevation={0} variant="outlined">
      <Box sx={{ p: 1 }}>
        <List>
          {menuItems.filter(item => item.show).map((item) => (
            <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={currentSection === item.id}
                onClick={() => onSectionChange(item.id)}
                sx={{
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                    '&:hover': {
                      bgcolor: 'primary.light',
                    }
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: currentSection === item.id ? 'bold' : 'medium' }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
}

export default Sidebar;
