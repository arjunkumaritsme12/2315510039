import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Navbar from './components/common/Navbar';
import AllNotificationsPage from './pages/AllNotificationsPage';
import PriorityInboxPage from './pages/PriorityInboxPage';

const theme = createTheme({
  palette: {
    primary: { main: '#1a237e' },
    secondary: { main: '#ff6f00' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
  },
  components: {
    MuiCard: {
      defaultProps: { elevation: 2 },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<AllNotificationsPage />} />
          <Route path="/priority" element={<PriorityInboxPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
