import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, IconButton, Toolbar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Get the client URL from env or use a fallback
const CLIENT_BASE_URL = import.meta.env.VITE_CLIENT_URL || 'http://localhost:3001';

function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const filterParam = searchParams.get('filter') || 'active';

    const handleBack = () => navigate(`/dashboard?filter=${filterParam}`);

    // Construct the URL to the client app with the preview parameter
    const iframeUrl = `${CLIENT_BASE_URL}/event/${id}?preview=true`;

    return (
        <Box sx={{
            height: 'calc(100vh - 64px)', // Adjust based on your layout's header height
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
        }}>
            {/* Top Toolbar for Back Button */}
            <Toolbar
                variant="dense"
                sx={{
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    position: 'relative',
                    zIndex: 10,
                }}
            >
                <IconButton onClick={handleBack} sx={{ mr: 2, bgcolor: 'background.paper', boxShadow: 1, border: '1px solid', borderColor: 'divider' }}>
                    <ArrowBackIcon />
                </IconButton>
                {/* Optional: Add a title here like "Anteprima Cliente" */}
                {/* <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                     Anteprima Evento Cliente
                </Typography> */}
            </Toolbar>

            {/* Iframe Loading the Client App */}
            <Box sx={{ flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
                <iframe
                    src={iframeUrl}
                    title="Client Event Preview"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none',
                    }}
                    allow="geolocation; microphone; camera; display-capture"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
            </Box>
        </Box>
    );
}

export default EventDetail;
