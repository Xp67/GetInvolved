import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import type { LocationData } from "../components/AddressAutocomplete";
import { Html5QrcodeScanner } from "html5-qrcode";

interface SnackbarState {
    open: boolean;
    message: string;
    severity: "success" | "error";
}

export function useEventEditor(id: string | undefined) {
    const navigate = useNavigate();

    // Loading / saving
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // User
    const [user, setUser] = useState<any>(null);

    // Event data
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

    // Ticket categories & attendees
    const [categories, setCategories] = useState<any[]>([]);
    const [attendees, setAttendees] = useState<any[]>([]);

    // QR scanner
    const [scannerOpen, setScannerOpen] = useState(false);
    const scannerRef = useRef<any>(null);

    // Snackbar
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: "",
        severity: "success",
    });

    useEffect(() => {
        fetchUser();
        fetchEvent();
        fetchAttendees();
    }, [id]);

    const fetchUser = async () => {
        try {
            const res = await api.get("/api/user/profile/");
            setUser(res.data);
        } catch (err) {
            console.error("Error fetching user profile", err);
        }
    };

    const fetchEvent = async () => {
        if (!id) return;
        try {
            const res = await api.get(`/api/event/${id}/`);
            const d = res.data;
            setEvent(d);
            setTitle(d.title);
            setDescription(d.description);
            setLocation(d.location);
            setLatitude(d.latitude);
            setLongitude(d.longitude);
            setCountryCode(d.country_code || "");
            setEventDate(d.date || "");
            setStartTime(d.start_time ? d.start_time.substring(0, 5) : "");
            setEndTime(d.end_time ? d.end_time.substring(0, 5) : "");
            setBackgroundColor(d.background_color || "#FFFFFF");
            setTicketClauses(d.ticket_clauses || "");
            setCategories(d.ticket_categories || []);
        } catch {
            setSnackbar({ open: true, message: "Errore nel caricamento dell'evento", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendees = async () => {
        if (!id) return;
        try {
            const res = await api.get(`/api/tickets/event/${id}/`);
            setAttendees(res.data);
        } catch (err) {
            console.error("Error fetching attendees", err);
        }
    };

    const handleLocationSelect = (data: LocationData) => {
        setLocation(data.address);
        setLatitude(data.latitude);
        setLongitude(data.longitude);
        setCountryCode(data.country_code);
    };

    const handleEventSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("location", location);
            if (latitude !== null) formData.append("latitude", String(latitude));
            if (longitude !== null) formData.append("longitude", String(longitude));
            if (countryCode) formData.append("country_code", countryCode);
            if (eventDate) formData.append("date", eventDate);
            if (startTime) formData.append("start_time", startTime);
            if (endTime) formData.append("end_time", endTime);
            formData.append("background_color", backgroundColor);
            formData.append("ticket_clauses", ticketClauses);
            if (posterImage) formData.append("poster_image", posterImage);
            if (heroImage) formData.append("hero_image", heroImage);
            if (organizerLogo) formData.append("organizer_logo", organizerLogo);

            await api.patch(`/api/event/update/${id}/`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setSnackbar({ open: true, message: "Evento aggiornato con successo!", severity: "success" });
            fetchEvent();
        } catch (error: any) {
            const errData = error.response?.data;
            let msg = "Errore durante l'aggiornamento";
            if (errData && typeof errData === "object") {
                const messages = Object.entries(errData).map(([k, v]) => `${k}: ${v}`).join("\n");
                if (messages) msg = messages;
            }
            setSnackbar({ open: true, message: msg, severity: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!id) return;
        try {
            await api.patch(`/api/event/update/${id}/`, { status: "PUBLISHED" });
            setSnackbar({ open: true, message: "Evento pubblicato!", severity: "success" });
            fetchEvent();
        } catch (error: any) {
            const errData = error.response?.data;
            let msg = "Impossibile pubblicare";
            if (errData && typeof errData === "object") {
                const messages = Object.entries(errData).map(([k, v]) => `${k}: ${v}`).join("\n");
                if (messages) msg = messages;
            }
            setSnackbar({ open: true, message: msg, severity: "error" });
        }
    };

    const handleArchive = async () => {
        if (!id) return;
        if (!window.confirm("Sei sicuro di voler archiviare questo evento?")) return;
        try {
            await api.patch(`/api/event/update/${id}/`, { status: "ARCHIVED" });
            setSnackbar({ open: true, message: "Evento archiviato!", severity: "success" });
            fetchEvent();
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.response?.data?.detail || "Errore nell'archiviazione",
                severity: "error",
            });
        }
    };

    const handleForceStatus = async (newStatus: string) => {
        if (!id) return;
        try {
            await api.patch(`/api/event/${id}/force-status/`, { status: newStatus });
            setSnackbar({ open: true, message: `Stato cambiato a ${newStatus}`, severity: "success" });
            fetchEvent();
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.response?.data?.error || "Errore nel cambio stato",
                severity: "error",
            });
        }
    };

    const handleDeleteCategory = async (catId: number) => {
        if (!window.confirm("Sei sicuro di voler eliminare questa categoria?")) return;
        try {
            await api.delete(`/api/tickets/categories/delete/${catId}/`);
            setSnackbar({ open: true, message: "Categoria eliminata!", severity: "success" });
            fetchEvent();
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.[0] || "Errore durante l'eliminazione",
                severity: "error",
            });
        }
    };

    const validateTicket = async (codeOrId: string | number, isCode = true) => {
        try {
            const payload = isCode ? { ticket_code: codeOrId } : { ticket_id: codeOrId };
            const res = await api.post("/api/tickets/validate/", payload);
            setSnackbar({
                open: true,
                message: res.data.message + " per " + res.data.owner_name,
                severity: "success",
            });
            fetchAttendees();
            if (scannerOpen) stopScanner();
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.error || "Errore nella validazione",
                severity: "error",
            });
        }
    };

    const startScanner = () => {
        setScannerOpen(true);
        setTimeout(() => {
            const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
            scanner.render(
                (decodedText: string) => { scanner.clear(); validateTicket(decodedText, true); },
                () => {}
            );
            scannerRef.current = scanner;
        }, 100);
    };

    const stopScanner = () => {
        if (scannerRef.current) scannerRef.current.clear();
        setScannerOpen(false);
    };

    return {
        // State
        loading, saving, user, event,
        title, setTitle,
        description, setDescription,
        location, setLocation,
        latitude, longitude, countryCode,
        eventDate, setEventDate,
        startTime, setStartTime,
        endTime, setEndTime,
        backgroundColor, setBackgroundColor,
        ticketClauses, setTicketClauses,
        posterImage, setPosterImage,
        heroImage, setHeroImage,
        organizerLogo, setOrganizerLogo,
        categories,
        attendees,
        scannerOpen,
        snackbar, setSnackbar,
        // Actions
        fetchEvent,
        handleLocationSelect,
        handleEventSubmit,
        handlePublish,
        handleArchive,
        handleForceStatus,
        handleDeleteCategory,
        validateTicket,
        startScanner,
        stopScanner,
        navigate,
    };
}
