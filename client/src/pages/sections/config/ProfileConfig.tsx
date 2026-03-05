import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

import PersonalInfo from '../PersonalInfo';
import Affiliations from '../Affiliations';
import MyTickets from '../MyTickets';

export const ProfileConfig = [
    {
        id: 'personal_info',
        label: 'Informazioni Personali',
        icon: <PersonIcon />,
        component: PersonalInfo
    },
    {
        id: 'affiliated_users',
        label: 'Affiliazioni',
        icon: <PeopleIcon />,
        component: Affiliations
    },
    {
        id: 'my_tickets',
        label: 'I Miei Biglietti',
        icon: <ConfirmationNumberIcon />,
        component: MyTickets
    }
];
