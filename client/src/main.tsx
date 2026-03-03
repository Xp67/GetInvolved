import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AppTheme from '../contexts/theme/AppTheme';
import CssBaseline from '@mui/material/CssBaseline';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AppTheme>
            <CssBaseline enableColorScheme />
            <App />
        </AppTheme>
    </React.StrictMode>,
);
