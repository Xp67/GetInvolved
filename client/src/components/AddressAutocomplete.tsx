import { useState, useEffect, useRef } from 'react';
import {
    TextField, Paper, List, ListItemButton, ListItemText,
    CircularProgress, Box, InputAdornment, Typography,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface AddressAutocompleteProps {
    value: string;
    onChange: (address: string) => void;
    label?: string;
    placeholder?: string;
}

interface NominatimResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

function AddressAutocomplete({ value, onChange, label = 'Indirizzo', placeholder = 'Cerca un indirizzo...' }: AddressAutocompleteProps) {
    const [inputValue, setInputValue] = useState(value || '');
    const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
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
        if (query.length < 3) {
            setSuggestions([]);
            setOpen(false);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
                {
                    headers: {
                        'Accept-Language': 'it',
                    },
                }
            );
            const data: NominatimResult[] = await res.json();
            setSuggestions(data);
            setOpen(data.length > 0);
        } catch {
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

    const handleSelect = (result: NominatimResult) => {
        setInputValue(result.display_name);
        onChange(result.display_name);
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
                        {suggestions.map((result) => (
                            <ListItemButton
                                key={result.place_id}
                                onClick={() => handleSelect(result)}
                                sx={{
                                    py: 1.5,
                                    px: 2,
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    },
                                }}
                            >
                                <LocationOnIcon sx={{ mr: 1.5, color: 'text.secondary', fontSize: 20 }} />
                                <ListItemText
                                    primary={
                                        <Typography variant="body2" noWrap>
                                            {result.display_name}
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
