import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import type { LocationData } from "../components/AddressAutocomplete";
import { eventEditStyles as styles } from './EventEdit.styles';
import {
    Typography, IconButton, Snackbar, Alert, CircularProgress,
    Box, Paper, useTheme, useMediaQuery, Drawer
} from "@mui/material";
import AppSidebar from "../components/Sidebar";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Html5QrcodeScanner } from 'html5-qrcode';
import { EventEditConfig } from "./sections/config/EventEditConfig";
import TicketCategoryEdit from "./sections/TicketCategoryEdit";

function EventEdit() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const filterParam = searchParams.get('filter') || 'active';
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentSection, setCurrentSection] = useState('general');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    const [event, setEvent] = useState<any>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [countryCode, setCountryCode] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
    const [ticketClauses, setTicketClauses] = useState("");
    const [posterImage, setPosterImage] = useState<File | null>(null);
    const [heroImage, setHeroImage] = useState<File | null>(null);
    const [organizerLogo, setOrganizerLogo] = useState<File | null>(null);

    const [categories, setCategories] = useState<any[]>([]);
    const [editingCategory, setEditingCategory] = useState<any>(null);

    const [attendees, setAttendees] = useState<any[]>([]);
    const [scannerOpen, setScannerOpen] = useState(false);
    const scannerRef = useRef<any>(null);

    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

    const config = EventEditConfig();
    const activeSection = config.find(s => s.id === currentSection);
    const ActiveComponent = activeSection?.component;

    useEffect(() => { fetchUser(); fetchEvent(); fetchAttendees(); }, [id]);

    const fetchUser = async () => {
        try { const res = await api.get("/api/user/profile/"); setUser(res.data); } catch (error) { console.error("Error fetching user profile", error); }
    };

    const fetchEvent = async () => {
        try {
            const res = await api.get(`/api/event/${id}/`);
            const eventData = res.data;
            setEvent(eventData);
            setTitle(eventData.title);
            setDescription(eventData.description);
            setLocation(eventData.location);
            setLatitude(eventData.latitude);
            setLongitude(eventData.longitude);
            setCountryCode(eventData.country_code || '');
            setEventDate(eventData.date || '');
            setStartTime(eventData.start_time ? eventData.start_time.substring(0, 5) : '');
            setEndTime(eventData.end_time ? eventData.end_time.substring(0, 5) : '');
            setBackgroundColor(eventData.background_color || '#FFFFFF');
            setTicketClauses(eventData.ticket_clauses || '');
            setCategories(eventData.ticket_categories || []);
        } catch (error) {
            setSnackbar({ open: true, message: "Errore nel caricamento dell'evento", severity: "error" });
        } finally { setLoading(false); }
    };

    const fetchAttendees = async () => {
        try { const res = await api.get(`/api/tickets/event/${id}/`); setAttendees(res.data); } catch (err) { console.error("Error fetching attendees", err); }
    };

    const handleLocationSelect = (data: LocationData) => {
        setLocation(data.address);
        setLatitude(data.latitude);
        setLongitude(data.longitude);
        setCountryCode(data.country_code);
    };

    const handleEventSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('location', location);
            if (latitude !== null) formData.append('latitude', String(latitude));
            if (longitude !== null) formData.append('longitude', String(longitude));
            if (countryCode) formData.append('country_code', countryCode);
            if (eventDate) formData.append('date', eventDate);
            if (startTime) formData.append('start_time', startTime);
            if (endTime) formData.append('end_time', endTime);
            formData.append('background_color', backgroundColor);
            formData.append('ticket_clauses', ticketClauses);
            if (posterImage) formData.append('poster_image', posterImage);
            if (heroImage) formData.append('hero_image', heroImage);
            if (organizerLogo) formData.append('organizer_logo', organizerLogo);

            await api.patch(`/api/event/update/${id}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSnackbar({ open: true, message: "Evento aggiornato con successo!", severity: "success" });
            fetchEvent();
        } catch (error: any) {
            const errData = error.response?.data;
            let msg = "Errore durante l'aggiornamento";
            if (errData && typeof errData === 'object') {
                const messages = Object.entries(errData).map(([k, v]) => `${k}: ${v}`).join('\n');
                if (messages) msg = messages;
            }
            setSnackbar({ open: true, message: msg, severity: "error" });
        } finally { setSaving(false); }
    };

    const handlePublish = async () => {
        try {
            await api.patch(`/api/event/update/${id}/`, { status: 'PUBLISHED' });
            setSnackbar({ open: true, message: "Evento pubblicato!", severity: "success" });
            fetchEvent();
        } catch (error: any) {
            const errData = error.response?.data;
            let msg = "Impossibile pubblicare";
            if (errData && typeof errData === 'object') {
                const messages = Object.entries(errData).map(([k, v]) => `${k}: ${v}`).join('\n');
                if (messages) msg = messages;
            }
            setSnackbar({ open: true, message: msg, severity: "error" });
        }
    };

    const handleArchive = async () => {
        if (!window.confirm("Sei sicuro di voler archiviare questo evento?")) return;
        try {
            await api.patch(`/api/event/update/${id}/`, { status: 'ARCHIVED' });
            setSnackbar({ open: true, message: "Evento archiviato!", severity: "success" });
            fetchEvent();
        } catch (error: any) {
            setSnackbar({ open: true, message: error.response?.data?.detail || "Errore nell'archiviazione", severity: "error" });
        }
    };

    const handleForceStatus = async (newStatus: string) => {
        try {
            await api.patch(`/api/event/${id}/force-status/`, { status: newStatus });
            setSnackbar({ open: true, message: `Stato cambiato a ${newStatus}`, severity: "success" });
            fetchEvent();
        } catch (error: any) {
            setSnackbar({ open: true, message: error.response?.data?.error || 'Errore nel cambio stato', severity: "error" });
        }
    };

    const handleEditCategory = (cat: any = null) => {
        setEditingCategory(cat);
        setCurrentSection('ticket-category-edit');
    };

    const handleDeleteCategory = async (catId: number) => {
        if (!window.confirm("Sei sicuro di voler eliminare questa categoria?")) return;
        try {
            await api.delete(`/api/tickets/categories/delete/${catId}/`);
            setSnackbar({ open: true, message: 'Categoria eliminata!', severity: 'success' });
            fetchEvent();
        } catch (err: any) {
            setSnackbar({ open: true, message: err.response?.data?.[0] || "Errore durante l'eliminazione", severity: 'error' });
        }
    };

    const validateTicket = async (codeOrId: string | number, isCode = true) => {
        try {
            const payload = isCode ? { ticket_code: codeOrId } : { ticket_id: codeOrId };
            const res = await api.post('/api/tickets/validate/', payload);
            setSnackbar({ open: true, message: res.data.message + ' per ' + res.data.owner_name, severity: 'success' });
            fetchAttendees();
            if (scannerOpen) stopScanner();
        } catch (err: any) {
            setSnackbar({ open: true, message: err.response?.data?.error || 'Errore nella validazione', severity: 'error' });
        }
    };

    const startScanner = () => {
        setScannerOpen(true);
        setTimeout(() => {
            const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
            scanner.render((decodedText: string) => { scanner.clear(); validateTicket(decodedText, true); }, () => { });
            scannerRef.current = scanner;
        }, 100);
    };

    const stopScanner = () => {
        if (scannerRef.current) scannerRef.current.clear();
        setScannerOpen(false);
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    const handleSidebarChange = (section: string) => {
        setCurrentSection(section);
        setDrawerOpen(false);
    };

    return (
        <Box sx={styles.root}>
            {/* Mobile burger */}
            {isMobile && (
                <IconButton
                    onClick={() => setDrawerOpen(true)}
                    sx={styles.mobileMenuButton}
                >
                    <MenuIcon fontSize="small" />
                </IconButton>
            )}

            {/* Mobile drawer */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={styles.mobileDrawer}
            >
                <AppSidebar title="Gestione Evento" items={config} activeItem={currentSection} onItemChange={handleSidebarChange} />
            </Drawer>

            {/* Desktop sidebar */}
            <Box sx={styles.desktopSidebar}>
                <AppSidebar title="Gestione Evento" items={config} activeItem={currentSection} onItemChange={setCurrentSection} />
            </Box>

            {/* Main content */}
            <Box component="main" sx={styles.mainContent}>
                <Box sx={styles.contentWrapper}>
                    <Box sx={styles.headerRow}>
                        <IconButton onClick={() => navigate(`/dashboard?filter=${filterParam}`)} sx={styles.backButton}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h4" fontWeight="bold">Gestione Evento</Typography>
                    </Box>

                    <Paper sx={styles.sectionPaper} elevation={0}>
                        {currentSection === 'ticket-category-edit' ? (
                            <TicketCategoryEdit
                                event={event}
                                category={editingCategory}
                                onBack={() => setCurrentSection('tickets')}
                                onSaveSuccess={() => {
                                    fetchEvent();
                                    setCurrentSection('tickets');
                                    setSnackbar({ open: true, message: 'Categoria salvata con successo!', severity: 'success' });
                                }}
                            />
                        ) : ActiveComponent ? (
                            <ActiveComponent
                                event={event}
                                user={user}
                                title={title}
                                setTitle={setTitle}
                                description={description}
                                setDescription={setDescription}
                                location={location}
                                setLocation={setLocation}
                                latitude={latitude}
                                longitude={longitude}
                                countryCode={countryCode}
                                handleLocationSelect={handleLocationSelect}
                                eventDate={eventDate}
                                setEventDate={setEventDate}
                                startTime={startTime}
                                setStartTime={setStartTime}
                                endTime={endTime}
                                setEndTime={setEndTime}
                                backgroundColor={backgroundColor}
                                setBackgroundColor={setBackgroundColor}
                                ticketClauses={ticketClauses}
                                setTicketClauses={setTicketClauses}
                                posterImage={posterImage}
                                setPosterImage={setPosterImage}
                                heroImage={heroImage}
                                setHeroImage={setHeroImage}
                                organizerLogo={organizerLogo}
                                setOrganizerLogo={setOrganizerLogo}
                                handleEventSubmit={handleEventSubmit}
                                saving={saving}
                                handlePublish={handlePublish}
                                handleArchive={handleArchive}
                                handleForceStatus={handleForceStatus}
                                categories={categories}
                                handleEditCategory={handleEditCategory}
                                handleDeleteCategory={handleDeleteCategory}
                                attendees={attendees}
                                scannerOpen={scannerOpen}
                                startScanner={startScanner}
                                stopScanner={stopScanner}
                                validateTicket={validateTicket}
                            />
                        ) : null}
                    </Paper>
                </Box>
            </Box>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity as any} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}

export default EventEdit;
