import { useState, useEffect } from "react";
import api from "../api";
import AppSidebar from "../components/Sidebar";
import { Box, Drawer, Snackbar, Alert, CircularProgress, useTheme, useMediaQuery, IconButton } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { ProfileConfig } from "./sections/config/ProfileConfig";

function Profile() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [profile, setProfile] = useState({
        username: "", email: "", first_name: "", last_name: "", phone_number: "", bio: "",
        avatar: null as string | null, affiliate_code: "", affiliated_to_username: null as string | null, affiliation_date: null as string | null,
        organizer_profile: null as any,
        all_permissions: [] as string[],
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: "success" as "success" | "error", text: "" });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [activeSection, setActiveSection] = useState("personal_info");
    const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
    const [saving, setSaving] = useState(false);

    // Affiliates state
    const [affiliates, setAffiliates] = useState<any[]>([]);
    const [affiliatesLoading, setAffiliatesLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => { getProfile(); }, []);
    useEffect(() => { if (activeSection === "affiliated_users") getAffiliates(); }, [activeSection, page, searchQuery]);

    const getProfile = () => {
        api.get("/api/user/profile/").then((res) => {
            const data = res.data;
            setProfile({
                username: data.username || "", email: data.email || "", first_name: data.first_name || "",
                last_name: data.last_name || "", phone_number: data.phone_number || "", bio: data.bio || "",
                avatar: data.avatar || null, affiliate_code: data.affiliate_code || "",
                affiliated_to_username: data.affiliated_to_username || null, affiliation_date: data.affiliation_date || null,
                organizer_profile: data.organizer_profile || null,
                all_permissions: data.all_permissions || [],
            });
            setLoading(false);
        }).catch((error) => { console.error(error); setLoading(false); });
    };

    const getAffiliates = () => {
        setAffiliatesLoading(true);
        api.get(`/api/user/affiliates/?page=${page}&search=${searchQuery}`).then((res) => {
            if (res.data.results) { setAffiliates(res.data.results); setTotalPages(Math.ceil(res.data.count / 20)); }
            else { setAffiliates(res.data); setTotalPages(1); }
        }).catch((error) => console.error(error)).finally(() => setAffiliatesLoading(false));
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><CircularProgress /></Box>;

    const handleSidebarChange = (section: string) => {
        setActiveSection(section);
        setDrawerOpen(false);
    };

    const filteredConfig = ProfileConfig.map(s => {
        if (s.id === 'dev_onboarding') {
            return { ...s, show: profile.all_permissions.includes('developer.view') };
        }
        return s;
    });

    const ActiveSectionData = filteredConfig.find(s => s.id === activeSection);
    const ActiveComponent = ActiveSectionData?.component;

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

            <Box sx={{
                width: 300, minWidth: 300, flexShrink: 0, bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider',
                display: { xs: 'none', md: 'block' }, position: 'sticky', top: 0, height: 'calc(100vh - 64px)', overflowY: 'auto', zIndex: 10
            }}>
                <AppSidebar title="Impostazioni" items={filteredConfig} activeItem={activeSection} onItemChange={setActiveSection} />
            </Box>

            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 8 }, pt: { xs: 10, sm: 3, md: 8 }, overflowY: 'auto' }}>
                <Box sx={{ maxWidth: '1200px', width: '100%' }}>
                    {ActiveComponent && (
                        <ActiveComponent
                            profile={profile} setProfile={setProfile}
                            setMessage={setMessage} setOpenSnackbar={setOpenSnackbar}
                            isMobile={isMobile}
                            isHoveringAvatar={isHoveringAvatar} setIsHoveringAvatar={setIsHoveringAvatar}
                            saving={saving} setSaving={setSaving}
                            affiliates={affiliates} affiliatesLoading={affiliatesLoading}
                            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                            page={page} setPage={setPage} totalPages={totalPages}
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
