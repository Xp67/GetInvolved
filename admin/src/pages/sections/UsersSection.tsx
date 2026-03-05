import { Box, Typography } from "@mui/material";
import UsersManagement from "../../components/UsersManagement";

interface UsersSectionProps {
    userPermissions: string[] | undefined;
}

export default function UsersSection({ userPermissions }: UsersSectionProps) {
    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">Gestione Utenti</Typography>
            </Box>
            <UsersManagement userPermissions={userPermissions} />
        </Box>
    );
}
