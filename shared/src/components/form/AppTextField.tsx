import { TextField, TextFieldProps } from '@mui/material';

export type AppTextFieldProps = TextFieldProps;

const defaultSx = {
    minWidth: 0,
    '& .MuiInputLabel-shrink': {
        bgcolor: 'background.paper',
        px: 0.5,
    },
};

export function AppTextField({ sx, ...props }: AppTextFieldProps) {
    const multilineFixSx = props.multiline
        ? {
            "& .MuiInputBase-root": { height: "auto", alignItems: "flex-start" },
            "& .MuiOutlinedInput-root": { height: "auto" },
            "& textarea": { overflowY: "auto", resize: "none" },
        }
        : {};

    return (
        <TextField
            {...props}
            sx={[
                defaultSx,
                multilineFixSx,
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        />
    );
}

export default AppTextField;
