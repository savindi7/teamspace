'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    cssVariables: true,
    typography: {
        fontFamily: 'var(--font-roboto)',
    },
    palette: {
        primary: {
            main: '#483D8B',
        },
        secondary: {
            main: '#D6A829',
        },
    },
});

export default theme;
