import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';

import PersonalInfo from '../PersonalInfo';
import Affiliations from '../Affiliations';
import OrganizerData from '../OrganizerData';

export const ProfileConfig = [
    {
        id: 'personal_info',
        label: 'Informazioni Personali',
        icon: <PersonIcon />,
        component: PersonalInfo,
    },
    {
        id: 'affiliated_users',
        label: 'Utenti Affiliati',
        icon: <PeopleIcon />,
        component: Affiliations,
    },
    {
        id: 'organizer_data',
        label: 'Dati Organizzatore',
        icon: <BusinessIcon />,
        component: OrganizerData,
    }
];
