import React from 'react';
import {
    Box, List, ListItemButton, ListItemIcon, ListItemText, Typography,
} from '@mui/material';

export interface SidebarItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    show?: boolean;
}

interface AppSidebarProps {
    title?: string;
    items: SidebarItem[];
    activeItem: string;
    onItemChange: (itemId: string) => void;
}

function AppSidebar({ title, items, activeItem, onItemChange }: AppSidebarProps) {
    const visibleItems = items.filter((item) => item.show !== false);

    return (
        <Box sx={{ p: 3 }}>
            {title && (
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 4, px: 2 }}>
                    {title}
                </Typography>
            )}
            <List component="nav" sx={{ '& .MuiListItemButton-root': { borderRadius: 2, mb: 1, px: 2 } }}>
                {visibleItems.map((item) => (
                    <ListItemButton
                        key={item.id}
                        selected={activeItem === item.id}
                        onClick={() => onItemChange(item.id)}
                        sx={{
                            '&.Mui-selected': {
                                bgcolor: 'primary.light',
                                color: 'primary.main',
                                '& .MuiListItemIcon-root': { color: 'primary.main' },
                                '&:hover': { bgcolor: 'primary.light' },
                            },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                                fontWeight: activeItem === item.id ? 'bold' : 'medium',
                            }}
                        />
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );
}

export default AppSidebar;
