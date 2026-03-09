import React from "react";
import {
    Typography, Button, Box, Grid, Card, CardContent, Stack, IconButton
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { eventEditStyles as styles } from '../EventEdit.styles';

interface TicketingProps {
    categories: any[];
    handleEditCategory: (cat?: any) => void;
    handleDeleteCategory: (catId: number) => void;
}

export default function Ticketing({
    categories, handleEditCategory, handleDeleteCategory
}: TicketingProps) {
    return (
        <Box>
            <Box sx={styles.ticketsHeader}>
                <Typography variant="h5" fontWeight="bold">Gestione Biglietti</Typography>
                <Button variant="contained" color="warning" startIcon={<AddIcon />} onClick={() => handleEditCategory()} sx={styles.actionButton}>
                    Nuova Categoria
                </Button>
            </Box>
            <Grid container spacing={2}>
                {categories.map((cat: any) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cat.id}>
                        <Card variant="outlined" sx={styles.categoryCard}>
                            <CardContent>
                                <Box sx={styles.categoryCardContent}>
                                    <Box>
                                        <Typography variant="h6">{cat.name}</Typography>
                                        <Typography variant="h5" sx={styles.categoryPrice}>
                                            {parseFloat(cat.price) === 0 ? 'GRATIS' : `${parseFloat(cat.price).toFixed(2)}€`}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">Disponibilità: {cat.remaining_quantity} / {cat.total_quantity}</Typography>
                                    </Box>
                                    <Stack direction="row" spacing={1}>
                                        <IconButton size="small" onClick={() => handleEditCategory(cat)} color="primary"><EditIcon /></IconButton>
                                        <IconButton size="small" onClick={() => handleDeleteCategory(cat.id)} color="error"><DeleteIcon /></IconButton>
                                    </Stack>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                {categories.length === 0 && <Typography sx={{ mt: 2, ml: 2 }} color="text.secondary">Nessuna categoria creata.</Typography>}
            </Grid>
        </Box>
    );
}
