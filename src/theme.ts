'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    cssVariables: true,
    typography: {
        fontFamily: 'var(--font-roboto)',
    },
    palette: {
        primary: {
            main: '#6C3BAA',
        },
        secondary: {
            main: '#D6A829',
        },
    },
});

export default theme;
