import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Stack,
  Divider
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

function Event({ event, onDelete, onEdit, canDelete = true, canEdit = true }) {
    const formattedDate = event.created_at
        ? new Date(event.created_at).toLocaleDateString("it-IT", {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })
        : "Data non disponibile";

    return (
        <Card sx={{ mb: 2, boxShadow: 1, '&:hover': { boxShadow: 3 } }}>
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography variant="h6" component="div" fontWeight="bold" color="primary">
                            {event.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                            {event.description}
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        {canEdit && (
                            <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() => onEdit()}
                            >
                                Modifica
                            </Button>
                        )}
                        {canDelete && (
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<DeleteIcon />}
                                onClick={() => onDelete(event.id)}
                            >
                                Elimina
                            </Button>
                        )}
                    </Stack>
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Stack direction="row" spacing={3} color="text.secondary">
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <LocationOnIcon fontSize="small" />
                        <Typography variant="caption">{event.location}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <CalendarTodayIcon fontSize="small" />
                        <Typography variant="caption">{formattedDate}</Typography>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

export default Event;
