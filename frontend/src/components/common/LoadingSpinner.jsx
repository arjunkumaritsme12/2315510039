import { Box, CircularProgress, Typography } from '@mui/material';

export default function LoadingSpinner({ message = 'Loading notifications...' }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 2 }}>
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">{message}</Typography>
    </Box>
  );
}
