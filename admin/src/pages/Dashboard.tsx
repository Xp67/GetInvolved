import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Event from "../components/Event";
import AppSidebar from "../components/Sidebar";
import type { SidebarItem } from "../components/Sidebar";
import RolesManagement from "../components/RolesManagement";
import UsersManagement from "../components/UsersManagement";
import AddressAutocomplete from "../components/AddressAutocomplete";
import { hasPermission as checkPerm, canAccessSection, AppUser } from "../utils/permissionUtils";
import {
    Typography,
    TextField,
    Button,
    Box,
    Grid,
    Paper,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Snackbar,
    Alert,
    Stack,
    useTheme,
    useMediaQuery,
    Drawer,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";

function Dashboard() {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [currentSection, setCurrentSection] = useState('eventi');
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Event state
    const [events, setEvents] = useState<any[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [open, setOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (currentSection === 'eventi') {
            getEvents();
        }
    }, [currentSection]);

    const fetchUser = async () => {
        try {
            const res = await api.get("/api/user/profile/");
            setUser(res.data);
        } catch (error) {
            console.error("Error fetching user profile", error);
        } finally {
            setLoading(false);
        }
    };

    const hasPermission = (perm: string) => checkPerm(user, perm);

    const handleOpen = () => {
        setTitle("");
        setDescription("");
        setLocation("");
        setEventDate("");
        setOpen(true);
    };

    const handleEditOpen = (event: any) => {
        navigate(`/dashboard/eventi/${event.id}/edit`);
    };

    const handleViewOpen = (event: any) => {
        navigate(`/dashboard/eventi/${event.id}`);
    };

    const handleClose = () => {
        setOpen(false);
        setTitle("");
        setDescription("");
        setLocation("");
        setEventDate("");
    };

    const getEvents = () => {
        api
            .get("/api/event/")
            .then((res) => res.data)
            .then((data) => setEvents(data))
            .catch((error) => alert(error));
    };

    const deleteEvent = (id: number) => {
        api
            .delete(`/api/event/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) getEvents();
                else alert("Error deleting event");
            })
            .catch((error) => alert(error));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createEvent();
    };

    const createEvent = () => {
        const eventData = {
            title,
            description,
            location,
            event_date: eventDate ? new Date(eventDate).toISOString() : null,
        };
        api
            .post("/api/event/", eventData)
            .then((res) => {
                if (res.status === 201) {
                    handleClose();
                    getEvents();
                } else alert("Error creating event");
            })
            .catch((error) => alert(error));
    };

    const renderSection = () => {
        switch (currentSection) {
            case 'eventi':
                return (
                    <>
                        <Grid container spacing={4}>
                            <Grid size={12}>
                                <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }} elevation={0}>
                                    <Typography variant="h6" gutterBottom>
                                        {hasPermission('events.view_all') ? 'Tutti gli Eventi' : 'I Tuoi Eventi'}
                                    </Typography>
                                    <Divider sx={{ mb: 3 }} />
                                    {events.length === 0 ? (
                                        <Box sx={{ py: 6, textAlign: 'center' }}>
                                            <Typography color="text.secondary" gutterBottom>Non ci sono eventi da visualizzare.</Typography>
                                            {hasPermission('events.create') && (
                                                <Button variant="outlined" sx={{ mt: 2, textTransform: 'none', borderRadius: 2 }} onClick={handleOpen}>
                                                    Crea il tuo primo evento
                                                </Button>
                                            )}
                                        </Box>
                                    ) : (
                                        <Grid container spacing={3}>
                                            {events.map((event) => (
                                                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={event.id}>
                                                    <Event
                                                        event={event}
                                                        onDelete={deleteEvent}
                                                        onEdit={handleEditOpen}
                                                        onView={handleViewOpen}
                                                        canDelete={hasPermission('events.delete_all') || (hasPermission('events.delete_own') && event.organizer === user?.id)}
                                                        canEdit={hasPermission('events.edit_all') || (hasPermission('events.edit_own') && event.organizer === user?.id)}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>
                    </>
                );
            case 'utenti':
                return <UsersManagement userPermissions={user?.all_permissions} />;
            case 'ruoli':
                return <RolesManagement userPermissions={user?.all_permissions} />;
            default:
                return <Typography variant="h4">Sezione non trovata</Typography>;
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography variant="h6">Caricamento Dashboard...</Typography>
            </Box>
        );
    }

    const getSectionTitle = () => {
        switch (currentSection) {
            case 'eventi': return "Dashboard Eventi";
            case 'utenti': return "Gestione Utenti";
            case 'ruoli': return "Gestione Ruoli e Permessi";
            default: return "";
        }
    };

    const sidebarItems: SidebarItem[] = [
        { id: 'eventi', label: 'Eventi', icon: <EventIcon />, show: canAccessSection(user, 'eventi') },
        { id: 'utenti', label: 'Utenti', icon: <PeopleIcon />, show: canAccessSection(user, 'utenti') },
        { id: 'ruoli', label: 'Ruoli e Permessi', icon: <SecurityIcon />, show: canAccessSection(user, 'ruoli') },
    ];

    const handleSidebarChange = (section: string) => {
        setCurrentSection(section);
        setDrawerOpen(false);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default', position: 'relative' }}>
            {/* Mobile burger */}
            {isMobile && (
                <IconButton
                    onClick={() => setDrawerOpen(true)}
                    sx={{ position: 'fixed', top: 76, left: 16, bgcolor: 'primary.main', color: 'primary.contrastText', boxShadow: 3, zIndex: 1000, '&:hover': { bgcolor: 'primary.dark' }, width: 40, height: 40 }}
                >
                    <MenuIcon fontSize="small" />
                </IconButton>
            )}

            {/* Mobile drawer */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 300 } }}
            >
                <AppSidebar title="Dashboard" items={sidebarItems} activeItem={currentSection} onItemChange={handleSidebarChange} />
            </Drawer>

            {/* Desktop sidebar */}
            <Box sx={{
                width: 300, minWidth: 300, flexShrink: 0, bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider',
                display: { xs: 'none', md: 'block' }, position: 'sticky', top: 0, height: 'calc(100vh - 64px)', overflowY: 'auto', zIndex: 10
            }}>
                <AppSidebar title="Dashboard" items={sidebarItems} activeItem={currentSection} onItemChange={setCurrentSection} />
            </Box>

            {/* Main content */}
            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, pt: { xs: 10, sm: 3, md: 4 }, overflowY: 'auto' }}>
                <Box sx={{ maxWidth: '1200px', width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Typography variant="h4" fontWeight="bold">
                            {getSectionTitle()}
                        </Typography>
                        {currentSection === 'eventi' && hasPermission('events.create') && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleOpen}
                                sx={{ textTransform: 'none', px: 4, borderRadius: 2, boxShadow: 2 }}
                            >
                                Crea Evento
                            </Button>
                        )}
                    </Box>
                    {renderSection()}
                </Box>

            </Box>

            {/* Dialog Creazione Evento */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ m: 0, px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">Crea Nuovo Evento</Typography>
                    <IconButton aria-label="close" onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ px: 3, py: 3 }}>
                    <Box component="form" id="create-event-form" onSubmit={handleSubmit} noValidate>
                        <Stack spacing={2.5}>
                            <TextField required fullWidth id="title" label="Titolo Evento" name="title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
                            <TextField required fullWidth id="description" label="Descrizione" name="description" multiline rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
                            <AddressAutocomplete value={location} onChange={setLocation} label="Luogo" placeholder="Cerca un luogo o indirizzo..." />
                            <TextField required fullWidth id="event_date" label="Data e Ora Evento" name="event_date" type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                        </Stack>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleClose} sx={{ textTransform: 'none', color: 'text.secondary' }}>Annulla</Button>
                    <Button type="submit" form="create-event-form" variant="contained" sx={{ textTransform: 'none', borderRadius: 2, px: 4, fontWeight: 'bold' }}>Crea Evento</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>Evento modificato con successo!</Alert>
            </Snackbar>
        </Box>
    );
}

export default Dashboard;

