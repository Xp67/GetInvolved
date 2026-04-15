import { buildProfileConfig } from "@shared/profileSections";

import PersonalInfo from "../PersonalInfo";
import Affiliations from "../Affiliations";
import OrganizerData from "../OrganizerData";
import DevOnboarding from "../DevOnboarding";

export const ProfileConfig = buildProfileConfig("admin", {
    PersonalInfo,
    Affiliations,
    OrganizerData,
    DevOnboarding,
});
