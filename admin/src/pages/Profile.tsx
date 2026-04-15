import api from "../api";
import AppSidebar from "../components/Sidebar";
import { Box, Drawer, Snackbar, Alert, CircularProgress, useTheme, useMediaQuery, IconButton } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { ProfileConfig } from "./sections/config/ProfileConfig";
import { useProfilePage } from "@shared/hooks/useProfilePage";

const INITIAL_PROFILE = {
    username: "", email: "", first_name: "", last_name: "", phone_number: "", bio: "",
    avatar: null as string | null, affiliate_code: "", affiliated_to_username: null as string | null,
    affiliation_date: null as string | null, organizer_profile: null as any,
    all_permissions: [] as string[],
};

function Profile() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const {
        profile, setProfile, loading,
        drawerOpen, setDrawerOpen,
        activeSection, setActiveSection,
        message, setMessage,
        openSnackbar, setOpenSnackbar,
        handleSidebarChange,
        filterDevSection,
    } = useProfilePage(INITIAL_PROFILE, (setProfile, setLoading) => {
        api.get("/api/user/profile/").then((res) => {
            const d = res.data;
            setProfile({
                username: d.username || "", email: d.email || "", first_name: d.first_name || "",
                last_name: d.last_name || "", phone_number: d.phone_number || "", bio: d.bio || "",
                avatar: d.avatar || null, affiliate_code: d.affiliate_code || "",
                affiliated_to_username: d.affiliated_to_username || null, affiliation_date: d.affiliation_date || null,
                organizer_profile: d.organizer_profile || null,
                all_permissions: d.all_permissions || [],
            });
            setLoading(false);
        }).catch(() => setLoading(false));
    });

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <CircularProgress />
        </Box>
    );

    const filteredConfig = filterDevSection(ProfileConfig);
    const ActiveComponent = filteredConfig.find(s => s.id === activeSection)?.component;

    return (
        <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default', position: 'relative' }}>
            {isMobile && (
                <IconButton onClick={() => setDrawerOpen(true)}
                    sx={{ position: 'fixed', top: 76, left: 16, bgcolor: 'primary.main', color: 'primary.contrastText', boxShadow: 3, zIndex: 1000, '&:hover': { bgcolor: 'primary.dark' }, width: 40, height: 40 }}>
                    <MenuIcon fontSize="small" />
                </IconButton>
            )}
            <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}
                sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 300 } }}>
                <AppSidebar title="Impostazioni" items={filteredConfig} activeItem={activeSection} onItemChange={handleSidebarChange} />
            </Drawer>
            <Box sx={{ width: 300, minWidth: 300, flexShrink: 0, bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider', display: { xs: 'none', md: 'block' }, position: 'sticky', top: 0, height: 'calc(100vh - 64px)', overflowY: 'auto', zIndex: 10 }}>
                <AppSidebar title="Impostazioni" items={filteredConfig} activeItem={activeSection} onItemChange={setActiveSection} />
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 8 }, pt: { xs: 10, sm: 3, md: 8 }, overflowY: 'auto' }}>
                <Box sx={{ maxWidth: '1200px', width: '100%' }}>
                    {ActiveComponent && (
                        <ActiveComponent
                            profile={profile}
                            setProfile={setProfile}
                            setMessage={setMessage}
                            setOpenSnackbar={setOpenSnackbar}
                            isMobile={isMobile}
                        />
                    )}
                </Box>
            </Box>
            <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={() => setOpenSnackbar(false)} severity={message.type} variant="filled" sx={{ width: '100%' }}>{message.text}</Alert>
            </Snackbar>
        </Box>
    );
}

export default Profile;
