import { Box, Typography } from "@mui/material";
import RolesManagement from "../../components/RolesManagement";

interface RolesSectionProps {
    userPermissions: string[] | undefined;
}

export default function RolesSection({ userPermissions }: RolesSectionProps) {
    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">Gestione Ruoli e Permessi</Typography>
            </Box>
            <RolesManagement userPermissions={userPermissions} />
        </Box>
    );
}
