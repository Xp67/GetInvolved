import InfoIcon from '@mui/icons-material/Info';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

import GeneralInfo from "../GeneralInfo";
import Ticketing from "../Ticketing";
import CheckIn from "../CheckIn";

export const EventEditConfig = () => [
    {
        id: 'general',
        label: 'Info Generali',
        icon: <InfoIcon />,
        component: GeneralInfo,
        show: true
    },
    {
        id: 'tickets',
        label: 'Ticketing',
        icon: <ConfirmationNumberIcon />,
        component: Ticketing,
        show: true
    },
    {
        id: 'checkin',
        label: 'Check-in',
        icon: <QrCodeScannerIcon />,
        component: CheckIn,
        show: true
    }
];
