import { createTheme } from '@mui/material/styles';

const createAppTheme = () => createTheme({
  palette: {
    primary: { main: '#0EA5E9', dark: '#0284C7', light: '#38BDF8' },
    secondary: { main: '#14B8A6', dark: '#0D9488' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    text: { primary: '#0F172A', secondary: '#64748B' },
    success: { main: '#22C55E' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    h1: { fontFamily: "'Sora', sans-serif", fontWeight: 800 },
    h2: { fontFamily: "'Sora', sans-serif", fontWeight: 700 },
    h3: { fontFamily: "'Sora', sans-serif", fontWeight: 700 },
    h4: { fontFamily: "'Sora', sans-serif", fontWeight: 600 },
    h5: { fontFamily: "'Sora', sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Sora', sans-serif", fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12, padding: '10px 24px', fontWeight: 600 },
        contained: {
          background: '#0EA5E9',
          boxShadow: '0 4px 14px rgba(14,165,233,0.3)',
          '&:hover': { background: '#0284C7', boxShadow: '0 6px 20px rgba(14,165,233,0.4)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover fieldset': { borderColor: '#0EA5E9' },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
  },
});

export default createAppTheme;
