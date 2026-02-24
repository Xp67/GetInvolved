import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tooltip
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';


function Event({ event, onDelete, onEdit, onView, canDelete = true, canEdit = true }) {
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

    const formattedDate = event.event_date
        ? new Date(event.event_date).toLocaleDateString("it-IT", {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : "Data non impostata";

    const formattedTime = event.event_date
        ? new Date(event.event_date).toLocaleTimeString("it-IT", {
            hour: '2-digit',
            minute: '2-digit'
          })
        : "";

    const handleDeleteClick = () => {
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = () => {
        onDelete(event.id);
        setConfirmDeleteOpen(false);
    };

    const handleCancelDelete = () => {
        setConfirmDeleteOpen(false);
    };

    return (
        <Card sx={{ mb: 2, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 1, '&:hover': { boxShadow: 3 }, borderRadius: 2 }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" component="div" fontWeight="bold" color="primary" sx={{ lineHeight: 1.2 }}>
                        {event.title}
                    </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{
                    mb: 2,
                    flexGrow: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {event.description}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 'auto', gap: 2 }}>
                    <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1} color="text.secondary">
                            <LocationOnIcon fontSize="small" color="action" />
                            <Typography variant="caption" fontWeight="medium">{event.location}</Typography>
                        </Stack>
                        <Stack direction="row" flexWrap="wrap" gap={1.5}>
                            <Stack direction="row" alignItems="center" spacing={1} color="text.secondary">
                                <CalendarTodayIcon fontSize="small" color="action" />
                                <Typography variant="caption" fontWeight="medium">{formattedDate}</Typography>
                            </Stack>
                            {formattedTime && (
                                <Stack direction="row" alignItems="center" spacing={1} color="text.secondary">
                                    <AccessTimeIcon fontSize="small" color="action" />
                                    <Typography variant="caption" fontWeight="medium">{formattedTime}</Typography>
                                </Stack>
                            )}
                        </Stack>
                    </Stack>

                    <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Visualizza">
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={() => onView(event)}
                                sx={{ border: '1px solid', borderColor: 'primary.light' }}
                            >
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        {canEdit && (
                            <Tooltip title="Modifica">
                                <IconButton
                                    size="small"
                                    onClick={() => onEdit(event)}
                                    sx={{
                                        color: '#ffb74d',
                                        border: '1px solid',
                                        borderColor: '#ffe0b2',
                                        '&:hover': { bgcolor: '#fff3e0' }
                                    }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}

                        {canDelete && (
                            <Tooltip title="Elimina">
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={handleDeleteClick}
                                    sx={{ border: '1px solid', borderColor: 'error.light' }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                </Box>
            </CardContent>

            {/* Dialog di conferma eliminazione */}
            <Dialog
                open={confirmDeleteOpen}
                onClose={handleCancelDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Conferma eliminazione"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Sei sicuro di voler eliminare l'evento "{event.title}"? Questa azione non può essere annullata.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCancelDelete} variant="outlined" sx={{ textTransform: 'none' }}>
                        Annulla
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus sx={{ textTransform: 'none' }}>
                        Elimina
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}

export default Event;
