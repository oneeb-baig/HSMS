import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4f46e5', // Modern Indigo/Purple
      dark: '#1e1b4b', // Deep Navy for Sidebar
    },
    background: {
      default: '#f8fafc', // Light gray background
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 12, // Rounded corners like the image
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default theme;