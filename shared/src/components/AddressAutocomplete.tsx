import { useState, useEffect, useRef } from 'react';
import {
    TextField,
    Paper,
    List,
    ListItemButton,
    ListItemText,
    CircularProgress,
    Box,
    InputAdornment,
    Typography,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface AddressAutocompleteProps {
    value: string;
    onChange: (address: string) => void;
    onLocationSelect?: (data: LocationData) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
}

interface NominatimAddress {
    house_number?: string;
    road?: string;
    street?: string;
    pedestrian?: string;
    footway?: string;
    cycleway?: string;
    path?: string;
    suburb?: string;
    city_district?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
}

interface NominatimResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    address?: NominatimAddress;
}

export interface LocationData {
    place_id: number;
    address: string;
    latitude: number | null;
    longitude: number | null;
    country_code: string;
    raw: NominatimResult;
}

function normalize(val: string | undefined): string {
    return (val || '').trim();
}

function extractHouseNumber(query: string): string {
    const match = query.match(/\b(\d+[A-Za-z]?)\b/);
    return match ? match[1] : '';
}

function buildCleanAddress(result: NominatimResult, originalQuery: string): string {
    const addr = result.address || {};

    const street = normalize(addr.road || addr.street || addr.pedestrian || addr.footway || addr.path);

    let houseNumber = normalize(addr.house_number);
    if (!houseNumber) {
        houseNumber = extractHouseNumber(originalQuery);
    }

    const city = normalize(addr.city || addr.town || addr.village || addr.municipality);
    const province = normalize(addr.state || addr.county);
    const zip = normalize(addr.postcode);
    const country = normalize(addr.country);

    const parts = [street, houseNumber, city, province, zip, country].filter(Boolean);
    return parts.join(', ');
}

function AddressAutocomplete({
    value,
    onChange,
    onLocationSelect,
    label = 'Indirizzo',
    placeholder = 'Cerca un indirizzo...',
    disabled = false,
}: AddressAutocompleteProps) {
    const [inputValue, setInputValue] = useState(value || '');
    const [suggestions, setSuggestions] = useState<LocationData[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchAddress = async (query: string) => {
        const trimmedQuery = query.trim();
        if (trimmedQuery.length < 3) {
            setSuggestions([]);
            setOpen(false);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(trimmedQuery)}&limit=5&addressdetails=1`,
                { headers: { 'Accept-Language': 'it' } }
            );
            if (!res.ok) throw new Error('Errore nella chiamata a Nominatim');

            const data: NominatimResult[] = await res.json();
            const cleanedSuggestions: LocationData[] = data.map((item) => ({
                place_id: item.place_id,
                address: buildCleanAddress(item, trimmedQuery),
                latitude: item.lat ? Number(item.lat) : null,
                longitude: item.lon ? Number(item.lon) : null,
                country_code: item.address?.country_code || '',
                raw: item,
            }));

            setSuggestions(cleanedSuggestions);
            setOpen(cleanedSuggestions.length > 0);
        } catch (error) {
            console.error('Errore autocomplete indirizzo:', error);
            setSuggestions([]);
            setOpen(false);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        onChange(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => searchAddress(val), 400);
    };

    const handleSelect = (suggestion: LocationData) => {
        setInputValue(suggestion.address);
        onChange(suggestion.address);
        onLocationSelect?.(suggestion);
        setSuggestions([]);
        setOpen(false);
    };

    return (
        <Box ref={containerRef} sx={{ position: 'relative', width: '100%' }}>
            <TextField
                fullWidth
                label={label}
                placeholder={placeholder}
                value={inputValue}
                onChange={handleInputChange}
                disabled={disabled}
                onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <LocationOnIcon color="primary" />
                            </InputAdornment>
                        ),
                        endAdornment: loading ? (
                            <InputAdornment position="end">
                                <CircularProgress size={20} />
                            </InputAdornment>
                        ) : null,
                    },
                }}
            />
            {open && suggestions.length > 0 && (
                <Paper
                    elevation={8}
                    sx={{
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1300,
                        mt: 0.5, maxHeight: 250, overflow: 'auto', borderRadius: 2,
                        border: '1px solid', borderColor: 'divider',
                    }}
                >
                    <List dense disablePadding>
                        {suggestions.map((suggestion) => (
                            <ListItemButton
                                key={suggestion.place_id}
                                onClick={() => handleSelect(suggestion)}
                                sx={{ py: 1.5, px: 2, '&:hover': { bgcolor: 'action.hover' } }}
                            >
                                <LocationOnIcon sx={{ mr: 1.5, color: 'text.secondary', fontSize: 20 }} />
                                <ListItemText
                                    primary={
                                        <Typography variant="body2" noWrap>
                                            {suggestion.address}
                                        </Typography>
                                    }
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </Paper>
            )}
        </Box>
    );
}

export default AddressAutocomplete;
