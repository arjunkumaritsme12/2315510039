import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#1a237e' }}>
      <Toolbar>
        <NotificationsIcon sx={{ mr: 1.5 }} />
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          AffordMed Notifications
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color="inherit"
            startIcon={<NotificationsIcon />}
            onClick={() => navigate('/')}
            variant={location.pathname === '/' ? 'outlined' : 'text'}
          >
            All Notifications
          </Button>
          <Button
            color="inherit"
            startIcon={<StarIcon />}
            onClick={() => navigate('/priority')}
            variant={location.pathname === '/priority' ? 'outlined' : 'text'}
          >
            Priority Inbox
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
