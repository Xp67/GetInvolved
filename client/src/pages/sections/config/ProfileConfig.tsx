import { buildProfileConfig } from "@shared/profileSections";

import PersonalInfo from "../PersonalInfo";
import Affiliations from "../Affiliations";
import MyTickets from "../MyTickets";
import DevOnboarding from "../DevOnboarding";

export const ProfileConfig = buildProfileConfig("client", {
    PersonalInfo,
    Affiliations,
    MyTickets,
    DevOnboarding,
});
