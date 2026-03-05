import type { SxProps, Theme } from '@mui/material';

export const eventEditStyles: Record<string, SxProps<Theme>> = {
    /* ── Layout shell ──────────────────────────────────────── */
    root: {
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '300px 1fr' },
        minHeight: 'calc(100vh - 64px)',
        bgcolor: 'background.default',
        position: 'relative',
    },
    mobileMenuButton: {
        position: 'fixed',
        top: 76,
        left: 16,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        boxShadow: 3,
        zIndex: 1000,
        '&:hover': { bgcolor: 'primary.dark' },
        width: 40,
        height: 40,
    },
    mobileDrawer: {
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': { width: 300 },
    },
    desktopSidebar: {
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: { xs: 'none', md: 'block' },
        position: 'sticky',
        top: 0,
        height: 'calc(100vh - 64px)',
        overflowY: 'auto',
        zIndex: 10,
    },
    mainContent: {
        p: { xs: 2, sm: 3, md: 'clamp(1.5rem, 3vw, 2.5rem)' },
        pt: { xs: 10, sm: 3, md: 'clamp(1.5rem, 3vw, 2.5rem)' },
        overflowY: 'auto',
        minWidth: 0,
    },
    contentWrapper: {
        maxWidth: 1200,
        width: '100%',
    },

    /* ── Header ────────────────────────────────────────────── */
    headerRow: {
        mb: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
    },
    backButton: {
        mr: 2,
        bgcolor: 'background.paper',
        boxShadow: 1,
        border: '1px solid',
        borderColor: 'divider',
    },
    statusChip: {
        ml: 2,
        fontWeight: 'bold',
    },

    /* ── Content Paper ─────────────────────────────────────── */
    sectionPaper: {
        p: { xs: 2, sm: 4 },
        borderRadius: 3,
        minHeight: 400,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
    },

    /* ── General Info form ─────────────────────────────────── */
    formContainer: {
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
    },
    sectionTitle: {
        mb: 3,
        fontWeight: 'bold',
    },
    actionBar: {
        mt: 4,
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    actionButton: {
        textTransform: 'none',
        borderRadius: 2,
    },
    saveButton: {
        px: 4,
        textTransform: 'none',
        borderRadius: 2,
    },
    forceStatusControl: {
        minWidth: 200,
    },

    /* ── Tickets section ───────────────────────────────────── */
    ticketsHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
    },
    categoryCard: {
        borderRadius: 2,
    },
    categoryCardContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    categoryPrice: {
        color: 'primary.main',
        fontWeight: 'bold',
    },

    /* ── Check-in section ──────────────────────────────────── */
    scannerButton: {
        py: 2,
        mb: 3,
        textTransform: 'none',
        fontSize: '1.1rem',
        borderRadius: 2,
    },
    scannerPaper: {
        p: 2,
        textAlign: 'center',
        borderRadius: 2,
    },
    attendeesList: {
        maxHeight: 500,
        overflow: 'auto',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
    },
    validateButton: {
        textTransform: 'none',
        borderRadius: 2,
    },

    /* ── Dialogs ───────────────────────────────────────────── */
    dialogActions: {
        p: 2,
    },
    cancelButton: {
        textTransform: 'none',
    },
    submitButton: {
        textTransform: 'none',
    },
};
