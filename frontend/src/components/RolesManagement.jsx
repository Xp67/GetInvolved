import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Divider,
  Chip,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

function RolesManagement({ userPermissions = [] }) {
  const [roles, setRoles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permission_ids: []
  });

  const hasPermission = (perm) => userPermissions.includes(perm);

  useEffect(() => {
    fetchRoles();
    fetchCategories();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await api.get('/api/roles/');
      setRoles(res.data);
    } catch (error) {
      console.error('Error fetching roles', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/permissions/categories/');
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories', error);
    }
  };

  const handleOpen = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description,
        permission_ids: role.permissions_details.map(p => p.id)
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
        permission_ids: []
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePermissionToggle = (permId) => {
    const current = [...formData.permission_ids];
    const index = current.indexOf(permId);
    if (index === -1) {
      current.push(permId);
    } else {
      current.splice(index, 1);
    }
    setFormData({ ...formData, permission_ids: current });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await api.put(`/api/roles/${editingRole.id}/`, formData);
      } else {
        await api.post('/api/roles/', formData);
      }
      handleClose();
      fetchRoles();
    } catch (error) {
      alert(error.response?.data?.detail || 'Errore durante il salvataggio');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo ruolo?')) {
      try {
        await api.delete(`/api/roles/${id}/`);
        fetchRoles();
      } catch (error) {
        alert(error.response?.data?.[0] || 'Errore durante l\'eliminazione');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Gestione Ruoli e Permessi
        </Typography>
        {hasPermission('roles.create') && (
          <Button variant="contained" color="primary" onClick={() => handleOpen()}>
            Crea Ruolo
          </Button>
        )}
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Descrizione</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Permessi</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Azioni</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell sx={{ fontWeight: 500 }}>{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {role.permissions_details.slice(0, 3).map((p) => (
                      <Chip key={p.id} label={p.name} size="small" variant="outlined" />
                    ))}
                    {role.permissions_details.length > 3 && (
                      <Tooltip title={role.permissions_details.slice(3).map(p => p.name).join(', ')}>
                        <Chip label={`+${role.permissions_details.length - 3}`} size="small" variant="outlined" />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  {hasPermission('roles.edit') && (
                    <IconButton
                      onClick={() => handleOpen(role)}
                      disabled={role.name === 'Super Admin'}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  {hasPermission('roles.delete') && role.is_deletable && (
                    <IconButton onClick={() => handleDelete(role.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingRole ? 'Modifica Ruolo' : 'Crea Nuovo Ruolo'}
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Nome Ruolo"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={editingRole && !editingRole.is_deletable}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Descrizione"
              name="description"
              multiline
              rows={2}
              value={formData.description}
              onChange={handleInputChange}
            />

            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              Permessi
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {categories.map((cat) => (
              <Box key={cat.id} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                  {cat.name}
                </Typography>
                <Grid container spacing={1}>
                  {cat.permissions.map((perm) => (
                    <Grid item xs={12} sm={6} md={4} key={perm.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.permission_ids.includes(perm.id)}
                            onChange={() => handlePermissionToggle(perm.id)}
                          />
                        }
                        label={perm.name}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose}>Annulla</Button>
            <Button type="submit" variant="contained">Salva</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default RolesManagement;
