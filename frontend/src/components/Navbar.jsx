import React, { useState } from 'react';
import { AppBar, Box, Drawer, IconButton, List, ListItemButton, ListItemText, Stack, Toolbar, Typography, Switch, FormControlLabel } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'All Notifications', path: '/notifications' },
  { label: 'Priority Inbox', path: '/priority' },
];

export default function Navbar({ darkMode, onDarkModeToggle }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const drawer = (
    <Box sx={{ width: 240, p: 2 }} role="presentation" onClick={() => setOpen(false)}>
      <Typography variant="h6" sx={{ mb: 2 }}>AffordMed</Typography>
      <List>
        {navItems.map((item) => (
          <ListItemButton key={item.path} component={RouterLink} to={item.path} selected={location.pathname === item.path}>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" color="primary" elevation={2}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setOpen(true)} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            AffordMed Notifications
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((item) => (
              <Typography key={item.path} component={RouterLink} to={item.path} sx={{ color: 'white', textDecoration: 'none', fontWeight: location.pathname === item.path ? 700 : 400 }}>
                {item.label}
              </Typography>
            ))}
          </Stack>
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={onDarkModeToggle} color="secondary" />}
            label="Dark"
            sx={{ ml: 2, color: 'white' }}
          />
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        {drawer}
      </Drawer>
    </>
  );
}
