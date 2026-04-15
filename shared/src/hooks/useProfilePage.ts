import { useEffect, useRef, useState } from "react";
import type { ProfileSection } from "../profileSections";

interface BaseProfile {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    bio: string;
    avatar: string | null;
    affiliate_code: string;
    affiliated_to_username: string | null;
    affiliation_date: string | null;
    all_permissions: string[];
    [key: string]: unknown;
}

interface SnackbarMessage {
    type: "success" | "error";
    text: string;
}

interface UseProfilePageReturn<T extends BaseProfile> {
    profile: T;
    setProfile: React.Dispatch<React.SetStateAction<T>>;
    loading: boolean;
    drawerOpen: boolean;
    setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    activeSection: string;
    setActiveSection: React.Dispatch<React.SetStateAction<string>>;
    message: SnackbarMessage;
    setMessage: React.Dispatch<React.SetStateAction<SnackbarMessage>>;
    openSnackbar: boolean;
    setOpenSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
    isHoveringAvatar: boolean;
    setIsHoveringAvatar: React.Dispatch<React.SetStateAction<boolean>>;
    saving: boolean;
    setSaving: React.Dispatch<React.SetStateAction<boolean>>;
    handleSidebarChange: (section: string) => void;
    filterDevSection: (sections: ProfileSection[]) => ProfileSection[];
}

export function useProfilePage<T extends BaseProfile>(
    initialProfile: T,
    fetchProfileFn: (setProfile: (p: T) => void, setLoading: (v: boolean) => void) => void,
    options?: {
        devSectionId?: string;
        devPermissionCodename?: string;
    }
): UseProfilePageReturn<T> {
    const [profile, setProfile] = useState<T>(initialProfile);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("personal_info");
    const [message, setMessage] = useState<SnackbarMessage>({ type: "success", text: "" });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchProfileFnRef = useRef(fetchProfileFn);
    fetchProfileFnRef.current = fetchProfileFn;

    useEffect(() => {
        fetchProfileFnRef.current(setProfile, setLoading);
        // Intentionally run once on mount even if caller passes an inline function.
    }, []);

    const handleSidebarChange = (section: string) => {
        setActiveSection(section);
        setDrawerOpen(false);
    };

    const devSectionId = options?.devSectionId ?? "dev_onboarding";
    const devPermissionCodename = options?.devPermissionCodename ?? "developer.view";

    const filterDevSection = (sections: ProfileSection[]) =>
        sections.map((s) =>
            s.id === devSectionId
                ? { ...s, show: profile.all_permissions.includes(devPermissionCodename) }
                : s
        );

    return {
        profile, setProfile,
        loading,
        drawerOpen, setDrawerOpen,
        activeSection, setActiveSection,
        message, setMessage,
        openSnackbar, setOpenSnackbar,
        isHoveringAvatar, setIsHoveringAvatar,
        saving, setSaving,
        handleSidebarChange,
        filterDevSection,
    };
}
