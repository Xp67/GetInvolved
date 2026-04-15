import api from '../api';
import {
    Box, Drawer, IconButton, Snackbar, Alert, CircularProgress, useTheme, useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AppSidebar from '../components/Sidebar';
import { ProfileConfig } from './sections/config/ProfileConfig';
import { useProfilePage } from '@shared/hooks/useProfilePage';

const INITIAL_PROFILE = {
    username: '', email: '', first_name: '', last_name: '', phone_number: '', bio: '',
    avatar: null as string | null, affiliate_code: '', affiliated_to_username: null as string | null,
    affiliation_date: null as string | null, all_permissions: [] as string[],
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
        api.get('/api/user/profile/').then(res => {
            const d = res.data;
            setProfile({
                username: d.username || '', email: d.email || '', first_name: d.first_name || '',
                last_name: d.last_name || '', phone_number: d.phone_number || '', bio: d.bio || '',
                avatar: d.avatar || null, affiliate_code: d.affiliate_code || '',
                affiliated_to_username: d.affiliated_to_username || null, affiliation_date: d.affiliation_date || null,
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
            <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} sx={{ '& .MuiDrawer-paper': { width: 300 } }}>
                <AppSidebar title="Il Mio Profilo" items={filteredConfig} activeItem={activeSection} onItemChange={handleSidebarChange} />
            </Drawer>
            <Box sx={{
                width: 300, minWidth: 300, flexShrink: 0, bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider',
                display: { xs: 'none', md: 'block' }, position: 'sticky', top: 0, height: 'calc(100vh - 64px)', overflowY: 'auto'
            }}>
                <AppSidebar title="Il Mio Profilo" items={filteredConfig} activeItem={activeSection} onItemChange={setActiveSection} />
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 4, md: 6 }, pt: { xs: 10, sm: 4, md: 6 }, overflowY: 'auto' }}>
                <Box sx={{ maxWidth: 1100, width: '100%' }}>
                    {ActiveComponent && (
                        <ActiveComponent
                            profile={profile}
                            setProfile={setProfile}
                            setMessage={setMessage}
                            setOpenSnackbar={setOpenSnackbar}
                            isMobile={isMobile}
                            showInviteLink={true}
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
