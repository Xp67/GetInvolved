import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Grid,
  Divider,
  InputAdornment,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';

function UsersManagement({ userPermissions = [] }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  const hasPermission = (perm) => userPermissions.includes(perm);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [search]);

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/api/users/?search=${search}`);
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get('/api/roles/');
      setRoles(res.data);
    } catch (error) {
      console.error('Error fetching roles', error);
    }
  };

  const handleOpen = (user) => {
    setSelectedUser(user);
    setSelectedRoleIds(user.roles_details.map(r => r.id));
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleRoleToggle = (roleId) => {
    const current = [...selectedRoleIds];
    const index = current.indexOf(roleId);
    if (index === -1) {
      current.push(roleId);
    } else {
      current.splice(index, 1);
    }
    setSelectedRoleIds(current);
  };

  const handleSaveRoles = async () => {
    try {
      await api.patch(`/api/users/${selectedUser.id}/`, {
        role_ids: selectedRoleIds
      });
      handleClose();
      fetchUsers();
    } catch (error) {
      alert('Errore durante l\'assegnazione dei ruoli');
    }
  };

  const usersWithRoles = users.filter(u => u.roles_details.length > 0);
  const allUsers = users;

  const renderTable = (userList, title) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        {title} ({userList.length})
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Ruoli</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Azioni</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Nessun utente trovato
                </TableCell>
              </TableRow>
            ) : (
              userList.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {user.roles_details.map((role) => (
                        <Chip key={role.id} label={role.name} size="small" color="primary" variant="outlined" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {hasPermission('users.assign_roles') && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleOpen(user)}
                        disabled={user.email === 'Marco.def4lt@gmail.com'}
                      >
                        Gestisci Ruoli
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Gestione Utenti
        </Typography>
        <TextField
          placeholder="Cerca utenti..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {renderTable(usersWithRoles, 'Utenti con Ruoli')}

      <Divider sx={{ my: 4 }} />

      {renderTable(allUsers, 'Tutti gli Utenti')}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon color="primary" />
          Gestisci Ruoli per {selectedUser?.username}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Seleziona i ruoli da assegnare all'utente {selectedUser?.email}.
          </Typography>
          <Grid container spacing={1}>
            {roles.filter(r => r.name !== 'Super Admin').map((role) => (
              <Grid item xs={12} key={role.id}>
                <Paper variant="outlined" sx={{ p: 1, '&:hover': { bgcolor: 'grey.50' } }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedRoleIds.includes(role.id)}
                        onChange={() => handleRoleToggle(role.id)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">{role.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{role.description}</Typography>
                      </Box>
                    }
                    sx={{ width: '100%', m: 0 }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose}>Annulla</Button>
          <Button onClick={handleSaveRoles} variant="contained" color="primary">
            Salva Modifiche
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UsersManagement;
