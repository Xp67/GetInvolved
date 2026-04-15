import { FormControl, InputLabel, Select, SelectProps, FormControlProps, FormHelperText } from '@mui/material';

export type AppSelectFieldProps<T = unknown> = SelectProps<T> & {
    label: string;
    helperText?: string;
    formControlProps?: FormControlProps;
};

const defaultSx = {
    minWidth: 120,
    '& .MuiInputLabel-shrink': {
        bgcolor: 'background.paper',
        px: 0.5,
    },
};

export function AppSelectField<T = unknown>({
    label,
    helperText,
    formControlProps,
    children,
    sx,
    id,
    labelId,
    ...props
}: AppSelectFieldProps<T>) {
    const defaultId = id || `select-${label.replace(/\s+/g, '-').toLowerCase()}`;
    const defaultLabelId = labelId || `${defaultId}-label`;

    return (
        <FormControl
            size={props.size || 'small'}
            fullWidth={props.fullWidth}
            variant={props.variant || 'outlined'}
            {...formControlProps}
            sx={[defaultSx, ...(Array.isArray(sx) ? sx : [sx])]}
        >
            <InputLabel id={defaultLabelId}>{label}</InputLabel>
            <Select
                labelId={defaultLabelId}
                id={defaultId}
                label={label}
                {...props}
            >
                {children}
            </Select>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
}

export default AppSelectField;
