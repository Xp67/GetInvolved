import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import BuildIcon from "@mui/icons-material/Build";
import BusinessIcon from "@mui/icons-material/Business";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import type { ComponentType } from "react";

export interface ProfileSection {
    id: string;
    label: string;
    icon: React.ReactElement;
    component: ComponentType<unknown>;
    show?: boolean;
}

/**
 * Build the profile section config for a given app variant.
 *
 * @param variant   "admin" includes OrganizerData; "client" includes MyTickets.
 * @param sections  Map of section components — pass only the ones available in your app.
 */
export function buildProfileConfig(
    variant: "admin" | "client",
    sections: {
        PersonalInfo: ComponentType<unknown>;
        Affiliations: ComponentType<unknown>;
        DevOnboarding: ComponentType<unknown>;
        OrganizerData?: ComponentType<unknown>;
        MyTickets?: ComponentType<unknown>;
    }
): ProfileSection[] {
    const base: ProfileSection[] = [
        {
            id: "personal_info",
            label: "Informazioni Personali",
            icon: <PersonIcon />,
            component: sections.PersonalInfo,
        },
        {
            id: "affiliated_users",
            label: variant === "admin" ? "Utenti Affiliati" : "Affiliazioni",
            icon: <PeopleIcon />,
            component: sections.Affiliations,
        },
    ];

    if (variant === "admin" && sections.OrganizerData) {
        base.push({
            id: "organizer_data",
            label: "Dati Organizzatore",
            icon: <BusinessIcon />,
            component: sections.OrganizerData,
        });
    }

    if (variant === "client" && sections.MyTickets) {
        base.push({
            id: "my_tickets",
            label: "I Miei Biglietti",
            icon: <ConfirmationNumberIcon />,
            component: sections.MyTickets,
        });
    }

    base.push({
        id: "dev_onboarding",
        label: "Dev: Onboarding",
        icon: <BuildIcon />,
        component: sections.DevOnboarding,
    });

    return base;
}
