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
    label?: string;
    placeholder?: string;
}

interface NominatimAddress {
    house_number?: string;
    road?: string;
    street?: string;
    pedestrian?: string;
    footway?: string;
    cycleway?: string;
    path?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    suburb?: string;
    hamlet?: string;
    neighbourhood?: string;
    quarter?: string;
    city_district?: string;
}

interface NominatimResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    address?: NominatimAddress;
}

interface SuggestionItem {
    place_id: number;
    lat: string;
    lon: string;
    raw: NominatimResult;
    cleanLabel: string;
}

function normalizeSpaces(value: string): string {
    return value.replace(/\s+/g, ' ').replace(/\s+,/g, ',').trim();
}

function extractHouseNumber(input: string): string {
    const match = input.match(/\b(\d+[A-Za-z]?(?:\/[A-Za-z0-9]+)?(?:-\d+)?)\b/);
    return match ? match[1].trim() : '';
}

function removeHouseNumberFromStreet(input: string): string {
    return normalizeSpaces(
        input.replace(/\b\d+[A-Za-z]?(?:\/[A-Za-z0-9]+)?(?:-\d+)?\b/g, '').trim()
    );
}

function splitQueryParts(query: string): string[] {
    return query
        .split(',')
        .map((part) => normalizeSpaces(part))
        .filter(Boolean);
}

function getStreetName(address?: NominatimAddress): string {
    if (!address) return '';
    return (
        address.road ||
        address.street ||
        address.pedestrian ||
        address.footway ||
        address.cycleway ||
        address.path ||
        ''
    ).trim();
}

function getApiMainCity(address?: NominatimAddress): string {
    if (!address) return '';
    return (
        address.city ||
        address.town ||
        address.municipality ||
        address.village ||
        ''
    ).trim();
}

function parseUserQuery(query: string) {
    const parts = splitQueryParts(query);

    const firstPart = parts[0] || '';
    const secondPart = parts[1] || '';
    const thirdPart = parts[2] || '';

    const userHouseNumber = extractHouseNumber(firstPart);
    const userStreet = removeHouseNumberFromStreet(firstPart);

    // Se l'utente scrive: "Via X 14, Dairago"
    // il comune vero per noi è il secondo pezzo, non quello dell'API
    const userCity = secondPart || '';

    // Se scrive anche CAP o stato in altre parti, li teniamo separati
    const extraParts = [thirdPart, ...parts.slice(3)].filter(Boolean);

    return {
        userStreet,
        userHouseNumber,
        userCity,
        extraParts,
    };
}

function buildCleanAddress(result: NominatimResult, originalQuery: string): string {
    const address = result.address || {};
    const parsed = parseUserQuery(originalQuery);

    const apiStreet = getStreetName(address);
    const apiHouseNumber = (address.house_number || '').trim();
    const apiCity = getApiMainCity(address);
    const postcode = (address.postcode || '').trim();
    const country = (address.country || '').trim();

    // Regola forte:
    // 1. se l'utente ha scritto via e comune, prevalgono loro
    // 2. l'API serve per completare dove manca qualcosa
    const finalStreet = parsed.userStreet || apiStreet;
    const finalHouseNumber = apiHouseNumber || parsed.userHouseNumber;
    const finalCity = parsed.userCity || apiCity;

    const line1 = normalizeSpaces(
        [finalStreet, finalHouseNumber].filter(Boolean).join(' ')
    );

    const line2 = normalizeSpaces(
        [finalCity, postcode].filter(Boolean).join(', ')
    );

    const line3 = normalizeSpaces(
        [...parsed.extraParts, country].filter(Boolean).join(', ')
    );

    const clean = [line1, line2, line3].filter(Boolean).join(', ').trim();

    return clean || normalizeSpaces(originalQuery);
}

function AddressAutocomplete({
    value,
    onChange,
    label = 'Indirizzo',
    placeholder = 'Cerca un indirizzo...',
}: AddressAutocompleteProps) {
    const [inputValue, setInputValue] = useState(value || '');
    const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
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
                {
                    headers: {
                        'Accept-Language': 'it',
                    },
                }
            );

            if (!res.ok) {
                throw new Error('Errore nella chiamata a Nominatim');
            }

            const data: NominatimResult[] = await res.json();

            const cleanedSuggestions: SuggestionItem[] = data
                .map((item) => ({
                    place_id: item.place_id,
                    lat: item.lat,
                    lon: item.lon,
                    raw: item,
                    cleanLabel: buildCleanAddress(item, trimmedQuery),
                }))
                .filter((item) => item.cleanLabel.trim().length > 0);

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

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            searchAddress(val);
        }, 400);
    };

    const handleSelect = (suggestion: SuggestionItem) => {
        setInputValue(suggestion.cleanLabel);
        onChange(suggestion.cleanLabel);
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
                onFocus={() => {
                    if (suggestions.length > 0) {
                        setOpen(true);
                    }
                }}
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
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 1300,
                        mt: 0.5,
                        maxHeight: 250,
                        overflow: 'auto',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <List dense disablePadding>
                        {suggestions.map((suggestion) => (
                            <ListItemButton
                                key={suggestion.place_id}
                                onClick={() => handleSelect(suggestion)}
                                sx={{
                                    py: 1.5,
                                    px: 2,
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    },
                                }}
                            >
                                <LocationOnIcon
                                    sx={{
                                        mr: 1.5,
                                        color: 'text.secondary',
                                        fontSize: 20,
                                    }}
                                />
                                <ListItemText
                                    primary={
                                        <Typography variant="body2" noWrap>
                                            {suggestion.cleanLabel}
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