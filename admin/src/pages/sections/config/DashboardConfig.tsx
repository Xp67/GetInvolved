import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";

import EventsSection from "../Events";
import UsersSection from "../UsersSection";
import RolesSection from "../RolesSection";
import { canAccessSection } from "../../../utils/permissionUtils";

export const DashboardConfig = (user: any) => [
    {
        id: 'eventi',
        label: 'Eventi',
        icon: <EventIcon />,
        component: EventsSection,
        show: canAccessSection(user, 'eventi')
    },
    {
        id: 'utenti',
        label: 'Utenti',
        icon: <PeopleIcon />,
        component: UsersSection,
        show: canAccessSection(user, 'utenti')
    },
    {
        id: 'ruoli',
        label: 'Ruoli e Permessi',
        icon: <SecurityIcon />,
        component: RolesSection,
        show: canAccessSection(user, 'ruoli')
    }
];
