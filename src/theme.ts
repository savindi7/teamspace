'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    cssVariables: true,
    typography: {
        fontFamily: 'var(--font-roboto)',
    },
    palette: {
        primary: {
            main: '#6200EE',
        },
        secondary: {
            main: '#03DAC6',
        },
    },
});

export default theme;
