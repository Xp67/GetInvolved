import React, { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { eventEditStyles as styles } from './EventEdit.styles';
import {
    Typography, IconButton, Snackbar, Alert, CircularProgress,
    Box, Paper, useTheme, useMediaQuery, Drawer
} from "@mui/material";
import AppSidebar from "../components/Sidebar";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { EventEditConfig } from "./sections/config/EventEditConfig";
import TicketCategoryEdit from "./sections/TicketCategoryEdit";
import { useEventEditor } from "../hooks/useEventEditor";

function EventEdit() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const filterParam = searchParams.get('filter') || 'active';

    const [currentSection, setCurrentSection] = useState('general');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);

    const editor = useEventEditor(id);
    const config = EventEditConfig();
    const activeSection = config.find(s => s.id === currentSection);
    const ActiveComponent = activeSection?.component;

    const handleSidebarChange = (section: string) => {
        setCurrentSection(section);
        setDrawerOpen(false);
    };

    const handleEditCategory = (cat: any = null) => {
        setEditingCategory(cat);
        setCurrentSection('ticket-category-edit');
    };

    if (editor.loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Box sx={styles.root}>
            {isMobile && (
                <IconButton onClick={() => setDrawerOpen(true)} sx={styles.mobileMenuButton}>
                    <MenuIcon fontSize="small" />
                </IconButton>
            )}

            <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} sx={styles.mobileDrawer}>
                <AppSidebar title="Gestione Evento" items={config} activeItem={currentSection} onItemChange={handleSidebarChange} />
            </Drawer>

            <Box sx={styles.desktopSidebar}>
                <AppSidebar title="Gestione Evento" items={config} activeItem={currentSection} onItemChange={setCurrentSection} />
            </Box>

            <Box component="main" sx={styles.mainContent}>
                <Box sx={styles.contentWrapper}>
                    <Box sx={styles.headerRow}>
                        <IconButton onClick={() => editor.navigate(`/dashboard?filter=${filterParam}`)} sx={styles.backButton}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h4" fontWeight="bold">Gestione Evento</Typography>
                    </Box>

                    <Paper sx={styles.sectionPaper} elevation={0}>
                        {currentSection === 'ticket-category-edit' ? (
                            <TicketCategoryEdit
                                event={editor.event}
                                category={editingCategory}
                                onBack={() => setCurrentSection('tickets')}
                                onSaveSuccess={() => {
                                    editor.fetchEvent();
                                    setCurrentSection('tickets');
                                    editor.setSnackbar({ open: true, message: 'Categoria salvata con successo!', severity: 'success' });
                                }}
                            />
                        ) : ActiveComponent ? (
                            <ActiveComponent
                                event={editor.event}
                                user={editor.user}
                                title={editor.title}
                                setTitle={editor.setTitle}
                                description={editor.description}
                                setDescription={editor.setDescription}
                                location={editor.location}
                                setLocation={editor.setLocation}
                                latitude={editor.latitude}
                                longitude={editor.longitude}
                                countryCode={editor.countryCode}
                                handleLocationSelect={editor.handleLocationSelect}
                                eventDate={editor.eventDate}
                                setEventDate={editor.setEventDate}
                                startTime={editor.startTime}
                                setStartTime={editor.setStartTime}
                                endTime={editor.endTime}
                                setEndTime={editor.setEndTime}
                                backgroundColor={editor.backgroundColor}
                                setBackgroundColor={editor.setBackgroundColor}
                                ticketClauses={editor.ticketClauses}
                                setTicketClauses={editor.setTicketClauses}
                                posterImage={editor.posterImage}
                                setPosterImage={editor.setPosterImage}
                                heroImage={editor.heroImage}
                                setHeroImage={editor.setHeroImage}
                                organizerLogo={editor.organizerLogo}
                                setOrganizerLogo={editor.setOrganizerLogo}
                                handleEventSubmit={editor.handleEventSubmit}
                                saving={editor.saving}
                                handlePublish={editor.handlePublish}
                                handleArchive={editor.handleArchive}
                                handleForceStatus={editor.handleForceStatus}
                                categories={editor.categories}
                                handleEditCategory={handleEditCategory}
                                handleDeleteCategory={editor.handleDeleteCategory}
                                attendees={editor.attendees}
                                scannerOpen={editor.scannerOpen}
                                startScanner={editor.startScanner}
                                stopScanner={editor.stopScanner}
                                validateTicket={editor.validateTicket}
                            />
                        ) : null}
                    </Paper>
                </Box>
            </Box>

            <Snackbar
                open={editor.snackbar.open}
                autoHideDuration={4000}
                onClose={() => editor.setSnackbar({ ...editor.snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => editor.setSnackbar({ ...editor.snackbar, open: false })}
                    severity={editor.snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {editor.snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default EventEdit;
