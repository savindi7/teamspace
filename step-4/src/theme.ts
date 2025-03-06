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
    components: {
        MuiInputBase: {
            styleOverrides: {
                root: {
                    "& input:-webkit-autofill": {
                      boxShadow: "0 0 0px 1000px white inset",
                      WebkitTextFillColor: "#000",
                      transition: "background-color 5000s ease-in-out 0s",
                      caretColor: "#000"
                    },
                },
            },
        },
    }
});

export default theme;
