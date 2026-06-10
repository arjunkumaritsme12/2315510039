import { useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Navbar from './components/Navbar';
import AllNotifications from './pages/AllNotifications';
import PriorityInbox from './pages/PriorityInbox';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
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
  }), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Navbar darkMode={darkMode} onDarkModeToggle={() => setDarkMode((value) => !value)} />
        <Routes>
          <Route path="/" element={<Navigate to="/notifications" replace />} />
          <Route path="/notifications" element={<AllNotifications />} />
          <Route path="/priority" element={<PriorityInbox />} />
          <Route path="*" element={<Navigate to="/notifications" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
