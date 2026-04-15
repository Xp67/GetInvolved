import { TextField, TextFieldProps } from '@mui/material';

export type AppDateFieldProps = Omit<TextFieldProps, 'type'> & {
    type?: 'date' | 'datetime-local' | 'time';
};

const defaultSx = {
    minWidth: 0,
    '& .MuiInputLabel-shrink': {
        bgcolor: 'background.paper',
        px: 0.5,
    },
};

export function AppDateField({ type = 'date', InputLabelProps, sx, ...props }: AppDateFieldProps) {
    return (
        <TextField
            type={type}
            InputLabelProps={{ shrink: true, ...InputLabelProps }}
            {...props}
            sx={[defaultSx, ...(Array.isArray(sx) ? sx : [sx])]}
        />
    );
}

export default AppDateField;
