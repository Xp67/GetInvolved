import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import AppTheme from '../contexts/theme/AppTheme';
import App from './App';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppTheme>
            <CssBaseline enableColorScheme />
            <App />
        </AppTheme>
    </StrictMode>,
);
