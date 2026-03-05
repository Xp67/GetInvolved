import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import AppSidebar from "../components/Sidebar";
import { AppUser, hasPermission as checkPermission } from "../utils/permissionUtils";
import {
    Box,
    IconButton,
    Drawer,
    CircularProgress,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { DashboardConfig } from "./sections/config/DashboardConfig";

function Dashboard() {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [currentSection, setCurrentSection] = useState('eventi');
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Event state for events section (passed as props)
    const [events, setEvents] = useState<any[]>([]);
    const [searchParams] = useSearchParams();
    const [eventFilter, setEventFilter] = useState(searchParams.get('filter') || 'active');

    const config = DashboardConfig(user);
    const activeSection = config.find(s => s.id === currentSection);
    const ActiveComponent = activeSection?.component;

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

    const getEvents = () => {
        api
            .get("/api/event/")
            .then((res) => res.data)
            .then((data) => setEvents(data))
            .catch((error) => console.error(error));
    };

    const hasPermission = (perm: string) => checkPermission(user, perm);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

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
                <AppSidebar title="Dashboard" items={config} activeItem={currentSection} onItemChange={handleSidebarChange} />
            </Drawer>

            {/* Desktop sidebar */}
            <Box sx={{
                width: 300, minWidth: 300, flexShrink: 0, bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider',
                display: { xs: 'none', md: 'block' }, position: 'sticky', top: 0, height: 'calc(100vh - 64px)', overflowY: 'auto', zIndex: 10
            }}>
                <AppSidebar title="Dashboard" items={config} activeItem={currentSection} onItemChange={setCurrentSection} />
            </Box>

            {/* Main content */}
            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, pt: { xs: 10, sm: 3, md: 4 }, overflowY: 'auto' }}>
                <Box sx={{ maxWidth: '1200px', width: '100%' }}>
                    {ActiveComponent && (
                        <ActiveComponent
                            events={events}
                            user={user}
                            hasPermission={hasPermission}
                            getEvents={getEvents}
                            eventFilter={eventFilter}
                            setEventFilter={setEventFilter}
                            navigate={navigate}
                            userPermissions={user?.all_permissions}
                        />
                    )}
                </Box>
            </Box>
        </Box>
    );
}

export default Dashboard;

